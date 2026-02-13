document.getElementById('edit-reservation-form').addEventListener('submit', function (e) {
    e.preventDefault();

    var room = document.getElementById('res-room').value;
    var date = document.getElementById('res-date').value;
    var timeStart = document.getElementById('res-time-start').value;
    var timeEnd = document.getElementById('res-time-end').value;
    var purpose = document.getElementById('res-purpose').value;


    if (room === '' || date === '' || timeStart === '' || timeEnd === '' || purpose === '') {
        showToast('Please fill in all required fields.', 'error');
        return;
    }


    if (timeEnd <= timeStart) {
        showToast('End time must be after start time.', 'error');
        return;
    }

    showToast('Reservation updated successfully!', 'success');

    setTimeout(function () {
        window.location.href = 'manage-reservations.html';
    }, 1500);
});
