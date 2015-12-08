var config = {
  ip: process.env.IP || "0.0.0.0",
  port: process.env.PORT || 3000,
  siteBase: 'http://music-hub-backend-mmis1000.c9.io/',
  mongodbPath: "mongodb://localhost/music-hub",
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
  gmail: {
    GMAIL_ACCOUNT: process.env.GMAIL_ACCOUNT,
    GMAIL_PASSWORD: process.env.GMAIL_PASSWORD
  },
  auth: {
    email: {
      salt: "music-hub"
    },
    facebook: {
      FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID,
      FACEBOOK_APP_SECRET: process.env.FACEBOOK_APP_SECRET,
      callbackURL: 'http://music-hub-backend-mmis1000.c9.io/auth/facebook/callback'
    },
    google: {
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://music-hub-backend-mmis1000.c9.io/auth/google/callback'
    }
  }
}
module.exports = config;