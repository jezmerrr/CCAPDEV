const mongoose = require('mongoose');
const User = require('./models/User');
const Lab = require('./models/Lab');
const Reservation = require('./models/Reservation');

async function seed(){
    await mongoose.connect('mongodb://localhost:27017/lab_reservation');

    // clear existing data
    await User.deleteMany({});
    await Lab.deleteMany({});
    await Reservation.deleteMany({});

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
        // Gokongwei Hall
        {
            labName: 'G203',
            building: 'Gokongwei Hall',
            capacity: 40,
            isActive: true
        },
        {
            labName: 'G204',
            building: 'Gokongwei Hall',
            capacity: 40,
            isActive: true
        },
        {
            labName: 'G303',
            building: 'Gokongwei Hall',
            capacity: 35,
            isActive: true
        },
        {
            labName: 'G304',
            building: 'Gokongwei Hall',
            capacity: 40,
            isActive: true
        },

        // Velasco Hall
        {
            labName: 'V202',
            building: 'Velasco Hall',
            capacity: 35,
            isActive: true
        },
        {
            labName: 'V203',
            building: 'Velasco Hall',
            capacity: 35,
            isActive: true
        },
        {
            labName: 'V205',
            building: 'Velasco Hall',
            capacity: 38,
            isActive: true
        },
        {
            labName: 'V206',
            building: 'Velasco Hall',
            capacity: 38,
            isActive: true
        },

        // Lasalle Hall
        {
            labName: 'LS201',
            building: 'Lasalle Hall',
            capacity: 40,
            isActive: true
        },
        {
            labName: 'LS203',
            building: 'Lasalle Hall',
            capacity: 40,
            isActive: true
        },
        {
            labName: 'LS303',
            building: 'Lasalle Hall',
            capacity: 38,
            isActive: true
        },
        {
            labName: 'LS304',
            building: 'Lasalle Hall',
            capacity: 38,
            isActive: true
        }
    ]

    const insertedLab = await Lab.insertMany(labs)

    const reservations = [
        {
            user: insertedUsers[0]._id,
            lab: insertedLab[0]._id,
            date: new Date('April 12, 2026'),
            timeSlot: '07:30-08:00',
            seatNumber: 1,
            status: 'Confirmed'
        },

        {
            user: insertedUsers[1]._id,
            lab: insertedLab[6]._id,
            date: new Date('April 15, 2026'),
            timeSlot: '09:00-09:30',
            seatNumber: 5,
            status: 'Confirmed'
        },

        {
            user: insertedUsers[2]._id,
            lab: insertedLab[8]._id,
            date: new Date('April 16, 2026'),
            timeSlot: '09:00-09:30',
            seatNumber: 3,
            status: 'Cancelled'
        },

        {
            user: insertedUsers[3]._id,
            lab: insertedLab[2]._id,
            date: new Date('April 16, 2026'),
            timeSlot: '14:30-15:00',
            seatNumber: 10,
            status: 'Completed'
        },

        {
            user: insertedUsers[4]._id,
            lab: insertedLab[4]._id,
            date: new Date('April 17, 2026'),
            timeSlot: '08:00-08:30',
            seatNumber: 2,
            status: 'No Show'
        }
    ]

    await Reservation.insertMany(reservations);

    console.log('Seed data inserted successfully!');
    await mongoose.disconnect();
}

seed();
