var buildings = SERVER_BUILDINGS;

var selectedRoom = null;
var selectedRoomData = null;
var currentBuildingKey = null;
var seatsBySlot = {};
var bookedSlots = [];
var reservationCountBySlot = {};
var capacity = 0;
var studentFound = false;

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
    var hasRoom = !!selectedRoom;
    var hasDate = !!getSelectedDate();
    var hasSlots = getSelectedTimeSlots().length > 0;
    var seatInput = document.getElementById('form-seat-number');
    var hasSeat = seatInput && !!seatInput.value;
    btn.disabled = !(hasRoom && hasDate && hasSlots && hasSeat);
}

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

    updateSlotBadges();

    var slots = getSelectedTimeSlots();
    if (slots.length > 0) {
        renderSeatTable(slots);
    } else {
        hideSeatTable();
    }
}

function updateSlotBadges() {
    var totalCapacity = selectedRoomData ? selectedRoomData.capacity : 0;

    document.querySelectorAll('#time-slot-checkboxes .slot-checkbox').forEach(function (label) {
        var cb = label.querySelector('input[type="checkbox"]');
        var slotValue = cb.value;
        var booked = reservationCountBySlot[slotValue] || 0;
        var available = totalCapacity - booked;
        var isFull = bookedSlots.indexOf(slotValue) !== -1;

        var oldBadge = label.querySelector('.slot-count-badge');
        if (oldBadge) oldBadge.remove();

        var badge = document.createElement('span');
        badge.className = 'slot-count-badge' + (isFull ? ' full' : (booked > 0 ? ' partial' : ''));
        if (isFull) {
            badge.textContent = 'FULL';
        } else {
            badge.textContent = available + '/' + totalCapacity;
        }
        label.appendChild(badge);

        if (isFull) {
            cb.disabled = true;
            cb.checked = false;
            label.classList.add('slot-full');
        } else {
            cb.disabled = false;
            label.classList.remove('slot-full');
        }
    });
}

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

    var displaySlot = selectedSlots[0];
    var bookedSeats = seatsBySlot[displaySlot] || [];
    var totalCapacity = selectedRoomData.capacity;

    var slotLabel = displaySlot;
    var slotCheckbox = document.querySelector('#time-slot-checkboxes input[value="' + displaySlot + '"]');
    if (slotCheckbox) {
        slotLabel = slotCheckbox.parentElement.querySelector('.slot-checkbox-label').textContent;
    }

    info.textContent = selectedRoomData.name + ' \u2022 ' + slotLabel + ' \u2022 ' +
        (totalCapacity - bookedSeats.length) + '/' + totalCapacity + ' available';

    var html = '';
    for (var i = 1; i <= totalCapacity; i++) {
        var bookedInfo = bookedSeats.find(function (s) { return s.seat === i; });
        var isBooked = !!bookedInfo;

        if (isBooked) {
            var nameHtml;
            if (bookedInfo.isAnonymous) {
                nameHtml = '<span class="anonymous-label"><i class="fa-solid fa-user-secret"></i> Anonymous</span>';
            } else if (bookedInfo.userId) {
                nameHtml = '<a href="/view-profile/' + bookedInfo.userId + '" class="user-profile-link">' +
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

    document.querySelectorAll('.btn-reserve-seat').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var seatNum = parseInt(this.dataset.seat);
            selectSeatFromTable(seatNum);
        });
    });
}

function selectSeatFromTable(seatNum) {
    var existingInput = document.getElementById('form-seat-number');
    if (!existingInput) {
        var input = document.createElement('input');
        input.type = 'hidden';
        input.id = 'form-seat-number';
        input.name = 'seatNumber';
        document.getElementById('booking-form').appendChild(input);
    }
    document.getElementById('form-seat-number').value = seatNum;

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
    document.getElementById('student-email').value = '';
    document.getElementById('student-display').value = '';
    document.getElementById('student-id').value = '';
    studentFound = false;

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

document.addEventListener('DOMContentLoaded', function () {
    // date picker setup   
    document.getElementById('booking-form').addEventListener('submit', function (e) {
        var seatInput = document.getElementById('form-seat-number');
        var hasSeat = seatInput && !!seatInput.value;

        if (!hasSeat) {
            e.preventDefault();
            showToast('Please select a seat before confirming.', 'error');
        }
    });

    var dateInput = document.getElementById('form-date');
    var today = new Date();
    var maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 7);
    dateInput.value = today.toISOString().split('T')[0];
    dateInput.min = today.toISOString().split('T')[0];
    dateInput.max = maxDate.toISOString().split('T')[0];

    // render building cards
    renderBuildingCards();

    if (buildings.length > 0) {
        currentBuildingKey = buildings[0].key;
        renderRooms(currentBuildingKey);
    }

    // student email search
    var studentEmail = document.getElementById('student-email');
    var studentDisplay = document.getElementById('student-display');
    var studentIdInput = document.getElementById('student-id');
    var searchTimeout = null;

    studentEmail.addEventListener('input', function () {
        clearTimeout(searchTimeout);
        var email = this.value.trim();
        if (email.length < 3) {
            studentDisplay.value = '';
            studentIdInput.value = '';
            studentFound = false;
            updateSubmitButton();
            return;
        }
        searchTimeout = setTimeout(function () {
            fetch('/api/search-student?email=' + encodeURIComponent(email))
                .then(function (res) { return res.json(); })
                .then(function (data) {
                    if (data.user) {
                        studentDisplay.value = data.user.firstName + ' ' + data.user.lastName;
                        studentIdInput.value = data.user._id;
                        studentFound = true;
                        showToast('Student found: ' + data.user.firstName + ' ' + data.user.lastName, 'success');
                    } else {
                        studentDisplay.value = 'No student found';
                        studentIdInput.value = '';
                        studentFound = false;
                    }
                    updateSubmitButton();
                })
                .catch(function () {
                    studentDisplay.value = 'Search failed';
                    studentIdInput.value = '';
                    studentFound = false;
                    updateSubmitButton();
                });
        }, 500);
    });

    // date change
    dateInput.addEventListener('change', function () {
        updateSubmitButton();
        fetchSlotAvailability();
    });

    // time slot checkboxes
    document.querySelectorAll('#time-slot-checkboxes input[type="checkbox"]').forEach(function (cb) {
        cb.addEventListener('change', function () {
            updateSubmitButton();
            var slots = getSelectedTimeSlots();
            if (slots.length > 0 && selectedRoom && getSelectedDate()) {
                renderSeatTable(slots);
            } else {
                hideSeatTable();
            }
        });
    });

    // reset button
    document.getElementById('reset-form').addEventListener('click', resetForm);

    updateSubmitButton();
});
