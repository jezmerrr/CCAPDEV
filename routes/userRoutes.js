const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const isAuthenticated = require('../middleware/auth');

router.get('/landing', userController.getLanding);

router.get('/register', userController.getRegister);
router.post('/register', userController.postRegister);

router.get('/login', userController.getLogin);
router.post('/login', userController.postLogin);

router.get('/dashboard', isAuthenticated, userController.getDashboard);

router.get('/logout', userController.logout);

router.get('/user-profile', isAuthenticated, userController.getProfile);
router.post('/user-profile', isAuthenticated, userController.postEditProfile);

router.get('/user-profile/:id', isAuthenticated, userController.getOtherProfile);
router.get('/view-profile/:id', isAuthenticated, userController.getOtherProfile);

router.post('/user-profile/upload-pfp', isAuthenticated, userController.upload.single('profilePicture'), userController.postUploadPfp);
router.post('/user-profile/delete', isAuthenticated, userController.deleteAccount);


module.exports = router;