const labRooms = {
    gokongwei: [
        { room: 'G203', seats: 20, available: 10 },
        { room: 'G204', seats: 20, available: 15 },
        { room: 'G303', seats: 20, available: 8 },
        { room: 'G304', seats: 20, available: 20 }
    ],
    velasco: [
        { room: 'V202', seats: 20, available: 14 },
        { room: 'V203', seats: 20, available: 22 },
        { room: 'V205', seats: 20, available: 18 },
        { room: 'V206', seats: 20, available: 12 }
    ],
    lasalle: [
        { room: 'LS201', seats: 20, available: 16 },
        { room: 'LS203', seats: 20, available: 9 },
        { room: 'LS303', seats: 20, available: 20 },
        { room: 'LS304', seats: 20, available: 11 }
    ]
};

const existingBookings = {
    'G203': [
        { date: '2026-02-13', slots: ['09:00', '09:30', '10:00', '10:30', '11:00'] },
        { date: '2026-02-13', slots: ['13:00', '13:30'] }
    ],
    'G204': [
        { date: '2026-02-13', slots: ['14:00', '14:30', '15:00'] }
    ],
    'G303': [
        { date: '2026-02-13', slots: ['10:00', '10:30', '11:00', '11:30'] }
    ]
};

const timeSlots = [
    '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00'
];

let selectedRoom = null;
let selectedDate = '2026-02-13';
let selectedSlots = [];
let currentLocation = 'gokongwei';

function formatTime(time24) {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
    return `${hour12}:${minutes} ${period}`;
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function isSlotBooked(room, date, slot) {
    if (!existingBookings[room]) return false;
    const roomBookings = existingBookings[room];
    return roomBookings.some(booking =>
        booking.date === date && booking.slots.includes(slot)
    );
}

function renderTimeSlots() {
    const container = document.getElementById('time-slots-container');

    if (!selectedRoom) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-hand-pointer"></i>
                <p>Please select a room to view available time slots</p>
            </div>
        `;
        return;
    }

    let html = '<div class="time-slots-list">';

    timeSlots.forEach(slot => {
        const isBooked = isSlotBooked(selectedRoom, selectedDate, slot);
        const isSelected = selectedSlots.includes(slot);
        const slotClass = isBooked ? 'unavailable' : (isSelected ? 'selected' : 'available');

        html += `
            <div class="time-slot-row">
                <div class="time-label">${formatTime(slot)}</div>
                <div class="time-bar ${slotClass}" data-slot="${slot}" ${isBooked ? 'data-booked="true"' : ''}>
                    <span class="bar-status">${isBooked ? 'Booked' : (isSelected ? 'Selected' : 'Available')}</span>
                </div>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;

    document.querySelectorAll('.time-bar.available, .time-bar.selected').forEach(bar => {
        bar.addEventListener('click', function() {
            if (this.dataset.booked) return;
            toggleSlotSelection(this.dataset.slot);
        });
    });
}

function toggleSlotSelection(slot) {
    const index = selectedSlots.indexOf(slot);

    if (index === -1) {
        selectedSlots.push(slot);
    } else {
        selectedSlots.splice(index, 1);
    }

    selectedSlots.sort();
    renderTimeSlots();

    if (selectedSlots.length > 0) {
        updateBookingSummary();
        document.getElementById('booking-panel').classList.add('active');
    } else {
        document.getElementById('booking-panel').classList.remove('active');
    }
}

function updateBookingSummary() {
    document.getElementById('summary-room').textContent = selectedRoom || '-';
    document.getElementById('summary-date').textContent = formatDate(selectedDate);

    if (selectedSlots.length > 0) {
        const firstSlot = formatTime(selectedSlots[0]);
        const lastSlotIndex = timeSlots.indexOf(selectedSlots[selectedSlots.length - 1]);
        const endTime = lastSlotIndex < timeSlots.length - 1
            ? formatTime(timeSlots[lastSlotIndex + 1])
            : formatTime(selectedSlots[selectedSlots.length - 1]) + ' +30min';

        document.getElementById('summary-time').textContent = `${firstSlot} - ${endTime}`;
    } else {
        document.getElementById('summary-time').textContent = '-';
    }
}

function renderRooms(location) {
    const roomsList = document.querySelector('.rooms-list');
    const rooms = labRooms[location];

    roomsList.innerHTML = rooms.map(room => `
        <div class="room-item ${selectedRoom === room.room ? 'selected' : ''}" data-room="${room.room}">
            <div class="room-item-name">${room.room}</div>
            <div class="room-item-meta">
                <span><i class="fa-solid fa-desktop"></i> ${room.seats}</span>
                <span><i class="fa-solid fa-users"></i> ${room.available} free</span>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.room-item').forEach(card => {
        card.addEventListener('click', function() {
            document.querySelectorAll('.room-item').forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');

            selectedRoom = this.dataset.room;
            const roomData = rooms.find(r => r.room === selectedRoom);

            document.getElementById('selected-room-name').textContent = selectedRoom;
            document.getElementById('selected-room-details').innerHTML = `
                <span>${roomData.seats} Seats</span>
                <span>•</span>
                <span>${roomData.available} Available Today</span>
            `;

            selectedSlots = [];
            renderTimeSlots();
            updateBookingSummary();
        });
    });

    if (!selectedRoom && rooms.length > 0) {
        selectedRoom = rooms[0].room;
        document.querySelector('.room-item').classList.add('selected');
        document.getElementById('selected-room-name').textContent = selectedRoom;
        document.getElementById('selected-room-details').innerHTML = `
            <span>${rooms[0].seats} Seats</span>
            <span>•</span>
            <span>${rooms[0].available} Available Today</span>
        `;
        renderTimeSlots();
    }
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.hall-card').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.hall-card').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentLocation = this.dataset.location;
            selectedRoom = null;
            selectedSlots = [];
            renderRooms(currentLocation);
        });
    });

    document.getElementById('prev-day').addEventListener('click', function() {
        const datePicker = document.getElementById('date-picker');
        const currentDate = new Date(datePicker.value);
        currentDate.setDate(currentDate.getDate() - 1);
        datePicker.value = currentDate.toISOString().split('T')[0];
        selectedDate = datePicker.value;
        selectedSlots = [];
        renderTimeSlots();
    });

    document.getElementById('next-day').addEventListener('click', function() {
        const datePicker = document.getElementById('date-picker');
        const currentDate = new Date(datePicker.value);
        currentDate.setDate(currentDate.getDate() + 1);
        datePicker.value = currentDate.toISOString().split('T')[0];
        selectedDate = datePicker.value;
        selectedSlots = [];
        renderTimeSlots();
    });

    document.getElementById('date-picker').addEventListener('change', function() {
        selectedDate = this.value;
        selectedSlots = [];
        renderTimeSlots();
        updateBookingSummary();
    });

    document.getElementById('close-panel').addEventListener('click', function() {
        document.getElementById('booking-panel').classList.remove('active');
    });

    document.getElementById('cancel-booking').addEventListener('click', function() {
        selectedSlots = [];
        renderTimeSlots();
        document.getElementById('booking-panel').classList.remove('active');
    });

    document.getElementById('booking-form').addEventListener('submit', function(e) {
        e.preventDefault();

        if (selectedSlots.length === 0) {
            showToast('Please select at least one time slot', 'error');
            return;
        }

        const firstSlot = formatTime(selectedSlots[0]);
        const lastSlotIndex = timeSlots.indexOf(selectedSlots[selectedSlots.length - 1]);
        const endTime = lastSlotIndex < timeSlots.length - 1
            ? formatTime(timeSlots[lastSlotIndex + 1])
            : formatTime(selectedSlots[selectedSlots.length - 1]) + ' +30min';

        document.getElementById('confirmation-message').innerHTML = `
            <strong>${selectedRoom}</strong> has been reserved for
            <strong>${formatDate(selectedDate)}</strong> from
            <strong>${firstSlot} - ${endTime}</strong>
        `;

        document.getElementById('booking-panel').classList.remove('active');
        document.getElementById('success-modal').classList.add('active');
        document.getElementById('booking-form').reset();
        selectedSlots = [];
        renderTimeSlots();
    });

    document.getElementById('modal-new-booking').addEventListener('click', function() {
        document.getElementById('success-modal').classList.remove('active');
    });

    renderRooms('gokongwei');
});
