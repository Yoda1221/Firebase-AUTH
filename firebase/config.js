const dotenv = require('dotenv')
const assert = require('assert')

dotenv.config()

const {
    //* FIREBASE CONFIG
    APP_ID,
    API_KEY,
    PROJECT_ID,
    DATBASE_URL,
    AUTH_DOMAIN,
    STORAGE_BUCKET,
    MESSAGING_SENDER_ID,
    HOST,
    ACCTOKENSECRET,
    REFTOKENSECRET,
    COOKIENAME
} = process.env

module.exports = {
    host:               HOST,
    accTokenSecret:     ACCTOKENSECRET,
    refTokenSecret:     REFTOKENSECRET,
    cookieName:         COOKIENAME,
    //* FIREBASE CONFIG
    firConfig: {
        appId:              APP_ID,
        apiKey:             API_KEY,
        authDomain:         AUTH_DOMAIN,
        databaseURL:        DATBASE_URL,
        projectId:          PROJECT_ID,
        storageBucket:      STORAGE_BUCKET,
        messagingSenderId:  MESSAGING_SENDER_ID,
    }
}
