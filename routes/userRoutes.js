const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/register', userController.getRegister);
router.post('/register', userController.postRegister);

router.get('/login', userController.getLogin);
router.post('/login', userController.postLogin);

router.get('/dashboard', userController.getDashboard);

router.get('/logout', userController.logout);

router.get('/user-profile', userController.getProfile);
router.post('/user-profile', userController.postEditProfile);


router.get('/view-profile/:id', userController.getOtherProfile);


module.exports = router;