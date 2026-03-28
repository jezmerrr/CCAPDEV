const User = require('../models/User');
const Reservation = require('../models/Reservation');
const Lab = require('../models/Lab');
const bcrypt = require('bcrypt');

function validate (res, page, errMessage) {
    return res.render(page, {
        error: errMessage
    });
}

// landing page route
exports.getLanding = (req, res) => {
    res.render('pages/landing');
};

// register route
exports.getRegister = (req, res) => {
    res.render('pages/register');
};

exports.postRegister = async (req, res) => {
    try {
        const { firstName, lastName, email, password, role } = req.body;

        if (!firstName || !lastName || !role) {
            return validate(res, 'pages/register', "All fields are required");
        }

        if (!email.includes('@')) {
            return validate(res, 'pages/register', "Invalid email format");
        }
        
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return validate(res, 'pages/register', "Email already exists");
        }

        if (password.length < 8) {
            return validate(res, 'pages/register', "Password must be at least 8 characters");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({ firstName, lastName, email, password: hashedPassword, role });

        console.log("User saved: ", newUser);

        res.redirect('/login');
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// login route
exports.getLogin = (req, res) => {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    res.render('pages/login');
};

exports.postLogin = async (req, res) => {
    try {
        const { email, password, remember } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return validate(res, 'pages/login', "Invalid email or password");
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            req.session.user = {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            };

            if (remember) {
                req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 21;
            }

            return res.redirect('/dashboard');
        } else {
            return validate(res, 'pages/login', "Invalid email or password");
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// dashboard route
exports.getDashboard = async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    try {
        const today = new Date();
        const todayUTC = new Date(Date.UTC(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
        ));
        const tomorrowUTC = new Date(Date.UTC(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() + 1
        ));

        // upcoming reservations for the logged-in user
        const upcomingReservations = await Reservation.find({
            user: req.session.user._id,
            status: 'Confirmed',
            date: { $gte: todayUTC }
        })
            .populate('lab')
            .sort({ date: 1, timeSlot: 1 })
            .limit(3)
            .lean();

        const reservations = upcomingReservations.map(r => {
            const dateObj = new Date(r.date);
            return {
                labName: r.lab ? r.lab.labName : 'Unknown Lab',
                building: r.lab ? r.lab.building : '',
                dateDisplay: dateObj.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                }),
                timeSlot: r.timeSlot,
                seatNumber: r.seatNumber || '—'
            };
        });

        const labs = await Lab.find({ isActive: true }).lean();

        const todayReservations = await Reservation.find({
            date: { $gte: todayUTC, $lt: tomorrowUTC },
            status: 'Confirmed'
        }).lean();

        const countByLab = {};
        todayReservations.forEach(r => {
            const labId = r.lab.toString();
            countByLab[labId] = (countByLab[labId] || 0) + 1;
        });

        const labAvailability = labs.map(lab => {
            const booked = countByLab[lab._id.toString()] || 0;
            const available = lab.capacity - booked;
            return {
                labName: lab.labName,
                booked,
                available,
                capacity: lab.capacity
            };
        });

        res.render('pages/dashboard', {
            user: req.session.user,
            reservations,
            hasReservations: reservations.length > 0,
            labAvailability
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// getProfile
exports.getProfile = async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    try {
        const userReservations = await Reservation.find({
            user: req.session.user._id
        }).populate('lab');

        const reservationsData = userReservations.map(r => r.toObject());

        res.render('pages/user-profile', {
            reservation: reservationsData
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// post editProfile
exports.postEditProfile = async (req, res) => {
    try {
        const name = req.body.name;
        const { email, description } = req.body;
        const userId = req.session.user._id;

        await User.findByIdAndUpdate(userId, {
            firstName: name.split(' ')[0],
            lastName: name.split(' ')[1],
            email,
            description
        });

        req.session.user.firstName = name.split(' ')[0];
        req.session.user.lastName = name.split(' ')[1];
        req.session.user.email = email;
        req.session.user.description = description;

        res.redirect('/user-profile');
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// getOtherProfile
exports.getOtherProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const userProfile = await User.findById(userId);

        res.render('pages/view-profile', {
            profile: userProfile.toObject()
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// logout
exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
};