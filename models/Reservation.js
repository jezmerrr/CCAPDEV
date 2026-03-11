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
            '07:30-08:00', '08:00-08:30', '08:30-09:00', '09:00-09:30',
            '09:30-10:00', '10:00-10:30', '10:30-11:00', '11:00-11:30',
            '11:30-12:00', '12:00-12:30', '12:30-13:00', '13:00-13:30',
            '13:30-14:00', '14:00-14:30', '14:30-15:00', '15:00-15:30',
            '15:30-16:00', '16:00-16:30', '16:30-17:00', '17:00-17:30'
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
        enum: ['Confirmed', 'Cancelled', 'Completed', 'No Show', 'Flagged'],
        default: 'Confirmed'
    }
}, {
    timestamps: true
});

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;