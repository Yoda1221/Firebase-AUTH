const fs            = require('fs')
const axios         = require("axios")
const bodyParser    = require('body-parser')
const jwt           = require('jsonwebtoken')
const config        = require('../firebase/config')
const admin         = require('../firebase/firAdmin')
const services      = require('../services/services')
const {
    firebase, 
    firAuth
} = require('../firebase/firebase')
const { async }     = require('@firebase/util')
const { logEvents } = require('../middleware/LogEvents')
require('colors')

const auth          = firAuth.getAuth()
const maxAge        = 60 * 60 * 24 * 1000
const host          = config.host
const cookieName    = config.cookieName

module.exports = {
    //** ---------- ##### GET ##### ---------- **/
    home: (req,res) => {
        const title = "HOME"
        const user = {
            uid: null,
            email: "",
            displayName: ""
        }
        if (res?.user?.uid) {
            user.uid = res?.user?.uid
            user.email = res?.user?.email
            user.displayName = res?.user?.displayName
            
        }
        //console.log('USER ', res.user)
        console.log('USER ', user)
        res.render(`home`, { title, user })
    },
    /**
     ** LOGIN PAGE
     *
     * @access  Public
     * @route   GET api//login
     * 
     * @param { Object } req 
     * @param { Object } res 
     */
    login: (req, res) => {
        const title = "Log In"
        res.render('login', { title })
    },
    /**
     ** REGISTRATION PAGE
     *
     * @access  Public
     * @route   GET api/registration
     * 
     * @param { Object } req 
     * @param { Object } res 
     */
    registration: async (req, res) => {
        const title = "Registration"
        res.render('registration', { title })
    },
    /**
     ** UPDATE USER PAGE
     *
     * @access  Private
     * @route   GET api/updateUser
     * 
     * @param { Object } req 
     * @param { Object } res 
     */
     updateUser: async (req, res) => {
        const uid           = res?.user?.uid
        const email         = res?.user?.email
        const displayName   = res?.user?.displayName
        const title = "Update User"
        res.render('updateUser', { displayName, email, title, uid })
    },
    /**
     ** CHANGE PASSWORD PAGE
     *
     * @access  Public
     * @route   GET api/changepassword
     * 
     * @param { Object } req 
     * @param { Object } res 
     */
     changepassword: async (req, res) => {
        const title = "Change Password"
        res.render('changepassword', { title })
    },
    /**
     ** ACTION HANDLER TO CHANGE PASSWORD OR FORGOT PASSWORD
     *
     * @access  Public
     * @route   GET api/actionHandler
     * 
     * @param { Object } req 
     * @param { Object } res 
     */
    actionHandler: async (req, res) => {
        const mode          = req.query.mode
        const actionCode    = req.query.oobCode
        const continueUrl   = req.query.continueUrl

        switch (mode) {
            case 'resetPassword':
                handleResetPassword(auth, actionCode, continueUrl, lang)
                break
            /* case 'recoverEmail': // Display email recovery handler and UI.
                handleRecoverEmail(auth, actionCode, lang)
                break */
            case 'verifyEmail':
                handleVerifyEmail(auth, actionCode, continueUrl, lang)
                break
            default:
                console.log("Error: invalid mode.")
        }
        //* HANDLE VERIFY EMAIL ADDRESS
        function handleVerifyEmail(auth, actionCode, continueUrl) {
            //* CHECK THE ACTION CODE
            auth.checkActionCode(actionCode)
            .then(info => {
                //* GET USER EMAIL FROM ACTION CODE
                admin.auth().getUserByEmail(info.data.email)
                .then((userRecord) => {
                    //* UPDATE USER DISABLED FALSE
                    admin.auth().updateUser(userRecord.uid, {
                        disabled: false,
                    }).then((userRecord) => {
                        //* SUCCESSFULLY UPDATED USER
                        console.log('Successfully updated user', userRecord)
                        // TODO: SAVE TO USER TABLE IS VERIFIED HIS EMAIL
                        services.sendMessageAndRenderPage(res, continueUrl, "Your e-mail is verified!", "alert-success", true, "VerifyEmail", "")
                    }).catch((error) => {
                        //! USER UPDATING FAILED
                        console.log('Error updating user:', error);
                        services.sendMessageAndRenderPage(res, "", error.message, "alert-warning", false, "", "")
                    })
                }).catch((error) => {
                    //! FETCHING USER DATA FAILED
                    console.log('Error fetching user data:', error);
                    services.sendMessageAndRenderPage(res, "", error.message, "alert-warning", false, "", "")
                })
            }).catch((error) => {
                //! WRONG ACTION CODE OR EXPIRE
                console.log('Actioncode verify ERROR ', error)
                services.sendMessageAndRenderPage(res, "", error.message, "alert-warning", false, "", "")
            })
        }
        //* HANDLE RESET PASSWORD
        function handleResetPassword(auth, actionCode, continueUrl) {
            auth.verifyPasswordResetCode(actionCode).then((email) => {
                let accountEmail = email
                services.sendMessageAndRenderPage(res, continueUrl, accountEmail, "alert-warning", true, "ResetPassword", actionCode)
            }).catch((error) => {
                //! WRONG ACTION CODE OR EXPIRE
                console.log('Password reset actioncode verify ERROR ', error)
                services.sendMessageAndRenderPage(res, "", error.message, "alert-warning", false, "", "")
            })
        }
    },
    /**
     ** LOG OUT
     *
     * @access  Private
     * @route   GET api/logOut
     * 
     * @param { Object } req 
     * @param { Object } res 
     */
    logOut: (req,res) => {
        const title = "Log Out"
        firAuth.signOut(auth)
        .then(() => {
            console.log("The user is signed out")
            res.cookie(cookieName, '', { maxAge: 1 })
            res.render("logOut", { title })
        })
        .catch((err) => {
            console.log("🟥  ⇒ file: AuthController.js ⇒ line 84 ⇒ err", err)
        })
    },

    //** ---------- ##### POST ##### ---------- **/
    /**
     ** LOGIN POST
     *
     * @access  Public
     * @route   POST api/login
     * 
     * @param { Object } req 
     * @param { Object } res 
     */
    loginP: async (req, res) => {
        const { email, password } = req.body
        //* CHECK_EMAIL_AND_PASSWORD_ISNOT_EMTPY
        if (!email || !password) {
            const error = {
                code: 'auth/incomplete data',
                message: 'e-mail or password is missing!',
                a: null
            }
            const errors = handleErrors(error)
            res.json({ errors })
            return
        }
        /* const fields = { email, password }
        const result = await checkFieldsIsEmpty(fields)
        console.log("🟥  ⇒ file: AuthController.js ⇒ line 213 ⇒ loginP: ⇒ RESULT", result)
        res.json({result}) */
        firAuth.signInWithEmailAndPassword(auth, email, password)
        .then((userRecord) => {
            const uid = userRecord.user.uid
            const accessToken   = services.createAccessToken(res, uid, maxAge)
            res.json({ accessToken, userRecord })
        })
        .catch( (error) => {
            const errors = handleErrors(error)
            console.log('Login ERROR', errors)
            res.json( { errors } )        
        })

    },
    /**
     * * OAUTH REGISTRATION FIRST STEP. GET E-MAIL TO DMS
     *
     * @access  Public
     * @route   POST api/registration
     * 
     * @param { Object } req 
     * @param { Object } res 
     */
     registrationP: async (req, res) => {
        const { displayName, email, password, passwordConf } = req.body

        //* CHECK THE EMAIL AD PASSWORD IS NOT EMPTY
        if (!email || !password) {
            const error = {
                code: 'auth/incomplete data',
                message: 'e-Mail or password is missing!',
                a: null
            }
            const errors = handleErrors(error)
            res.json( { errors } )
            return
        }
        
        //* CHECK THE PASSWORD AND CONFIRM PASSWORD IS EQUAL
        if(password != passwordConf) {
            const error = {
                code: 'auth/incomplete data',
                message: 'Password and password confirmi is not equal!',
                a: null
            }
            const errors = handleErrors(error)
            res.json( { errors } )
            return
        }

        //* CREATE USER ON FIREBASE
        admin.auth().createUser({
            email, password, displayName, disabled: true, emailVerified: false  //? photoURL, phoneNumber
        })
        .then( async ( userRecord ) => {
            //* CREATE EMAIL LINK AND SEND WITH EMAIL API
            //? const emailLink = await services.generateEmailLink(email)
            //* SEND A MESSAGE THAT THE USER HAS BEEN SUCCESSFULLY CREATED
            res.json({ message: 'Ellenőrizd az e-mail fiókodat!', type: "alert-success", userRecord })
        })
        .catch((err) => {
            //* FAILED TO CREATE USER
            console.log('Failed to create user:', err)
            const errors = handleErrors(err)
            res.json( { errors, type: "alert-warning" } )
            return
        })
    },
    /**
     ** UPDATE USERDATA
     *
     * @access  Public
     * @route   POST api/registration
     * 
     * @param { Object } req 
     * @param { Object } res 
     */
    updateUserP: async (req, res) => {
        const { displayName, email, uid } = req.body
        //* CHECK THE EMAIL AD PASSWORD IS NOT EMPTY
        if (!email) {
            const error = {
                code: 'auth/incomplete data',
                message: 'e-Mail or password is missing!',
                a: null
            }
            const errors = handleErrors(error)
            res.json( { errors } )
            return
        }

        //* UPDATE USER ON FIREBASE
        admin.auth().updateUser(uid, {
            email, displayName, disabled: false //? photoURL, phoneNumber
        })
        .then( async ( userRecord ) => {
            //* SEND A MESSAGE THAT THE USER HAS BEEN SUCCESSFULLY CREATED
            res.json({ message: 'Your data is updated', type: "alert-success", userRecord })
        })
        .catch((err) => {
            //* FAILED TO CREATE USER
            console.log('Failed to create user:', err)
            const errors = handleErrors(err)
            res.json( { errors, type: "alert-warning" } )
            return
        })

    },
    /**
     ** CHANGE PASSWORD
     *
     * @access  Public
     * @route   POST api/changepassword
     * 
     * @param { Object } req 
     * @param { Object } res 
     */
     changepasswordP: async (req, res) => {
        const { email } = req.body
        console.log("🟥  ⇒ file: AuthController.js ⇒ line 303 ⇒ changepasswordP: ⇒ email", email)
        const continueUrl = host
        console.log("🟥  ⇒ file: AuthController.js ⇒ line 319 ⇒ changepasswordP: ⇒ host", host)
        //* CHECK THE EMAIL IS NOT EMPTY
        if (!email || email == '') {
            const error = {
                code: 'auth/incomplete data',
                message: 'e-mail or password is missing!',
                a: null
            }
            const errors = handleErrors(error)
            res.json( { errors } )
            return
        }
        //* CHECK THE E-MAIL IS REGISTERED
        admin.auth().getUserByEmail(email)
        .then( async (userRecord) => {
            //* CREATE EMAILLINK
            const actionCodeSettings = {
                //* URL you want to redirect back to. The domain (www.example.com) for
                //* this URL must be whitelisted in the Firebase Console.
                url: `${continueUrl}`,
                //* This must be true for email link sign-in.
                //handleCodeInApp: true,
                //iOS: { bundleId: 'com.example.ios' },
                //android: { packageName: 'com.example.android', installApp: true, minimumVersion: '12' },
                //* FDL custom domain.
                //dynamicLinkDomain: 'coolapp.page.link',
              }
            const emailLink = await admin.auth().generatePasswordResetLink(userRecord.email, actionCodeSettings )
            console.log("🟥  ⇒ file: AuthController.js ⇒ line 314 ⇒ .then ⇒ emailLink", emailLink)
            //* SEND EMAIL
            //const result = await services.sendEmailViaApi(userRecord.email, emailLink, userRecord.displayName )
            res.json( { mesage: "Reset password e-mail is sent!", emailLink } )
        })
        .catch((error) => {
            console.log('Error fetching user data:', error)
            const errors = handleErrors(error)
            res.json( { errors } )
        })
    },
    /**
     ** RESET PASSWORD
     *
     * @access  Public
     * @route   POST /resetpassword
     * 
     * @param { Object } req 
     * @param { Object } res 
     */
    resetpasswordP: async (req, res) => {
        const { password, passwordConf, actionCode } = req.body
        if (password != passwordConf) {
            const error = {
                code: 'auth/incomplete data',
                message: 'Password and password confirmi is not equal!',
                a: null
            }
            const errors = handleErrors(error)
            res.json( { errors } )
            return
        }
        firebase.auth().confirmPasswordReset(actionCode, password)
        .then((resp) => {
            console.log('confirmPasswordReset ', resp)
            res.json( { message: "Password reset has been confirmed and new password updated.!", type: " alert-success" } )
        }).catch((error) => {
            console.log('Failed to create user:', err)
            const errors = handleErrors(err)
            res.json( { errors, type: "alert-warning", appUrl: "" } )
            return
        })
    }


}
/**
 ** CHECK THE FIELDS IS NOT EMPTY
 * 
 * @param { Array } fields 
 */
const checkFieldsIsEmpty = async (fields) => {
    let error = []
    Object.keys(fields).map( async (key, index) => {
        if (!fields[key] || typeof fields[key] === 'undefined' || fields[key].trim() === "") {
            console.log(1)
            const err = {
                code: 'auth/incomplete data',
                message: `${key} is missing!`,
                a: null
            }
            const errors = await handleErrors(err)
            error.push(errors)
            console.log("🟥  ⇒ file: AuthController.js ⇒ line 426 ⇒ Object.keys ⇒ error", error)
            return error
        }
        return error
    })    
}
/**
 ** RETURN ERROR CODE AND MESSAGE
 *
 * @param   {*} err
 * @return  {*} 
 */
 const handleErrors = (err) => {
    let errors = { emailErr: '', password: ''}
    console.log('ERR ', err)
    if (err.code == 'email-already-exists')         errors.emailErr = err.message
    if (err.code == 'appRegisteredError')           errors.emailErr = err.message
    if (err.code == 'auth/invalid-email')           errors.emailErr = err.message
    if (err.code == 'auth/wrong-password')          errors.password = err.message
    if (err.code == 'auth/user-not-found')          errors.emailErr = err.message
    if (err.code == 'auth/incomplete data')         errors.emailErr = err.message
    if (err.code == 'auth/invalid-password')        errors.password = err.message
    if (err.code == 'auth/too-many-requests')       errors.emailErr = err.message
    if (err.code == 'auth/email-already-exists')    errors.emailErr = err.message
    if (err.code == 'auth/creating new user error') errors.emailErr = err.message
    if (err.code == 'auth/internal-error')          errors.emailErr = err.message
    //**    SAVE ERROR  TO LOG FILFE

    logEvents(`SERVER IS RUNNING ON PORT: ${errors}`, 'errorLog.txt');
    return errors
}
