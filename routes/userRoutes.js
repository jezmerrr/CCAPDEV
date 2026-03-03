const express = require('express');
const router = express.Router();
const User = require("../models/User");

// register route
router.get('/register', (req, res) => {
    res.render('pages/register');
});

router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password, role } = req.body;

        const newUser = await User.create({ firstName, lastName, email, password, role });

        console.log("User saved: ", newUser);

        res.redirect('/login');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// login route
router.get('/login', (req, res) => {
    res.render('pages/login');
});


router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && user.password === password) {
            console.log("Login successful: ", user.email);
            return res.redirect('/'); // will change to dashboard later
        } else {
            return res.status(401).send("Invalid email or password");
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;