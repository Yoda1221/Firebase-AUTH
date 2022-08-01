const jwt       = require('jsonwebtoken')
const config    = require('../firebase/config')
const admin     = require('../firebase/firAdmin')

const accTokenSecret    = config.accTokenSecret
const refTokenSecret    = config.refTokenSecret
/**
 ** CHECK CHECK LOGGED USER
 *
 * @param { Object } req
 * @param { Object } res
 * @param { * } next
 */
 const checkLoggedUser = (req, res, next) => {
    const token = req.cookies.FirebaseLogin
    console.log("🟥  ⇒ file: AuthMiddleware.js ⇒ line 15 ⇒ checkLoggedUser ⇒ token", token)
    if (token) {
        jwt.verify(token, accTokenSecret, (err, decodedToken) => {
            if (err) {
                console.log('Logged user ERROR ', err.message)
                res.user = null
                next()
            } else {
                console.log('CheckLoggedUser ', decodedToken)
                admin.auth().getUser(decodedToken.uid)
                .then((userRecord) => {
                    console.log('UR CLU ', userRecord)
                    res.user = userRecord
                    next()
                })
                .catch((error) => { console.log('Error fetching user data:', error) })
            }
        })
    } else {
        res.locals.user = null
        next()
    }
}
/**
 ** IF USER AUTHENTICATED
 * 
 * @param { Object } req 
 * @param { Object } res 
 * @param { * } next 
 */
 const requireAuth = (req, res, next) => {
    const tokenM = req.cookies.FirebaseLogin
    if (tokenM) {
        jwt.verify(tokenM, accTokenSecret, (err, decodedToken) => {
            if (err) {
                console.log(err.mesage)
                res.user = null
                res.redirect('home')
            } else {
                console.log('CheckLoggedUser ', decodedToken)
                admin.auth().getUser(decodedToken.uid)
                .then((userRecord) => {
                    console.log('UR CLU ', userRecord)
                    res.user = userRecord
                    next()
                })
                .catch((error) => { console.log('Error fetching user data:', error) })
            }
        })
    } else { res.redirect('login') }
}
/**
 ** REFRESH TOKEN
 * 
 * @param { Object } req 
 * @param { Object } res 
 * @param { * } next 
 */
const refreshToken = (req, res) => {
    const cookies = req.cookies
    if (!cookies?.FirebaseLogin) return res.sendStatus(401)
    const refreshToken = cookies.jwt
    const foundUser = usersDB.users.find(person => person.refreshToken === refreshToken)
    if (!foundUser) return res.sendStatus(403) //Forbidden 
    // evaluate jwt 
    jwt.verify(refreshToken, refTokenSecret, (err, decodedToken) => {
            if (err || foundUser.username !== decodedToken.username) return res.sendStatus(403)
            const accessToken = jwt.sign({
                "username": decodedToken.username }, accTokenSecret, { expiresIn: '30s'
            })
            res.json({ accessToken })
        }
    )
}

module.exports = { checkLoggedUser, refreshToken, requireAuth }
