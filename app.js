// import dependencies 
const express = require('express');
const mongoose = require('mongoose');
const { engine } = require('express-handlebars');
const session = require('express-session');

const userRoute = require('./routes/userRoutes');

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

// basic route - remove once working with the dashboard
app.get('/', (req, res) => {
    res.send('Server running');
});

app.use('/', userRoute);

// setup handlebars
app.engine('hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: 'views/layouts',
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
