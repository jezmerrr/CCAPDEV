const User = require('../models/User');

// register route
exports.getRegister = (req, res) => {
    res.render('pages/register');
};

exports.postRegister = async (req, res) => {
    try {
        const { firstName, lastName, email, password, role } = req.body;

        const newUser = await User.create({ firstName, lastName, email, password, role });

        console.log("User saved: ", newUser);

        res.redirect('/login');
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// login route
exports.getLogin = (req, res) => {
    res.render('pages/login');
};

exports.postLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && user.password === password) {
            console.log("Login successful: ", user.email);

            req.session.user = user;
            return res.redirect('/dashboard'); 
        } else {
            return res.status(401).send("Invalid email or password");
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// dashboard route
exports.getDashboard = (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    res.render('pages/dashboard', {
        user: req.session.user
    });
};

// logout
exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
};