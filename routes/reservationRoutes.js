const express = require('express');
const router = express.Router();

const reservationController = require('../controllers/reservationController');

// pages
router.get('/manage-reservations', reservationController.getManageReservations);
router.get('/edit-reservation/:id', reservationController.getEditReservation);
router.get('/reserve-for-student', reservationController.getReserveForStudent);
router.get('/manage-no-shows', reservationController.getManageNoShows);

// actions
router.post('/reservations/create', reservationController.createReservation);
router.post('/reservations/update/:id', reservationController.updateReservation);
router.post('/reservations/cancel/:id', reservationController.cancelReservation);
router.post('/reservations/:id/arrived', reservationController.markArrived);
router.post('/reservations/:id/no-show', reservationController.markNoShow);
router.post('/no-shows/:id/resolve', reservationController.resolveNoShow);
router.post('/no-shows/:id/flag', reservationController.flagNoShowUser);

module.exports = router;