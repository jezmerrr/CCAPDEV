const buildings = SERVER_DATA.buildings;
const timeSlots = SERVER_DATA.timeSlots;

let selectedRoom = null;
let selectedRoomData = null;
let selectedDate = new Date().toISOString().split('T')[0];
let selectedSlot = null;
let currentBuildingKey = null;
let bookedSlots = [];
let seatsBySlot = {};
let selectedSeat = null;
let tempSelectedSeat = null;

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

async function fetchBookedSlots(labId, date) {
    try {
        const res = await fetch('/api/lab-reservations?labId=' + labId + '&date=' + date);
        const data = await res.json();
        bookedSlots = data.bookedSlots || [];
        seatsBySlot = data.seatsBySlot || {};
    } catch (err) {
        bookedSlots = [];
        seatsBySlot = {};
    }
}

function renderBuildingCards() {
    const container = document.getElementById('hall-cards');

    const imageMap = {
        'gokongwei-hall': '/assets/images/goks.jpg',
        'velasco-hall': '/assets/images/velasco.jpg',
        'lasalle-hall': '/assets/images/ls_hall.png'
    };

    container.innerHTML = buildings.map(function (b) {
        return '<div class="hall-card ' + (b.isActive ? 'active' : '') + '" data-building="' + b.key + '"' +
            ' style="background-image: url(\'' + (imageMap[b.key] || '') + '\');">' +
            '<div class="hall-card-overlay"></div>' +
            '<div class="hall-card-content">' +
            '<i class="fa-solid fa-building"></i>' +
            '<span>' + b.name + '</span>' +
            '</div></div>';
    }).join('');

    document.querySelectorAll('.hall-card').forEach(function (card) {
        card.addEventListener('click', function () {
            document.querySelectorAll('.hall-card').forEach(function (c) { c.classList.remove('active'); });
            this.classList.add('active');
            currentBuildingKey = this.dataset.building;
            selectedRoom = null;
            selectedRoomData = null;
            selectedSlot = null;
            selectedSeat = null;
            renderRooms(currentBuildingKey);
            renderTimeSlots();
            document.getElementById('selected-room-name').textContent = 'Select a room';
            document.getElementById('selected-room-details').innerHTML = '<span>Please select a room from the left</span>';
        });
    });
}

function renderRooms(buildingKey) {
    var roomsList = document.getElementById('rooms-list');
    var building = buildings.find(function (b) { return b.key === buildingKey; });

    if (!building) {
        roomsList.innerHTML = '<p>No rooms available</p>';
        return;
    }

    roomsList.innerHTML = building.labs.map(function (lab) {
        return '<div class="room-item ' + (selectedRoom === lab._id ? 'selected' : '') + '"' +
            ' data-room-id="' + lab._id + '"' +
            ' data-room-name="' + lab.labName + '"' +
            ' data-capacity="' + lab.capacity + '">' +
            '<div class="room-item-name">' + lab.labName + '</div>' +
            '<div class="room-item-meta">' +
            '<span><i class="fa-solid fa-desktop"></i> ' + lab.capacity + ' seats</span>' +
            '</div></div>';
    }).join('');

    document.querySelectorAll('.room-item').forEach(function (card) {
        card.addEventListener('click', async function () {
            document.querySelectorAll('.room-item').forEach(function (c) { c.classList.remove('selected'); });
            this.classList.add('selected');

            selectedRoom = this.dataset.roomId;
            selectedRoomData = {
                name: this.dataset.roomName,
                capacity: parseInt(this.dataset.capacity)
            };
            selectedSlot = null;
            selectedSeat = null;

            document.getElementById('selected-room-name').textContent = selectedRoomData.name;
            document.getElementById('selected-room-details').innerHTML =
                '<span>' + selectedRoomData.capacity + ' Seats</span>';

            await fetchBookedSlots(selectedRoom, selectedDate);
            renderTimeSlots();
        });
    });
}

function renderTimeSlots() {
    var container = document.getElementById('time-slots-container');

    if (!selectedRoom) {
        container.innerHTML =
            '<div class="empty-state">' +
            '<i class="fa-solid fa-hand-pointer"></i>' +
            '<p>Please select a room to view available time slots</p>' +
            '</div>';
        return;
    }

    var html = '<div class="time-slots-list">';

    timeSlots.forEach(function (slot) {
        var isBooked = bookedSlots.includes(slot.value);
        var isSelected = selectedSlot === slot.value;
        var slotClass = isBooked ? 'unavailable' : (isSelected ? 'selected' : 'available');
        var statusText = isBooked ? 'Booked' : (isSelected ? 'Selected' : 'Available');

        html += '<div class="time-slot-row">' +
            '<div class="time-label">' + slot.label + '</div>' +
            '<div class="time-bar ' + slotClass + '" data-slot="' + slot.value + '"' +
            (isBooked ? ' data-booked="true"' : '') + '>' +
            '<span class="bar-status">' + statusText + '</span>' +
            '</div></div>';
    });

    html += '</div>';
    container.innerHTML = html;

    document.querySelectorAll('.time-bar.available, .time-bar.selected').forEach(function (bar) {
        bar.addEventListener('click', function () {
            if (this.dataset.booked) return;
            toggleSlotSelection(this.dataset.slot);
        });
    });
}

function toggleSlotSelection(slotValue) {
    if (selectedSlot === slotValue) {
        selectedSlot = null;
        selectedSeat = null;
        document.getElementById('booking-panel').classList.remove('active');
    } else {
        selectedSlot = slotValue;
        selectedSeat = null;
        resetSeatUI();
        updateBookingSummary();
        document.getElementById('booking-panel').classList.add('active');
    }
    renderTimeSlots();
}

function resetSeatUI() {
    document.getElementById('form-seat-number').value = '';
    document.getElementById('summary-seat').textContent = 'Not selected';
    var btn = document.getElementById('btn-select-seat');
    btn.classList.remove('has-seat');
    document.getElementById('btn-seat-label').textContent = 'Select Seat';
}

function updateBookingSummary() {
    document.getElementById('summary-room').textContent = selectedRoomData ? selectedRoomData.name : '-';
    document.getElementById('summary-date').textContent = formatDate(selectedDate);

    var slot = timeSlots.find(function (s) { return s.value === selectedSlot; });
    document.getElementById('summary-time').textContent = slot ? slot.label : '-';

    if (selectedSeat) {
        document.getElementById('summary-seat').textContent = 'Seat ' + selectedSeat;
    } else {
        document.getElementById('summary-seat').textContent = 'Not selected';
    }

    // update hidden form fields
    document.getElementById('form-lab-id').value = selectedRoom || '';
    document.getElementById('form-date').value = selectedDate;
    document.getElementById('form-time-slot').value = selectedSlot || '';
    document.getElementById('form-seat-number').value = selectedSeat || '';
}

// seat modal
function openSeatModal() {
    if (!selectedRoom || !selectedSlot || !selectedRoomData) return;

    tempSelectedSeat = selectedSeat;
    renderSeatGrid();
    document.getElementById('seat-modal').classList.add('active');
}

function closeSeatModal() {
    document.getElementById('seat-modal').classList.remove('active');
    tempSelectedSeat = null;
}

function renderSeatGrid() {
    var grid = document.getElementById('seat-grid');
    var capacity = selectedRoomData.capacity;
    var bookedSeats = seatsBySlot[selectedSlot] || [];

    var html = '';
    for (var i = 1; i <= capacity; i++) {
        var bookedInfo = bookedSeats.find(function (s) { return s.seat === i; });
        var isBooked = !!bookedInfo;
        var isSelected = tempSelectedSeat === i;
        var seatClass = isBooked ? 'booked' : (isSelected ? 'selected' : 'available');
        var occupantText = isBooked ? bookedInfo.bookedBy : (isSelected ? 'Your seat' : 'Available');

        html += '<div class="seat-item ' + seatClass + '" data-seat="' + i + '"' +
            (isBooked ? ' data-booked="true"' : '') + '>' +
            '<span class="seat-number">' + i + '</span>' +
            '<span class="seat-occupant">' + occupantText + '</span>' +
            '</div>';
    }

    grid.innerHTML = html;

    document.querySelectorAll('.seat-item.available, .seat-item.selected').forEach(function (item) {
        item.addEventListener('click', function () {
            var seatNum = parseInt(this.dataset.seat);
            if (this.dataset.booked) return;

            if (tempSelectedSeat === seatNum) {
                tempSelectedSeat = null;
            } else {
                tempSelectedSeat = seatNum;
            }
            renderSeatGrid();
        });
    });
}

function confirmSeatSelection() {
    selectedSeat = tempSelectedSeat;
    closeSeatModal();

    var btn = document.getElementById('btn-select-seat');
    if (selectedSeat) {
        btn.classList.add('has-seat');
        document.getElementById('btn-seat-label').textContent = 'Seat ' + selectedSeat + ' selected';
    } else {
        btn.classList.remove('has-seat');
        document.getElementById('btn-seat-label').textContent = 'Select Seat';
    }

    updateBookingSummary();
}

function showToast(message, type) {
    var toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast ' + (type || 'success') + ' show';
    setTimeout(function () {
        toast.classList.remove('show');
    }, 3000);
}

document.addEventListener('DOMContentLoaded', function () {
    // set date picker to today
    var datePicker = document.getElementById('date-picker');
    datePicker.value = selectedDate;

    // render building cards
    renderBuildingCards();

    // set initial building
    if (buildings.length > 0) {
        currentBuildingKey = buildings[0].key;
        renderRooms(currentBuildingKey);
    }

    renderTimeSlots();

    // date navigation
    document.getElementById('prev-day').addEventListener('click', async function () {
        var currentDate = new Date(datePicker.value);
        currentDate.setDate(currentDate.getDate() - 1);
        datePicker.value = currentDate.toISOString().split('T')[0];
        selectedDate = datePicker.value;
        selectedSlot = null;
        selectedSeat = null;
        if (selectedRoom) {
            await fetchBookedSlots(selectedRoom, selectedDate);
        }
        renderTimeSlots();
    });

    document.getElementById('next-day').addEventListener('click', async function () {
        var currentDate = new Date(datePicker.value);
        currentDate.setDate(currentDate.getDate() + 1);
        datePicker.value = currentDate.toISOString().split('T')[0];
        selectedDate = datePicker.value;
        selectedSlot = null;
        selectedSeat = null;
        if (selectedRoom) {
            await fetchBookedSlots(selectedRoom, selectedDate);
        }
        renderTimeSlots();
    });

    datePicker.addEventListener('change', async function () {
        selectedDate = this.value;
        selectedSlot = null;
        selectedSeat = null;
        if (selectedRoom) {
            await fetchBookedSlots(selectedRoom, selectedDate);
        }
        renderTimeSlots();
    });

    // booking panel controls
    document.getElementById('close-panel').addEventListener('click', function () {
        document.getElementById('booking-panel').classList.remove('active');
        selectedSlot = null;
        selectedSeat = null;
        renderTimeSlots();
    });

    document.getElementById('cancel-booking').addEventListener('click', function () {
        selectedSlot = null;
        selectedSeat = null;
        renderTimeSlots();
        document.getElementById('booking-panel').classList.remove('active');
    });

    // seat modal controls
    document.getElementById('btn-select-seat').addEventListener('click', openSeatModal);
    document.getElementById('close-seat-modal').addEventListener('click', closeSeatModal);
    document.getElementById('seat-modal-cancel').addEventListener('click', closeSeatModal);
    document.getElementById('seat-modal-confirm').addEventListener('click', confirmSeatSelection);
});
