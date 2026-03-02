const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    lab: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lab',
        required: true
    },

    date: {
        type: Date,
        required: true
    },

    timeSlot: {
        type: String,
        required: true
    },

    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed', 'No Show'],
        default: 'Pending'
    },
});

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;