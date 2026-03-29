function showToast(message, type) {
    var toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast ' + (type || 'success') + ' show';
    setTimeout(function () {
        toast.classList.remove('show');
    }, 3000);
}

document.addEventListener('DOMContentLoaded', function () {
    var editForm = document.getElementById('edit-reservation-form');
    if (!editForm) return;

    // set date min/max (today to 7 days ahead)
    var dateInput = document.getElementById('res-date');
    if (dateInput) {
        var today = new Date();
        var maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 7);
        dateInput.min = today.toISOString().split('T')[0];
        dateInput.max = maxDate.toISOString().split('T')[0];
    }

    var isSubmitting = false;
    var saveBtn = editForm.querySelector('button[type="submit"]');

    editForm.addEventListener('submit', function (e) {
        e.preventDefault();

        if (isSubmitting) return;
        isSubmitting = true;
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

        var formData = new FormData(editForm);
        var params = new URLSearchParams(formData).toString();

        fetch(editForm.action, {
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
                showToast('Reservation updated successfully!', 'success');
                setTimeout(function () {
                    window.location.href = result.data.redirect || '/manage-reservations';
                }, 1000);
            } else {
                showToast(result.data.error || 'Failed to update reservation.', 'error');
                isSubmitting = false;
                saveBtn.disabled = false;
                saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Changes';
            }
        })
        .catch(function () {
            showToast('Something went wrong. Please try again.', 'error');
            isSubmitting = false;
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Changes';
        });
    });
});
