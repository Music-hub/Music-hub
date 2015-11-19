#Repo for musichub site

The online interactive music sheet edit and sharing system.

##To Install

Before Install, you need to satisfy the following prerequirement

1. Install `Node.js`, you could find it here [Node.js](https://nodejs.org/en/).
2. Install `Mongodb` or use existed one, you could find it here [Mongodb](https://www.mongodb.org/)
3. If on windows, configure the `PATH` to make the terminal could find `node` and `npm` (The installer should had do this for you)
4. Follow this [section](https://github.com/mongodb/node-mongodb-native#troubleshooting), make sure you satisfied the requirement to install `node-mongodb-native`

To Install

1. pull down this repo with `git clone <path to this repo>` either with `ssh` or `http`
2. switch into the directory
3. run `git submodule foreach git pull origin master` to fetch all sub modules
4. run `npm install` to resolve all dependency
5. clone `config.example.js` to `config.js`
6. change the settings in `config.js` to match your setting

To Run

1. start a `mongodb` process or use the one you already have
2. start the server with `node index.js`

##Data Structure

    /--- auth         # where to define all user authentication methods
      |- node_modules # install target of server dependency
      |- events       # define all events that will be send to the client
      |- models       # data schema used to connect to the database
      |- public       # all static web files
      | |-(components)  # install target of client dependency
      |- routes       # where to handle dynamic web content
      |- test         # some tests
      |- utils        # some utils that cannot be classified into any directory
      |- views        # template to render dynamic web page
      |- (components)   # install target of sub repos
      |- .bowerrc     # override the defult install target of bower
      |- .gitignore   # define which file should not be added to the stage area
      |- .gitmoduled  # define sub repos, and path to put the file in
      |- bower.json   # define the client dependency
      |- config.example.js # exmaple for configuration file
      |- package.json # define the server dependency
      |- index.js     # entry of the server
      |- README.md    # this file