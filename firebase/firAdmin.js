const admin = require("firebase-admin")
const serviceAccount = require("./serviceAccountKey.json");
//const dbUrl = ""
try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
        //databaseURL: dbUrl
    })
} catch (e) {
    console.log(e)
}

module.exports = admin
