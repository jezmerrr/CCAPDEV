const mongoose = require('mongoose');
const User = require('./models/User');
const Lab = require('./models/Lab');
const Reservation = require('./models/Reservation');

async function seed(){
    await mongoose.connect('mongodb+srv://LABMATES:LABMATESDLSU@cluster0.sp3lpzq.mongodb.net/labmate');

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
    ];

    const insertedUsers = await User.insertMany(users);

    const labs = [
        // Gokongwei Hall
        { labName: 'G203', building: 'Gokongwei Hall', capacity: 40, isActive: true },
        { labName: 'G204', building: 'Gokongwei Hall', capacity: 40, isActive: true },
        { labName: 'G303', building: 'Gokongwei Hall', capacity: 35, isActive: true },
        { labName: 'G304', building: 'Gokongwei Hall', capacity: 40, isActive: true },

        // Velasco Hall
        { labName: 'V202', building: 'Velasco Hall', capacity: 35, isActive: true },
        { labName: 'V203', building: 'Velasco Hall', capacity: 35, isActive: true },
        { labName: 'V205', building: 'Velasco Hall', capacity: 38, isActive: true },
        { labName: 'V206', building: 'Velasco Hall', capacity: 38, isActive: true },

        // Lasalle Hall
        { labName: 'LS201', building: 'Lasalle Hall', capacity: 40, isActive: true },
        { labName: 'LS203', building: 'Lasalle Hall', capacity: 40, isActive: true },
        { labName: 'LS303', building: 'Lasalle Hall', capacity: 38, isActive: true },
        { labName: 'LS304', building: 'Lasalle Hall', capacity: 38, isActive: true }
    ];

    const insertedLab = await Lab.insertMany(labs);

    const reservations = [
        // Confirmed - visible in slot availability
        {
            user: insertedUsers[0]._id,  // John (Student)
            lab: insertedLab[0]._id,     // G203
            date: new Date(Date.UTC(2026, 2, 14)), // March 14
            timeSlot: '07:30-08:00',
            seatNumber: 1,
            status: 'Confirmed'
        },
        {
            user: insertedUsers[2]._id,  // JB (Student)
            lab: insertedLab[0]._id,     // G203 - same lab/date/slot as above to test multi-seat
            date: new Date(Date.UTC(2026, 2, 14)), // March 14
            timeSlot: '07:30-08:00',
            seatNumber: 2,
            status: 'Confirmed'
        },
        {
            user: insertedUsers[3]._id,  // Cory (Student)
            lab: insertedLab[6]._id,     // V205
            date: new Date(Date.UTC(2026, 2, 15)), // March 15
            timeSlot: '09:00-09:30',
            seatNumber: 5,
            status: 'Confirmed'
        },
        {
            user: insertedUsers[0]._id,  // John (Student)
            lab: insertedLab[2]._id,     // G303
            date: new Date(Date.UTC(2026, 2, 16)), // March 16
            timeSlot: '14:30-15:00',
            seatNumber: 10,
            status: 'Confirmed'
        },
        {
            user: insertedUsers[2]._id,  // JB (Student) - anonymous booking
            lab: insertedLab[8]._id,     // LS201
            date: new Date(Date.UTC(2026, 2, 17)), // March 17
            timeSlot: '09:00-09:30',
            seatNumber: 3,
            isAnonymous: true,
            status: 'Confirmed'
        },

        // No Show - visible in manage no-shows
        {
            user: insertedUsers[0]._id,  // John (Student)
            lab: insertedLab[4]._id,     // V202
            date: new Date(Date.UTC(2026, 2, 13)), // March 13
            timeSlot: '08:00-08:30',
            seatNumber: 2,
            status: 'No Show'
        },
        {
            user: insertedUsers[2]._id,  // JB (Student)
            lab: insertedLab[1]._id,     // G204
            date: new Date(Date.UTC(2026, 2, 13)), // March 13
            timeSlot: '10:00-10:30',
            seatNumber: 7,
            status: 'No Show'
        },

        // Cancelled and Completed - visible in manage reservations
        {
            user: insertedUsers[3]._id,  // Cory (Student)
            lab: insertedLab[8]._id,     // LS201
            date: new Date(Date.UTC(2026, 2, 13)), // March 13
            timeSlot: '11:00-11:30',
            seatNumber: 4,
            status: 'Cancelled'
        },
        {
            user: insertedUsers[2]._id,  // JB (Student)
            lab: insertedLab[3]._id,     // G304
            date: new Date(Date.UTC(2026, 2, 13)), // March 13
            timeSlot: '13:00-13:30',
            seatNumber: 6,
            status: 'Completed'
        }
    ];

    await Reservation.insertMany(reservations);

    console.log('Seed data inserted successfully!');
    await mongoose.disconnect();
}

seed();