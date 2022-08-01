const express       = require('express')
const router        = express.Router()
const { 
    checkLoggedUser, 
    requireAuth 
} = require('../middleware/AuthMiddleware')

const authController = require('../controllers/AuthController')

router.route('/home').get(checkLoggedUser, authController.home)
router.route('/logOut').get(requireAuth, authController.logOut)
router.route('/login').get(authController.login).post(authController.loginP)
router.route('/registration').get(authController.registration).post(authController.registrationP)
router.route('/updateUser').get(requireAuth, authController.updateUser).put(requireAuth, authController.updateUserP)
router.route('/changepassword').get(authController.changepassword).post(authController.changepasswordP)
router.route('/resetpassword').post(authController.resetpasswordP)



module.exports = router
