const mongoose = require('mongoose');
const User = require('./models/User');
const Lab = require('./models/Lab');
const Reservation = require('./models/Reservation');

async function seed(){
    await mongoose.connect('mongodb://localhost:27017/lab_reservation');

    const users = [
        {
            firstName: 'John',
            lastName: 'Kritz',
            email: 'kritz.john@dlsu.edu.ph',
            password: 'johnthebest121',
            role: 'Student',
            profilePicture: '/assets/images/user-profile.jpg',
            description: 'I am the best student ever'
        },

        {
            firstName: 'Lenny',
            lastName: 'Bredo',
            email: 'bredo.lenny@dlsu.edu.ph',
            password: 'lennythebest121',
            role: 'Lab Technician',
            profilePicture: '/assets/images/user-profile.jpg',
            description: 'I am the best Lab Technician Ever'
        },

        {
            firstName: 'JB',
            lastName: 'Sun',
            email: 'sun.jb@dlsu.edu.ph',
            password: 'jbthebest121',
            role: 'Student',
            profilePicture: '/assets/images/user-profile.jpg',
            description: 'I am the funniest student ever'
        },

        {
            firstName: 'Cory',
            lastName: 'Marie',
            email: 'marie.cory@dlsu.edu.ph',
            password: 'corythebest121',
            role: 'Student',
            profilePicture: '/assets/images/user-profile.jpg',
            description: 'I am the nicest student ever'
        },

        {
            firstName: 'Grace',
            lastName: 'Fulmar',
            email: 'fulmar.grace@dlsu.edu.ph',
            password: 'gracethebest121',
            role: 'Lab Technician',
            profilePicture: '/assets/images/user-profile.jpg',
            description: 'I am the nicest Lab Technician Ever'
        }
    ]

    const insertedUsers = await User.insertMany(users);

    const labs = [
        {
            labName: 'G203',
            building: 'Gokongwei Hall',
            capacity: 40,
            isActive: true
        },

        {
            labName: 'V205',
            building: 'Velasco Hall',
            capacity: 38,
            isActive: true
        },

        {
            labName: 'LS201',
            building: 'Lasalle Hall',
            capacity: 40,
            isActive: false
        },

        {
            labName: 'G303',
            building: 'Gokongwei Hall',
            capacity: 38,
            isActive: true
        },

        {
            labName: 'G304',
            building: 'Gokongwei Hall',
            capacity: 40,
            isActive: false
        },
    ]

    const insertedLab = await Lab.insertMany(labs)

    const reservations = [
        {
            user: insertedUsers[0]._id,
            lab: insertedLab[0]._id,
            date: new Date('April 12, 2026'),
            timeSlot: '7:30-9:00',
            status: 'Confirmed'
        },

        {
            user: insertedUsers[1]._id,
            lab: insertedLab[1]._id,
            date: new Date('April 15, 2026'),
            timeSlot: '9:15-10:45',
            status: 'Confirmed'
        },

        {
            user: insertedUsers[2]._id,
            lab: insertedLab[2]._id,
            date: new Date('April 16, 2026'),
            timeSlot: '9:15-10:45',
            status: 'Cancelled'
        },

        {
            user: insertedUsers[3]._id,
            lab: insertedLab[3]._id,
            date: new Date('April 16, 2026'),
            timeSlot: '2:15-3:45',
            status: 'Completed'
        },

        {
            user: insertedUsers[4]._id,
            lab: insertedLab[4]._id,
            date: new Date('April 17, 2026'),
            timeSlot: '7:30-9:00',
            status: 'No Show'
        }
    ]

    await Reservation.insertMany(reservations);

    await mongoose.disconnect();
}  

seed();