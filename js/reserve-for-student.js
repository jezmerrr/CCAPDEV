const roomsByBuilding = {
    gokongwei: ['G203', 'G204', 'G303', 'G304'],
    velasco: ['V202', 'V203', 'V205', 'V206'],
    lasalle: ['LS201', 'LS203', 'LS303', 'LS304']
};

const timeSlots = [
    '07:30 AM', '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM',
    '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '01:00 PM',
    '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM',
    '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM'
];

const buildingNames = {
    'gokongwei': 'Gokongwei Hall',
    'velasco': 'Velasco Hall',
    'lasalle': 'La Salle Hall'
};

function populateRooms(building) {
    const roomSelect = document.getElementById('room');
    roomSelect.innerHTML = '<option value="">-- Select Room --</option>';

    if (building && roomsByBuilding[building]) {
        roomSelect.disabled = false;
        roomsByBuilding[building].forEach(room => {
            const option = document.createElement('option');
            option.value = room;
            option.textContent = `${room} - Computer Lab (20 seats)`;
            roomSelect.appendChild(option);
        });
    } else {
        roomSelect.disabled = true;
    }
}

function populateEndTime(startTime) {
    const endTimeSelect = document.getElementById('time-end');
    endTimeSelect.innerHTML = '<option value="">-- Select End Time --</option>';

    if (!startTime) {
        endTimeSelect.disabled = true;
        return;
    }

    endTimeSelect.disabled = false;
    const startIndex = timeSlots.indexOf(startTime);

    if (startIndex !== -1) {
        for (let i = startIndex + 1; i < Math.min(timeSlots.length, startIndex + 7); i++) {
            const option = document.createElement('option');
            option.value = timeSlots[i];
            option.textContent = timeSlots[i];
            endTimeSelect.appendChild(option);
        }
    }
}

function setMinDate() {
    const dateInput = document.getElementById('date');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.min = tomorrow.toISOString().split('T')[0];
}

function showSuccessModal(formData) {
    const modal = document.getElementById('success-modal');
    const summary = document.getElementById('reservation-summary');

    summary.innerHTML = `
        <div class="summary-row">
            <span class="label">Student:</span>
            <span class="value">${formData.studentName}</span>
        </div>
        <div class="summary-row">
            <span class="label">Student ID:</span>
            <span class="value">${formData.studentId}</span>
        </div>
        <div class="summary-row">
            <span class="label">Location:</span>
            <span class="value">${buildingNames[formData.building]} - ${formData.room}</span>
        </div>
        <div class="summary-row">
            <span class="label">Date:</span>
            <span class="value">${formData.date}</span>
        </div>
        <div class="summary-row">
            <span class="label">Time:</span>
            <span class="value">${formData.timeStart} - ${formData.timeEnd}</span>
        </div>
        <div class="summary-row">
            <span class="label">Number of Students:</span>
            <span class="value">${formData.numStudents}</span>
        </div>
    `;

    modal.classList.add('active');
}

document.addEventListener('DOMContentLoaded', function() {
    setMinDate();

    document.getElementById('building').addEventListener('change', function() {
        populateRooms(this.value);
    });

    document.getElementById('time-start').addEventListener('change', function() {
        populateEndTime(this.value);
    });

    document.getElementById('cancel-btn').addEventListener('click', function() {
        if (confirm('Are you sure you want to cancel?')) {
            document.getElementById('reserve-form').reset();
            document.getElementById('room').disabled = true;
            document.getElementById('time-end').disabled = true;
        }
    });

    document.getElementById('reserve-form').addEventListener('submit', function(e) {
        e.preventDefault();

        const formData = {
            studentId: document.getElementById('student-id').value,
            studentName: document.getElementById('student-name').value,
            studentEmail: document.getElementById('student-email').value,
            building: document.getElementById('building').value,
            room: document.getElementById('room').value,
            date: document.getElementById('date').value,
            timeStart: document.getElementById('time-start').value,
            timeEnd: document.getElementById('time-end').value,
            numStudents: document.getElementById('num-students').value,
            purpose: document.getElementById('purpose').value
        };

        if (!formData.building || !formData.room || !formData.timeStart || !formData.timeEnd) {
            alert('Please fill in all required fields');
            return;
        }

        showSuccessModal(formData);
    });

    document.getElementById('modal-close').addEventListener('click', function() {
        document.getElementById('success-modal').classList.remove('active');
    });

    document.getElementById('modal-new').addEventListener('click', function() {
        document.getElementById('success-modal').classList.remove('active');
        document.getElementById('reserve-form').reset();
        document.getElementById('room').disabled = true;
        document.getElementById('time-end').disabled = true;
    });
});
