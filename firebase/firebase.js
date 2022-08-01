const firebase  = require('firebase/app')
const firAuth = {
    getAuth,
    signOut,
    signInWithEmailAndPassword

}   = require('firebase/auth')
const config    = require('./config')

//* Initialize Firebase
firebase.initializeApp(config.firConfig)

module.exports = {firebase, firAuth}
