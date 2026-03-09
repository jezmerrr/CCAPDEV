const Lab = require('../models/Lab');
const Reservation = require('../models/Reservation');

const TIME_SLOTS = [
    { value: '07:30-09:00', label: '7:30 AM - 9:00 AM' },
    { value: '09:15-10:45', label: '9:15 AM - 10:45 AM' },
    { value: '11:00-12:30', label: '11:00 AM - 12:30 PM' },
    { value: '12:45-14:15', label: '12:45 PM - 2:15 PM' },
    { value: '14:30-16:00', label: '2:30 PM - 4:00 PM' },
    { value: '16:15-17:45', label: '4:15 PM - 5:45 PM' }
];

function buildUserSessionData(sessionUser) {
    return {
        ...sessionUser,
        initials: `${sessionUser.firstName?.[0] || ''}${sessionUser.lastName?.[0] || ''}`,
        isTechnician: sessionUser.role === 'Lab Technician'
    };
}

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
            user: buildUserSessionData(req.session.user),
            buildings: JSON.stringify(buildings),
            timeSlots: JSON.stringify(TIME_SLOTS)
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

        const queryDate = new Date(date);
        queryDate.setHours(0, 0, 0, 0);

        const nextDay = new Date(queryDate);
        nextDay.setDate(nextDay.getDate() + 1);

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
                        : (r.user ? `${r.user.firstName} ${r.user.lastName}` : 'Unknown')
                });
            }
        });

        res.json({ bookedSlots: fullyBookedSlots, seatsBySlot });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
