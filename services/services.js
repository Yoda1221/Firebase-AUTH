const fs            = require('fs')
const {v4: uuidv4}  = require('uuid')
const colors        = require('colors')
const jwt           = require('jsonwebtoken')
const config        = require('../firebase/config')
const maxAge        = 24*60*60*1000   //  1 day

const accTokenSecret    = config.accTokenSecret
const refTokenSecret    = config.refTokenSecret
const cookieName        = config.cookieName

/** 
 ** CREATE TOKEN WITH JWT
 * 
 * @param { String } id 
 * @param { Object } res 
 */
 const createAccessToken = (res, uid, maxAge) => {
        const token = jwt.sign({ uid, maxAge }, accTokenSecret, { expiresIn: maxAge })
        createCookie(res, token)
    return token
}
/**
 ** CREATE COOKIE
 *
 * @param { Object } res
 * @param { String } token
 */
const createCookie = (res, token) => {
    res.cookie(cookieName, token, {
        secure: false,
        sameSite: 'lax',
        httpOnly: true,
        expires: new Date(Date.now() + maxAge)
    })
}
/**
 ** GENERATE AN EMAIL LINK TO USER ACTIVATION
 *
 * @access  INSIDE
 * 
 * @param { String } email 
 * @param { Object } appClientId 
 */
const generateEmailLink = async (appClientId, email) => {
    const appUrl = "localhost:3300" //   await getAppUrl(appClientId)
    //* CREATE EMAILLINK
    const emailLink = await admin.auth().generateEmailVerificationLink(email, { url: appUrl })
    return emailLink
}
/**
 ** SEND MESSAGE AND RENDER ACTIONHANDLER PAGE 
 * @param { String } goto 
 * @param { String } type 
 * @param { String } action 
 * @param { String } message 
 * @param { String } actionCode 
 * @param { String } continueUrl 
 */
 const sendMessageAndRenderPage = (res, continueUrl, message, type, goto, action, actionCode) => {
    res.render('actionhandler', {
        continueUrl, message, type, goto, action, actionCode
    })
}

const services = {
    createAccessToken,
    createCookie,
    generateEmailLink,
    sendMessageAndRenderPage
}

module.exports = services
