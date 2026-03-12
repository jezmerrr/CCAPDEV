document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('edit-reservation-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
        const date = document.getElementById('res-date').value;
        const timeSlot = document.getElementById('res-time-slot').value;
        const purpose = document.getElementById('res-purpose').value.trim();

        if (!date || !timeSlot || !purpose) {
            e.preventDefault();
            showToast('Please fill in all required fields.', 'error');
        }
    });
});