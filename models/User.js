// import
const mongoose = require('mongoose');

// define the schema
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        length: 40
    },

    lastName: {
        type: String,
        required: true,
        length: 40
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true,
    },

    role: {
        type: String,
        enum: ['Student', 'Lab Technician'],
        required: true
    },

    profilePicture: {
        type: String
    },

    description: {
        type: String,
        length: 100
    },

    noShowCount: {
    type: Number,
    default: 0
    },

    isBanned: {
    type: Boolean,
    default: false
    }
}, 

{
    timestamps: true // adds createdAt and updatedAt
});

// create the model
const User = mongoose.model('User', userSchema);

// export so other files can use it as well
module.exports = User;