const express = require('express');
const router = express.Router();

const labController = require('../controllers/labController');

// pages
router.get('/slot-availability', labController.getSlotAvailability);

// api
router.get('/api/lab-reservations', labController.getLabReservations);

module.exports = router;
