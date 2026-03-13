const Reservation = require('../models/Reservation');
const Lab = require('../models/Lab');
const User = require('../models/User');

const TIME_SLOTS = [
    { value: '07:30-08:00', label: '7:30 AM to 8:00 AM' },
    { value: '08:00-08:30', label: '8:00 AM to 8:30 AM' },
    { value: '08:30-09:00', label: '8:30 AM to 9:00 AM' },
    { value: '09:00-09:30', label: '9:00 AM to 9:30 AM' },
    { value: '09:30-10:00', label: '9:30 AM to 10:00 AM' },
    { value: '10:00-10:30', label: '10:00 AM to 10:30 AM' },
    { value: '10:30-11:00', label: '10:30 AM to 11:00 AM' },
    { value: '11:00-11:30', label: '11:00 AM to 11:30 AM' },
    { value: '11:30-12:00', label: '11:30 AM to 12:00 PM' },
    { value: '12:00-12:30', label: '12:00 PM to 12:30 PM' },
    { value: '12:30-13:00', label: '12:30 PM to 1:00 PM' },
    { value: '13:00-13:30', label: '1:00 PM to 1:30 PM' },
    { value: '13:30-14:00', label: '1:30 PM to 2:00 PM' },
    { value: '14:00-14:30', label: '2:00 PM to 2:30 PM' },
    { value: '14:30-15:00', label: '2:30 PM to 3:00 PM' },
    { value: '15:00-15:30', label: '3:00 PM to 3:30 PM' },
    { value: '15:30-16:00', label: '3:30 PM to 4:00 PM' },
    { value: '16:00-16:30', label: '4:00 PM to 4:30 PM' },
    { value: '16:30-17:00', label: '4:30 PM to 5:00 PM' },
    { value: '17:00-17:30', label: '5:00 PM to 5:30 PM' }
];

function buildUserSessionData(sessionUser) {
    return {
        ...sessionUser,
        initials: `${sessionUser.firstName?.[0] || ''}${sessionUser.lastName?.[0] || ''}`,
        isTechnician: sessionUser.role === 'Lab Technician'
    };
}

function isValidTimeSlot(timeSlot) {
    return TIME_SLOTS.some((slot) => slot.value === timeSlot);
}

function normalizeDateOnly(dateValue) {
    const [year, month, day] = dateValue.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
}

function isStudent(sessionUser) {
    return sessionUser?.role === 'Student';
}

function isTechnician(sessionUser) {
    return sessionUser?.role === 'Lab Technician';
}

// show manage reservations page
exports.getManageReservations = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        let reservationsFromDb = [];

        if (isStudent(req.session.user)) {
            reservationsFromDb = await Reservation.find({
                user: req.session.user._id
            })
                .populate('lab')
                .populate('user')
                .lean();
        } else if (isTechnician(req.session.user)) {
            reservationsFromDb = await Reservation.find()
                .populate('lab')
                .populate('user')
                .lean();
        }

        const student = isStudent(req.session.user);
        const technician = isTechnician(req.session.user);

        const reservations = reservationsFromDb.map((reservation) => {
            const dateObj = new Date(reservation.date);

            return {
                _id: reservation._id,
                reservationId: reservation._id.toString(),
                lab: reservation.lab,
                user: reservation.user,
                seatNumber: reservation.seatNumber || '—',
                reservedBy: reservation.user
                    ? `${reservation.user.firstName} ${reservation.user.lastName}`
                    : 'Unknown User',
                dateDisplay: dateObj.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                }),
                timeDisplay: reservation.timeSlot,
                purpose: reservation.purpose || 'No purpose provided',
                status: reservation.status.toLowerCase().replace(/\s+/g, '-'),
                statusLabel: reservation.status,
                canEdit:
                    (student && reservation.status === 'Confirmed') ||
                    (technician && reservation.status === 'Confirmed'),
                canCancel:
                    (student && reservation.status === 'Confirmed') ||
                    (technician && reservation.status === 'Confirmed'),
                canMarkArrived:
                    technician && reservation.status === 'Confirmed',
                canMarkNoShow:
                    technician && reservation.status === 'Confirmed'
            };
        });

        res.render('pages/manage-reservations', {
            user: buildUserSessionData(req.session.user),
            reservations,
            hasReservations: reservations.length > 0
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// show edit reservation page
exports.getEditReservation = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        const reservation = await Reservation.findById(req.params.id)
            .populate('lab')
            .populate('user')
            .lean();

        const user = buildUserSessionData(req.session.user);

        if (!reservation) {
            return res.render('pages/edit-reservation', {
                user,
                reservation: null,
                timeSlots: [],
                canEditReservation: false
            });
        }

        const student = isStudent(req.session.user);
        const technician = isTechnician(req.session.user);

        const canEditReservation =
            (technician && reservation.status === 'Confirmed') ||
            (
                student &&
                reservation.user &&
                reservation.user._id.toString() === req.session.user._id.toString() &&
                reservation.status === 'Confirmed'
            );

        if (reservation.date) {
            reservation.date = new Date(reservation.date).toISOString().split('T')[0];
        }

        const timeSlots = TIME_SLOTS.map((slot) => ({
            ...slot,
            selected: slot.value === reservation.timeSlot
        }));

        res.render('pages/edit-reservation', {
            user,
            reservation,
            timeSlots,
            canEditReservation
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// show reserve for student page
exports.getReserveForStudent = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        const labs = await Lab.find({ isActive: true }).lean();

        
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
        if (buildings.length > 0) {
            buildings[0].isActive = true;
        }

        res.render('pages/reserve-for-student', {
            user: buildUserSessionData(req.session.user),
            buildings: JSON.stringify(buildings),
            timeSlots: TIME_SLOTS
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// show manage no-shows page
exports.getManageNoShows = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        let noShowsFromDb = [];

        if (req.session.user.role === 'Student') {
            noShowsFromDb = await Reservation.find({
                user: req.session.user._id,
                status: 'No Show'
            })
            .populate('lab')
            .populate('user')
            .lean();
        } else if (req.session.user.role === 'Lab Technician') {
            noShowsFromDb = await Reservation.find({ status: 'No Show' })
            .populate('lab')
            .populate('user')
            .lean();
        }

        const noShows = noShowsFromDb.map((reservation) => {
            const dateObj = new Date(reservation.date);

            return {
                _id: reservation._id,
                reservationId: reservation._id.toString(),
                lab: reservation.lab,
                user: reservation.user,
                seatNumber: reservation.seatNumber || '—',
                reservedBy: reservation.user
                    ? `${reservation.user.firstName} ${reservation.user.lastName}`
                    : 'Unknown User',
                dateDisplay: dateObj.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                }),
                timeDisplay: reservation.timeSlot,
                statusLabel: reservation.status
            };
        });

        const resolvedCount = await Reservation.countDocuments({ status: 'Completed' });
        const flaggedUsers = await User.countDocuments({ isBanned: true });

        res.render('pages/manage-no-shows', {
            user: buildUserSessionData(req.session.user),
            noShows,
            hasNoShows: noShows.length > 0,
            resolvedCount,
            flaggedUsers
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// create reservation
exports.createReservation = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        const { labId, date, seatNumber, isAnonymous, studentId } = req.body;
        const purpose = (req.body.purpose || '').trim();

        const bookingUserId = (isTechnician(req.session.user) && studentId)
            ? studentId
            : req.session.user._id;

        const bookingUser = await User.findById(bookingUserId);

        if (!bookingUser) {
            return res.status(404).send('User not found');
        }

        if (bookingUser.isBanned) {
            return res.status(403).send('This student is banned from booking due to repeated no-shows.');
        }

        let timeSlots = req.body.timeSlot;
        if (!Array.isArray(timeSlots)) {
            timeSlots = timeSlots ? [timeSlots] : [];
        }

        if (!labId || !date || timeSlots.length === 0 || !purpose) {
            return res.status(400).send('Missing reservation information.');
        }

        for (const slot of timeSlots) {
            if (!isValidTimeSlot(slot)) {
                return res.status(400).send('Invalid time slot: ' + slot);
            }
        }

        const lab = await Lab.findById(labId);

        if (!lab || !lab.isActive) {
            return res.status(404).send('Selected lab is not available.');
        }

        const reservationDate = normalizeDateOnly(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (reservationDate < today) {
            return res.status(400).send('Cannot book past dates.');
        }

        const maxDate = new Date();
        maxDate.setHours(0, 0, 0, 0);
        maxDate.setDate(maxDate.getDate() + 7);

        if (reservationDate > maxDate) {
            return res.status(400).send('You can only reserve up to 7 days ahead.');
        }

        for (const slot of timeSlots) {
            const confirmedCount = await Reservation.countDocuments({
                lab: labId,
                date: reservationDate,
                timeSlot: slot,
                status: 'Confirmed'
            });

            if (confirmedCount >= lab.capacity) {
                return res.status(400).send('Time slot ' + slot + ' is fully booked.');
            }

            const userExisting = await Reservation.findOne({
                user: bookingUserId,
                date: reservationDate,
                timeSlot: slot,
                status: 'Confirmed'
            });

            if (userExisting) {
                return res.status(400).send('You already have a reservation for ' + slot + '.');
            }

            if (seatNumber) {
                const seatTaken = await Reservation.findOne({
                    lab: labId,
                    date: reservationDate,
                    timeSlot: slot,
                    seatNumber: parseInt(seatNumber),
                    status: 'Confirmed'
                });

                if (seatTaken) {
                    return res.status(400).send('Seat ' + seatNumber + ' is already taken for ' + slot + '.');
                }
            }
        }

        for (const slot of timeSlots) {
            await Reservation.create({
                user: bookingUserId,
                lab: labId,
                date: reservationDate,
                timeSlot: slot,
                purpose,
                seatNumber: seatNumber ? parseInt(seatNumber) : null,
                isAnonymous: isAnonymous === 'on',
                status: 'Confirmed'
            });
        }

        res.redirect('/manage-reservations');
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// update reservation
exports.updateReservation = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        const reservation = await Reservation.findById(req.params.id);

        if (!reservation) {
            return res.status(404).send('Reservation not found');
        }

        const student = isStudent(req.session.user);
        const technician = isTechnician(req.session.user);

        const canEdit =
            (technician && reservation.status === 'Confirmed') ||
            (
                student &&
                reservation.user.toString() === req.session.user._id.toString() &&
                reservation.status === 'Confirmed'
            );

        if (!canEdit) {
            return res.status(403).send('Unauthorized');
        }

        const { date, timeSlot, purpose } = req.body;

        if (!date || !timeSlot || !purpose) {
            return res.status(400).send('Missing reservation information.');
        }

        if (!isValidTimeSlot(timeSlot)) {
            return res.status(400).send('Invalid time slot.');
        }

        const reservationDate = normalizeDateOnly(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (reservationDate < today) {
            return res.status(400).send('Cannot move reservation to a past date.');
        }

        const lab = await Lab.findById(reservation.lab);

        if (!lab) {
            return res.status(404).send('Lab not found.');
        }

        const confirmedCount = await Reservation.countDocuments({
            _id: { $ne: req.params.id },
            lab: reservation.lab,
            date: reservationDate,
            timeSlot,
            status: 'Confirmed'
        });

        if (confirmedCount >= lab.capacity) {
            return res.status(400).send('This slot is fully booked.');
        }

        const userExistingReservation = await Reservation.findOne({
            _id: { $ne: req.params.id },
            user: reservation.user,
            date: reservationDate,
            timeSlot,
            status: 'Confirmed'
        });

        if (userExistingReservation) {
            return res.status(400).send('This user already has a reservation for this time slot.');
        }

        await Reservation.findByIdAndUpdate(req.params.id, {
            date: reservationDate,
            timeSlot,
            purpose
        });

        res.redirect('/manage-reservations');
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// cancel reservation
exports.cancelReservation = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        const reservation = await Reservation.findById(req.params.id);

        if (!reservation) {
            return res.status(404).send('Reservation not found');
        }

        const student = isStudent(req.session.user);
        const technician = isTechnician(req.session.user);

        const canCancel =
            (technician && reservation.status === 'Confirmed') ||
            (
                student &&
                reservation.user.toString() === req.session.user._id.toString() &&
                reservation.status === 'Confirmed'
            );

        if (!canCancel) {
            return res.status(403).send('Unauthorized');
        }

        await Reservation.findByIdAndUpdate(req.params.id, {
            status: 'Cancelled'
        });

        res.redirect('/manage-reservations');
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// marks reservation as arrived/completed
exports.markArrived = async (req, res) => {
    try {
        if (!req.session.user || !isTechnician(req.session.user)) {
            return res.status(403).send('Unauthorized');
        }

        const reservation = await Reservation.findById(req.params.id);

        if (!reservation) {
            return res.status(404).send('Reservation not found');
        }

        if (reservation.status !== 'Confirmed') {
            return res.status(400).send('Reservation cannot be marked as arrived.');
        }

        await Reservation.findByIdAndUpdate(req.params.id, {
            status: 'Completed'
        });

        res.redirect('/manage-reservations');
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// marks reservation as no-show and increments user count
exports.markNoShow = async (req, res) => {
    try {
        if (!req.session.user || !isTechnician(req.session.user)) {
            return res.status(403).send('Unauthorized');
        }

        const reservation = await Reservation.findById(req.params.id).populate('user');

        if (!reservation) {
            return res.status(404).send('Reservation not found');
        }

        if (reservation.status !== 'Confirmed') {
            return res.status(400).send('Reservation cannot be marked as no-show.');
        }

        reservation.status = 'No Show';
        await reservation.save();

        const user = await User.findById(reservation.user._id);

        if (!user) {
            return res.status(404).send('User not found');
        }

        user.noShowCount += 1;

        if (user.noShowCount >= 3) {
            user.isBanned = true;
        }

        await user.save();

        res.redirect('/manage-reservations');
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// resolve no-show
exports.resolveNoShow = async (req, res) => {
    try {
        if (!req.session.user || !isTechnician(req.session.user)) {
            return res.status(403).send('Unauthorized');
        }

        const reservation = await Reservation.findById(req.params.id).populate('user');

        if (!reservation) {
            return res.status(404).send('Reservation not found');
        }

        if (reservation.status !== 'No Show') {
            return res.status(400).send('Only no-show reservations can be resolved.');
        }

        reservation.status = 'Completed';
        await reservation.save();

        if (reservation.user) {
            const user = await User.findById(reservation.user._id);

            if (user) {
                user.noShowCount = Math.max(0, (user.noShowCount || 0) - 1);

                if (user.noShowCount < 3) {
                    user.isBanned = false;
                }

                await user.save();
            }
        }

        res.redirect('/manage-no-shows');
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// flag no-show user manually
exports.flagNoShowUser = async (req, res) => {
    try {
        if (!req.session.user || !isTechnician(req.session.user)) {
            return res.status(403).send('Unauthorized');
        }

        const reservation = await Reservation.findById(req.params.id).populate('user');

        if (!reservation || !reservation.user) {
            return res.status(404).send('Reservation or user not found');
        }

        await User.findByIdAndUpdate(reservation.user._id, {
            isBanned: true,
            noShowCount: Math.max(reservation.user.noShowCount || 0, 3)
        });

        await Reservation.findByIdAndUpdate(req.params.id, {
            status: 'Flagged'
        });

        res.redirect('/manage-no-shows');
    } catch (err) {
        res.status(500).send(err.message);
    }
};