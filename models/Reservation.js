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
        required: true,
        enum: [
            '07:30-09:00',
            '09:15-10:45',
            '11:00-12:30',
            '12:45-14:15',
            '14:30-16:00',
            '16:15-17:45'
        ]
    },

    seatNumber: {
        type: Number,
        default: null
    },

    isAnonymous: {
        type: Boolean,
        default: false
    },

    status: {
        type: String,
        enum: ['Confirmed', 'Cancelled', 'Completed', 'No Show', "Flagged"],
        default: 'Confirmed'
    },
});

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;