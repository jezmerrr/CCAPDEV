const Lab = require('../models/Lab');
const Reservation = require('../models/Reservation');
const User = require('../models/User');

const TIME_SLOTS = [
    { value: '07:30-08:00', label: '7:30 AM - 8:00 AM' },
    { value: '08:00-08:30', label: '8:00 AM - 8:30 AM' },
    { value: '08:30-09:00', label: '8:30 AM - 9:00 AM' },
    { value: '09:00-09:30', label: '9:00 AM - 9:30 AM' },
    { value: '09:30-10:00', label: '9:30 AM - 10:00 AM' },
    { value: '10:00-10:30', label: '10:00 AM - 10:30 AM' },
    { value: '10:30-11:00', label: '10:30 AM - 11:00 AM' },
    { value: '11:00-11:30', label: '11:00 AM - 11:30 AM' },
    { value: '11:30-12:00', label: '11:30 AM - 12:00 PM' },
    { value: '12:00-12:30', label: '12:00 PM - 12:30 PM' },
    { value: '12:30-13:00', label: '12:30 PM - 1:00 PM' },
    { value: '13:00-13:30', label: '1:00 PM - 1:30 PM' },
    { value: '13:30-14:00', label: '1:30 PM - 2:00 PM' },
    { value: '14:00-14:30', label: '2:00 PM - 2:30 PM' },
    { value: '14:30-15:00', label: '2:30 PM - 3:00 PM' },
    { value: '15:00-15:30', label: '3:00 PM - 3:30 PM' },
    { value: '15:30-16:00', label: '3:30 PM - 4:00 PM' },
    { value: '16:00-16:30', label: '4:00 PM - 4:30 PM' },
    { value: '16:30-17:00', label: '4:30 PM - 5:00 PM' },
    { value: '17:00-17:30', label: '5:00 PM - 5:30 PM' }
];

// render slot availability page
exports.getSlotAvailability = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        const labs = await Lab.find({ isActive: true }).lean();

        // group labs by building
        const buildingMap = {};
        labs.forEach(lab => {
            const key = lab.building.toLowerCase().replace(/\s+/g, '-');
            if (!buildingMap[key]) {
                buildingMap[key] = {
                    key,
                    name: lab.building,
                    labs: []
                };
            }
            buildingMap[key].labs.push({
                _id: lab._id,
                labName: lab.labName,
                capacity: lab.capacity
            });
        });

        const buildings = Object.values(buildingMap);

        // set first building as active
        if (buildings.length > 0) {
            buildings[0].isActive = true;
        }

        res.render('pages/slot-availability', {
            buildings: JSON.stringify(buildings),
            timeSlots: TIME_SLOTS
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// API: get reservations for a specific lab and date
exports.getLabReservations = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { labId, date } = req.query;

        if (!labId || !date) {
            return res.status(400).json({ error: 'Missing labId or date' });
        }

        const lab = await Lab.findById(labId).lean();
        if (!lab) {
            return res.status(404).json({ error: 'Lab not found' });
        }

        const [year, month, day] = date.split('-').map(Number);
        const queryDate = new Date(Date.UTC(year, month - 1, day));
        const nextDay = new Date(Date.UTC(year, month - 1, day + 1));

        const reservations = await Reservation.find({
            lab: labId,
            date: { $gte: queryDate, $lt: nextDay },
            status: 'Confirmed'
        }).populate('user', 'firstName lastName').lean();

        // count reservations per time slot and check against capacity
        const reservationCountBySlot = {};
        reservations.forEach(r => {
            reservationCountBySlot[r.timeSlot] = (reservationCountBySlot[r.timeSlot] || 0) + 1;
        });

        // a slot is fully booked only when all seats are taken
        const fullyBookedSlots = [];
        Object.keys(reservationCountBySlot).forEach(slot => {
            if (reservationCountBySlot[slot] >= lab.capacity) {
                fullyBookedSlots.push(slot);
            }
        });

        // build seat info per time slot
        const seatsBySlot = {};
        reservations.forEach(r => {
            if (r.seatNumber) {
                if (!seatsBySlot[r.timeSlot]) {
                    seatsBySlot[r.timeSlot] = [];
                }
                seatsBySlot[r.timeSlot].push({
                    seat: r.seatNumber,
                    bookedBy: r.isAnonymous
                        ? 'Anonymous'
                        : (r.user ? `${r.user.firstName} ${r.user.lastName}` : 'Unknown'),
                    userId: r.isAnonymous ? null : (r.user ? r.user._id : null),
                    isAnonymous: r.isAnonymous
                });
            }
        });

        res.json({
            bookedSlots: fullyBookedSlots,
            reservationCountBySlot,
            seatsBySlot,
            capacity: lab.capacity,
            labName: lab.labName
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// API: search student by email
exports.searchStudent = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { email } = req.query;

        if (!email) {
            return res.json({ user: null });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase(),
            role: 'Student'
        }).lean();

        if (!user) {
            return res.json({ user: null });
        }

        res.json({
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
