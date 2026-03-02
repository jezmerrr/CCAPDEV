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
        enum: ['Student', 'Lab Techinician'],
        required: true
    },

    profilePicture: {
        type: String
    },

    description: {
        type: String,
        length: 100
    } 
}, 

{
    timestamps: true // adds createdAt and updatedAt
});

// create the model
const User = mongoose.model('User', userSchema);

// export so other files can use it as well
module.exports = User;