// import dependencies 
const express = require('express');
const mongoose = require('mongoose');
const { engine } = require('express-handlebars');
const session = require('express-session');

// routes
const userRoutes = require('./routes/userRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const labRoutes = require('./routes/labRoutes');

const app = express();

// middleware configuration
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.use(session({
    secret: 'secretkey',
    resave: false,
    saveUninitialized: false
}));

// helper to build user data for templates
function buildUserSessionData(sessionUser) {
    return {
        ...sessionUser,
        initials: `${sessionUser.firstName?.[0] || ''}${sessionUser.lastName?.[0] || ''}`,
        isTechnician: sessionUser.role === 'Lab Technician'
    };
}


// make user session available to all templates
app.use((req, res, next) => {
    if (req.session.user) {
        res.locals.user = buildUserSessionData(req.session.user);
    } else {
        res.locals.user = null;
    }
    next();
});

// default route
app.get('/', (req, res) => {
    res.redirect('/login');
});


// register routes
app.use('/', userRoutes);
app.use('/', reservationRoutes);
app.use('/', labRoutes);




// setup handlebars 
app.engine('hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: './views/layouts',
    helpers: {
        currentDate: function () {
            const today = new Date();

            return today.toLocaleDateString('en-US', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        }
    }
}));
app.set('view engine', 'hbs');
app.set('views', './views');

// database connection
mongoose.connect('mongodb://localhost:27017/lab_reservation').then(() => console.log('MongoDB Connected')).catch(err => console.log(err));

// initialize server
app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});