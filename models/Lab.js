const mongoose = require('mongoose');

const labSchema = new mongoose.Schema({
    labName: {
        type: String,
        required: true
    },

    building: {
        type: String,
        required: true
    },

    capacity: {
        type: Number,
        required: true
    },

    isActive: {
        type: Boolean,
        default: true
    }
});

const Lab = mongoose.model('Lab', labSchema);

module.exports = Lab;