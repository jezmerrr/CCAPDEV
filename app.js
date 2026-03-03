// import dependencies 
const express = require('express');
const mongoose = require('mongoose');
const { engine } = require('express-handlebars'); 

const User = require('./models/User');
const Lab = require('./models/Lab');
const Reservation = require('./models/Reservation');

const userRoute = require('./routes/userRoutes');

const app = express();

// middleware configuration
app.use(express.urlencoded({ extended: true })); 
app.use(express.json()); 
app.use(express.static('public')); 

app.use('/', userRoute);

// setup handlebars
app.engine('hbs', engine({ 
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: 'views/layouts'
}));
app.set('view engine', 'hbs');
app.set('views', './views');

// basic route
app.get('/', (req, res) => {
    res.send('Server running');
});


// database connection
mongoose.connect('mongodb://localhost:27017/lab_reservation').then(() => console.log('MongoDB Connected')).catch(err => console.log(err));

// initialize server
app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});
