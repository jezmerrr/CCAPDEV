var buildings = SERVER_BUILDINGS;

var selectedRoom = null;
var selectedRoomData = null;
var currentBuildingKey = null;
var seatsBySlot = {};
var bookedSlots = [];
var reservationCountBySlot = {};
var capacity = 0;

function getSelectedDate() {
    return document.getElementById('form-date').value;
}

function getSelectedTimeSlots() {
    var checked = document.querySelectorAll('#time-slot-checkboxes input[type="checkbox"]:checked');
    var slots = [];
    checked.forEach(function (cb) { slots.push(cb.value); });
    return slots;
}

function renderBuildingCards() {
    var container = document.getElementById('hall-cards');

    var imageMap = {
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
            resetRoomSelection();
            renderRooms(currentBuildingKey);
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
        card.addEventListener('click', function () {
            document.querySelectorAll('.room-item').forEach(function (c) { c.classList.remove('selected'); });
            this.classList.add('selected');

            selectedRoom = this.dataset.roomId;
            selectedRoomData = {
                name: this.dataset.roomName,
                capacity: parseInt(this.dataset.capacity)
            };

            document.getElementById('form-lab-id').value = selectedRoom;
            document.getElementById('form-room').value = selectedRoomData.name;

            updateSubmitButton();
            fetchSlotAvailability();
        });
    });
}

function resetRoomSelection() {
    selectedRoom = null;
    selectedRoomData = null;
    seatsBySlot = {};
    bookedSlots = [];
    reservationCountBySlot = {};
    capacity = 0;
    document.getElementById('form-lab-id').value = '';
    document.getElementById('form-room').value = '';
    resetSlotBadges();
    hideSeatTable();
    updateSubmitButton();
}

function updateSubmitButton() {
    var btn = document.getElementById('btn-submit');
    btn.disabled = false;
}

function validateForm() {
    var missing = [];
    if (!selectedRoom) missing.push('a room');
    if (!getSelectedDate()) missing.push('a date');
    if (getSelectedTimeSlots().length === 0) missing.push('at least one time slot');
    if (!document.getElementById('purpose').value.trim()) missing.push('a purpose/reason');
    var seatInput = document.getElementById('form-seat-number');
    if (!seatInput || !seatInput.value) missing.push('a seat');
    return missing;
}

// fetch availability data when room or date changes
async function fetchSlotAvailability() {
    var date = getSelectedDate();

    if (!selectedRoom || !date) {
        resetSlotBadges();
        hideSeatTable();
        return;
    }

    try {
        var res = await fetch('/api/lab-reservations?labId=' + selectedRoom + '&date=' + date);
        var data = await res.json();
        seatsBySlot = data.seatsBySlot || {};
        bookedSlots = data.bookedSlots || [];
        reservationCountBySlot = data.reservationCountBySlot || {};
        capacity = data.capacity || (selectedRoomData ? selectedRoomData.capacity : 0);
    } catch (err) {
        seatsBySlot = {};
        bookedSlots = [];
        reservationCountBySlot = {};
    }

    // update time slot checkboxes with availability info
    updateSlotBadges();
    disablePastTimeSlots();

    // if time slots are already selected, show the seat table
    var slots = getSelectedTimeSlots();
    if (slots.length > 0) {
        renderSeatTable(slots);
    } else {
        hideSeatTable();
    }
}

function disablePastTimeSlots() {
    var selectedDate = getSelectedDate();
    var today = new Date();
    var todayStr = today.toISOString().split('T')[0];
    var isToday = selectedDate === todayStr;

    document.querySelectorAll('#time-slot-checkboxes .slot-checkbox').forEach(function (label) {
        var cb = label.querySelector('input[type="checkbox"]');
        var slotValue = cb.value;

        if (isToday) {
            var startTime = slotValue.split('-')[0];
            var parts = startTime.split(':');
            var slotHour = parseInt(parts[0]);
            var slotMinute = parseInt(parts[1]);

            var currentHour = today.getHours();
            var currentMinute = today.getMinutes();

            if (slotHour < currentHour || (slotHour === currentHour && slotMinute <= currentMinute)) {
                cb.disabled = true;
                cb.checked = false;
                label.classList.add('slot-past');
            } else {
                label.classList.remove('slot-past');
            }
        } else {
            label.classList.remove('slot-past');
        }
    });
}

// update checkbox labels to show availability counts and disable fully booked slots
function updateSlotBadges() {
    var totalCapacity = selectedRoomData ? selectedRoomData.capacity : 0;

    document.querySelectorAll('#time-slot-checkboxes .slot-checkbox').forEach(function (label) {
        var cb = label.querySelector('input[type="checkbox"]');
        var slotValue = cb.value;
        var booked = reservationCountBySlot[slotValue] || 0;
        var isFull = bookedSlots.indexOf(slotValue) !== -1;

        // remove old badge if any
        var oldBadge = label.querySelector('.slot-count-badge');
        if (oldBadge) oldBadge.remove();

        // add availability badge
        var badge = document.createElement('span');
        badge.className = 'slot-count-badge' + (isFull ? ' full' : (booked > 0 ? ' partial' : ''));
        if (isFull) {
            badge.textContent = 'FULL';
        } else {
            badge.textContent = booked + '/' + totalCapacity + ' reserved';
        }
        label.appendChild(badge);

        // disable fully booked slots (but don't re-enable past slots)
        if (isFull) {
            cb.disabled = true;
            cb.checked = false;
            label.classList.add('slot-full');
        } else if (!label.classList.contains('slot-past')) {
            cb.disabled = false;
            label.classList.remove('slot-full');
        }
    });
}

// reset all slot badges to default
function resetSlotBadges() {
    document.querySelectorAll('#time-slot-checkboxes .slot-checkbox').forEach(function (label) {
        var cb = label.querySelector('input[type="checkbox"]');
        var oldBadge = label.querySelector('.slot-count-badge');
        if (oldBadge) oldBadge.remove();
        cb.disabled = false;
        label.classList.remove('slot-full');
    });
}

function hideSeatTable() {
    document.getElementById('seat-availability-section').style.display = 'none';
}

function renderSeatTable(selectedSlots) {
    var section = document.getElementById('seat-availability-section');
    var tbody = document.getElementById('seat-table-body');
    var info = document.getElementById('seat-availability-info');

    if (!selectedRoomData || selectedSlots.length === 0) {
        section.style.display = 'none';
        return;
    }

    var totalCapacity = selectedRoomData.capacity;

    // merge booked seats across all selected time slots
    var mergedBookedSeats = {};
    selectedSlots.forEach(function (slot) {
        var seats = seatsBySlot[slot] || [];
        seats.forEach(function (s) {
            if (!mergedBookedSeats[s.seat]) {
                mergedBookedSeats[s.seat] = s;
            }
        });
    });

    var bookedCount = Object.keys(mergedBookedSeats).length;

    // build slot labels for display
    var slotLabels = selectedSlots.map(function (slot) {
        var cb = document.querySelector('#time-slot-checkboxes input[value="' + slot + '"]');
        return cb ? cb.parentElement.querySelector('.slot-checkbox-label').textContent.trim() : slot;
    });
    var slotDisplay = slotLabels.join(', ');

    info.textContent = selectedRoomData.name + ' \u2022 ' + slotDisplay + ' \u2022 ' +
        bookedCount + '/' + totalCapacity + ' reserved';

    var html = '';
    for (var i = 1; i <= totalCapacity; i++) {
        var bookedInfo = mergedBookedSeats[i];
        var isBooked = !!bookedInfo;

        if (isBooked) {
            var nameHtml;
            if (bookedInfo.isAnonymous) {
                nameHtml = '<span class="anonymous-label"><i class="fa-solid fa-user-secret"></i> Anonymous</span>';
            } else if (bookedInfo.userId) {
                nameHtml = '<a href="/user-profile/' + bookedInfo.userId + '" class="user-profile-link">' +
                    bookedInfo.bookedBy + '</a>';
            } else {
                nameHtml = '<span>' + bookedInfo.bookedBy + '</span>';
            }

            html += '<tr class="seat-row booked">' +
                '<td><span class="seat-badge booked">' + i + '</span></td>' +
                '<td><span class="status-badge reserved">Reserved</span></td>' +
                '<td>' + nameHtml + '</td>' +
                '<td><span class="seat-taken-label">Taken</span></td>' +
                '</tr>';
        } else {
            html += '<tr class="seat-row available">' +
                '<td><span class="seat-badge available">' + i + '</span></td>' +
                '<td><span class="status-badge available">Available</span></td>' +
                '<td><span class="empty-seat">\u2014</span></td>' +
                '<td><button type="button" class="btn-reserve-seat" data-seat="' + i + '">' +
                '<i class="fa-solid fa-plus"></i> Reserve</button></td>' +
                '</tr>';
        }
    }

    tbody.innerHTML = html;
    section.style.display = 'block';

    // attach reserve button handlers
    document.querySelectorAll('.btn-reserve-seat').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var seatNum = parseInt(this.dataset.seat);
            selectSeatFromTable(seatNum);
        });
    });
}

function selectSeatFromTable(seatNum) {
    // create/update hidden seat input
    var existingInput = document.getElementById('form-seat-number');
    if (!existingInput) {
        var input = document.createElement('input');
        input.type = 'hidden';
        input.id = 'form-seat-number';
        input.name = 'seatNumber';
        document.getElementById('booking-form').appendChild(input);
    }
    document.getElementById('form-seat-number').value = seatNum;

    // highlight the selected row
    document.querySelectorAll('.seat-row').forEach(function (row) {
        row.classList.remove('selected-seat');
    });
    document.querySelectorAll('.btn-reserve-seat').forEach(function (btn) {
        if (parseInt(btn.dataset.seat) === seatNum) {
            btn.closest('tr').classList.add('selected-seat');
            btn.innerHTML = '<i class="fa-solid fa-check"></i> Selected';
            btn.classList.add('selected');
        } else {
            btn.innerHTML = '<i class="fa-solid fa-plus"></i> Reserve';
            btn.classList.remove('selected');
        }
    });

    showToast('Seat ' + seatNum + ' selected', 'success');
    updateSubmitButton();
}

function resetForm() {
    document.querySelectorAll('.room-item').forEach(function (c) { c.classList.remove('selected'); });
    resetRoomSelection();

    document.getElementById('form-date').value = new Date().toISOString().split('T')[0];
    document.querySelectorAll('#time-slot-checkboxes input[type="checkbox"]').forEach(function (cb) {
        cb.checked = false;
    });
    document.getElementById('purpose').value = '';
    document.getElementById('is-anonymous').checked = false;

    var seatInput = document.getElementById('form-seat-number');
    if (seatInput) seatInput.value = '';

    hideSeatTable();
    updateSubmitButton();
}

function showToast(message, type) {
    var toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast ' + (type || 'success') + ' show';
    setTimeout(function () {
        toast.classList.remove('show');
    }, 3000);
}

function clearSeatSelection() {
    var seatInput = document.getElementById('form-seat-number');
    if (seatInput) seatInput.value = '';
    document.querySelectorAll('.seat-row').forEach(function (row) {
        row.classList.remove('selected-seat');
    });
    document.querySelectorAll('.btn-reserve-seat').forEach(function (btn) {
        btn.innerHTML = '<i class="fa-solid fa-plus"></i> Reserve';
        btn.classList.remove('selected');
    });
    updateSubmitButton();
}

document.addEventListener('DOMContentLoaded', function () {
    var bookingForm = document.getElementById('booking-form');
    var submitBtn = document.getElementById('btn-submit');
    var isSubmitting = false;

    bookingForm.addEventListener('submit', function (e) {
        e.preventDefault();

        var missing = validateForm();
        if (missing.length > 0) {
            showToast('Please select ' + missing.join(', ') + '.', 'error');
            return;
        }

        if (isSubmitting) return;
        isSubmitting = true;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Reserving...';

        var formData = new FormData(bookingForm);
        var params = new URLSearchParams(formData).toString();

        fetch(bookingForm.action, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            body: params
        })
        .then(function (res) {
            return res.json().then(function (data) {
                return { status: res.status, data: data };
            });
        })
        .then(function (result) {
            if (result.data.success) {
                showToast('Reservation created successfully!', 'success');
                setTimeout(function () {
                    window.location.href = result.data.redirect || '/manage-reservations';
                }, 1000);
            } else {
                showToast(result.data.error || 'Failed to create reservation.', 'error');
                isSubmitting = false;
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Confirm Reservation';
            }
        })
        .catch(function () {
            showToast('Something went wrong. Please try again.', 'error');
            isSubmitting = false;
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Confirm Reservation';
        });
    });

    var dateInput = document.getElementById('form-date');
    var today = new Date();
    var maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 7);
    dateInput.value = today.toISOString().split('T')[0];
    dateInput.min = today.toISOString().split('T')[0];
    dateInput.max = maxDate.toISOString().split('T')[0];

    renderBuildingCards();
    disablePastTimeSlots();

    if (buildings.length > 0) {
        currentBuildingKey = buildings[0].key;
        renderRooms(currentBuildingKey);
    }

    dateInput.addEventListener('change', function () {
        // prevent selecting past dates 
        var today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
        if (dateInput.value < today) {
            dateInput.value = today;
            showToast('Cannot select a past date.', 'error');
        }
        clearSeatSelection();
        disablePastTimeSlots();
        updateSubmitButton();
        fetchSlotAvailability();
    });

    document.querySelectorAll('#time-slot-checkboxes input[type="checkbox"]').forEach(function (cb) {
        cb.addEventListener('change', function () {
            clearSeatSelection();
            updateSubmitButton();
            var slots = getSelectedTimeSlots();
            if (slots.length > 0 && selectedRoom && getSelectedDate()) {
                renderSeatTable(slots);
            } else {
                hideSeatTable();
            }
        });
    });

    document.getElementById('reset-form').addEventListener('click', resetForm);

    updateSubmitButton();
});
