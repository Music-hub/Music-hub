var mongoose = require('mongoose');
var User = require("../models/user")(mongoose);
var Sheet = require("../models/sheet")(mongoose);
var ChatChannel = require("../models/chat_channel")(mongoose);
var Revision = require("../models/revision")(mongoose);

var DatabaseError = require("../events/database_error");
var ParseError = require("../events/parse_error");

var SheetSuccess = require("../events/sheet_success");
var SheetInfo = require("../events/sheet_info");
var SheetError = require("../events/sheet_error");

var RevisionError = require("../events/revision_error");
var RevisionInfo = require("../events/revision_info");
var RevisionSuccess = require("../events/revision_success");
var assert = require('assert');

function setup(app, config, service, io) {
  function getUserJSON (req, res, next) {
    var sess = req.session;
    User.findOrCreate({
      _id: sess.userId
    }, function (err, userData) {
      if (err) return new DatabaseError(null, null, err.toString());
      req.currentUser = userData;
      next();
    });
    
  }
  function getModelWithIdJSONFactory (Model, name, getIdCallback) {
    return function (req, res, next) {
      var id = getIdCallback(req, res, next);
      Model.findOne({
        _id: id
      }, function (err, doc) {
        if (err) return new DatabaseError(null, null, err.toString());
        req[name] = doc;
        next();
      });
    }
  }
  
  var getSheetJSON = getModelWithIdJSONFactory(Sheet, "currentSheet", function (req, res, next) {
    return req.params.sheetId || req.body.sheetId;
  })
  app.post('/api/sheet/create', getUserJSON, function (req, res, next) {
  
    try {
      if ("string" === typeof req.body.data) {
        req.body.data = JSON.parse(req.body.data);
      }
    } catch (err) {
      return res.json(new ParseError(null, null, err.toString()))
    }
    
    var opts = [
      {path: "sheets"}
    ];
    
    User.populate(req.currentUser, opts, function (err, user) {
      if (err) return res.json(new DatabaseError(null, null, err.toString()));
      console.log(user);
      
      var temp = {};
      
      user.pSave()
      .then(function () {
        var chatChannel = new ChatChannel({
          users: [user],
          sheet: null
        });
        var revision = new Revision({
          sheet: null,
          data: req.body.data,
          comment: {message: "initial commit", by: user.name}
        });
        var sheet = new Sheet({
          name: req.body.name,
          owners: [user],
          chatChannel: [chatChannel._id],
          revisions: [revision._id]
        })
        revision.sheet = sheet._id;
        chatChannel.sheet = sheet._id;
        
        user.sheets.push(sheet._id);
        
        temp = {
          chatChannel: chatChannel,
          revision: revision,
          sheet: sheet
        } 
        return chatChannel.save();
      })
      .then(function () {
        return temp.revision.save();
      })
      .then(function () {
        return temp.sheet.save();
      })
      .then(function (sheet) {
        var opts = [
          {path:"owners", select: 'name'},
          {path:"collaborators", select: 'name'},
          {path:"revisions", select: 'comment'},
          {path:"chatChannel", select: 'name'}
        ];
        return Sheet.populate(sheet, opts);
      })
      .then(function (sheet) {
        temp.sheet = sheet;
        return user.save();
      })
      .then(function () {
        console.log(temp.sheet);
        res.json(new SheetSuccess(null, temp.sheet));
      })
      .catch(function (err) {
        res.json(new DatabaseError(null, null, err.toString()));
      })
    });
  })
  
  app.get('/api/sheet/get/:sheetId', getSheetJSON, function (req, res, next) {
    if(!req.currentSheet) return res.json(new SheetError(null, null, "no such sheet"));
    var opts = [
      {path:"owners", select: 'name'},
      {path:"collaborators", select: 'name'},
      {path:"chatChannel", select: 'name'},
      {path:"revisions", select: 'comment'}
    ];
    Sheet.populate(req.currentSheet, opts, function (err, doc) {
      if (err) return res.json(new DatabaseError(null, null, err.toString()));
      if (!doc) return res.json(new SheetError(null, null, "no such sheet"));
      res.json(new SheetInfo(null, doc));
    })
  })
  
  /*function sheetUpdate(req, res, next) {
    
    var id = req.params.id || req.body.id;
    
    try {
      if ("string" === typeof req.body.data) {
        req.body.data = JSON.parse(req.body.data);
      }
    } catch (err) {
      return res.json(new ParseError(null, null, err.toString()))
    }
    
    
    Sheet.findById(id, function (err, sheet) {
      if (err) return res.json(new DatabaseError(null, null, err.toString()));
      if (!sheet) return res.json(new SheetError(null, null, "no such sheet"));
      
      
      var revision = new Revision({
        sheet: sheet,
        data: req.body.data,
        comment: {message: req.body.message, by: req.currentUser.name}
      });
      
      sheet.revisions.push(revision._id);
      
      revision.save()
      .then(function () {
        return sheet.save();
      })
      .then(function (sheet) {
        res.json(new SheetSuccess(null, sheet));
      })
      .catch(function (err) {
        res.json(new DatabaseError(null, null, err.toString()));
      })
    })
  }
  
  app.post('/api/sheet/update/:id/', getUserJSON, sheetUpdate)
  app.post('/api/sheet/update/', getUserJSON, sheetUpdate)*/
  
  app.post('/api/sheet/update/:sheetId', getUserJSON, getSheetJSON, function(req, res, next) {
    
    try {
      if ("string" === typeof req.body.data) {
        req.body.data = JSON.parse(req.body.data);
      }
    } catch (err) {
      return res.json(new ParseError(null, null, err.toString()))
    }
    
    Sheet.populate(req.currentSheet, {path:"revisions"}, function (err, sheet) {
      if (err) return res.json(new DatabaseError(null, null, err.toString()));
      
      var latestRevision = sheet.revisions[sheet.revisions.length - 1];
      latestRevision.data = req.body.data;
      
      latestRevision.save()
      .then(function (revision) {
        res.json(new RevisionSuccess(null, revision, "revisioned successful"));
      })
      .catch(function (err) {
        res.json(new DatabaseError(null, null, err.toString()));
      })
    });
  })
  
  app.post('/api/sheet/reverse/:sheetId/', getUserJSON, getSheetJSON, function(req, res, next) {
    if(!req.currentSheet) return res.json(new SheetError(null, null, "no such sheet"));
    
    var revisionId = req.body.revision;
    Revision
    .findById(revisionId).exec(function (err, revision) {
      if (err) return res.json(new DatabaseError(null, null, err.toString()));
      if (!revision) return res.json(new SheetError(null, null, "no such revision"));
      if (revision.sheet.toString() !== req.currentSheet._id.toString()) {
        return res.json(new SheetError(null, null, "revision is not in revisions of target sheet"));
      }
      
      var sheet = req.currentSheet;
      var newRevision = revision.clone(req.currentUser);
      sheet.revisions.push(newRevision._id);
      
      newRevision.save()
      .then(function () {
        return sheet.save();
      })
      .then(function () {
        res.json(new SheetSuccess(null, sheet));
      })
      .catch(function (err) {
        res.json(new DatabaseError(null, null, err.toString()));
      })
    })
  })

  app.post('/api/sheet/revision/:sheetId/', getUserJSON, getSheetJSON, function(req, res, next) {
    if(!req.currentSheet) return res.json(new SheetError(null, null, "no such sheet"));
    Sheet.populate(req.currentSheet, {path:"revisions"}, function(err, sheet) {
      if (err) return res.json(new DatabaseError(null, null, err.toString()));
      var newRevision = sheet.revisions[sheet.revisions.length - 1].clone(req.currentUser);
      sheet.revisions.push(newRevision);
      console.log(newRevision.comment.by)
      newRevision.save()
      .then(function () {
        return sheet.save();
      })
      .then(function () {
        var newSheet = sheet.toObject();
        newSheet.revisions = newSheet.revisions.map(function (obj) {
          return {
            _id: obj._id,
            comment: obj.comment
          }
        })
        res.json(new SheetSuccess(null, newSheet));
      })
      .catch(function (err) {
        res.json(new DatabaseError(null, null, err.toString()));
      })
    })
  })

  app.get('/api/revision/get/:id', function getRevision(req, res, next) {
    Revision.findById(req.params.id, function (err, doc) {
      if (err) return res.json(new DatabaseError(null, null, err.toString()));
      if (!doc) return res.json(new RevisionError(null, null, "no such revision"));
      res.json(new RevisionInfo(null, doc));
    })
  })
  
  app.get('/api/sheet/clone/:sheetId', getUserJSON, getSheetJSON, function(req, res, next) {
    if(!req.currentSheet) return res.json(new SheetError(null, null, "no such sheet"));
    Sheet.populate(req.currentSheet, {path:"revisions"}, function(err, sheet) {
      if (err) return res.json(new DatabaseError(null, null, err.toString()));
      var newRevision = sheet.revisions[sheet.revisions.length - 1].clone(req.currentUser);
      
      var oldSheet = sheet;
      
      var chatChannel = new ChatChannel({
        users: [req.currentUser],
        sheet: null
      });
      var sheet = new Sheet({
        name: oldSheet.name,
        owners: [req.currentUser],
        chatChannel: chatChannel._id,
        revisions: oldSheet.revisions.map(function (revision) {
          return revision._id;
        }).slice(0, oldSheet.revisions.length - 1).concat(newRevision._id)
      })
      chatChannel.sheet = sheet._id;
      
      newRevision.save()
      .then(function () {
        return sheet.save();
      })
      .then(function () {
        return chatChannel.save();
      })
      .then(function () {
        req.currentUser.sheets.push(sheet._id);
        console.log(req.currentUser.sheets, sheet._id);
        return req.currentUser.save();
      })
      .then(function () {
        res.json(new SheetSuccess(null, sheet));
      })
      .catch(function (err) {
        res.json(new DatabaseError(null, null, err.toString()));
      })
      
    })
  })
  
  var sio = io.of('/sheet');
  
  sio.use(function(socket, next) {
    service.sessionMiddleware(socket.request, socket.request.res, next);
  });

  sio.on('connection', function (socket) {
    var session = socket.request.session;
    
    function reloadSession (cb) {
      session.reload(function (err) {
        if (err) return cb(err);
        session = socket.request.session;
        cb(null, session);
      })
    }
    
    function findLatestRevision (sheetId) {
      return Sheet.findById(sheetId).exec()
      .then (function (sheet) {
        if (sheet) {
          return Revision.findById(sheet.revisions[sheet.revisions.length - 1]).exec();
        } else {
          throw new Error('no sheet found')
        }
      })
    }
    
    console.log('session id in sio is...' + socket.request.sessionID);
    // console.log(session);
    socket.on('ping', function () {
      reloadSession(function () {
        socket.emit('pong', session);
      })
    })
    socket.on('join', function (roomId) {
      reloadSession(function () {
        console.log('user id ' + session.userId + 'is connected to ' + roomId)
        socket.sheetId = roomId;
        socket.join(roomId);
      })
    })
    
    socket.on('layout_update', function (sheet) {
      console.log('layout_update ' + socket.sheetId);
      sio.to(socket.sheetId).emit('layout_update', sheet);
    })
    socket.on('measure_update', function (index, measure) {
      var revisionId;
      console.log('measure_update ' + socket.sheetId);
      findLatestRevision(socket.sheetId)
      .then (function (revision) {
        revisionId = revision._id;
        var update = {};
        update['data.tracks.' + index[0] + '.measures.' + index[1]] = measure;
        return Revision.update({_id: revision._id}, update).exec();
      })
      .then (function (revision) {
        console.log('sheet ' + socket.sheetId + ' partial update successed')
        console.log('revision id is' + revisionId.toString());
      })
      .catch(function (err) {
        console.error(err);
        console.error(err.stack);
      })
      sio.to(socket.sheetId).emit('measure_update', index, measure);
    })
    socket.on('meta_update', function (index, info) {
      console.log('meta_update ' + socket.sheetId);
      sio.to(socket.sheetId).emit('meta_update', index, info);
    })
    
  })
}

module.exports = setup;