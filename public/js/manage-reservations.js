var cancelId = null;

function filterReservations() {
    var status = document.getElementById('filter-status').value;
    var date = document.getElementById('filter-date').value;
    var search = document.getElementById('search-room').value.toLowerCase();

    var rows = document.getElementById('reservations-body').getElementsByTagName('tr');
    var count = 0;

    for (var i = 0; i < rows.length; i++) {
        var rowStatus = rows[i].getAttribute('data-status');
        var room = rows[i].getElementsByTagName('td')[2].textContent.toLowerCase();
        var rowDate = rows[i].getElementsByTagName('td')[4].textContent;
        var purpose = rows[i].getElementsByTagName('td')[6].textContent.toLowerCase();

        var show = true;

        if (status !== 'all' && rowStatus !== status) {
            show = false;
        }

        if (search !== '' && room.indexOf(search) === -1 && purpose.indexOf(search) === -1) {
            show = false;
        }

        if (date !== '') {
            var d = new Date(date + 'T00:00:00');
            var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            var formatted = months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
            if (rowDate !== formatted) {
                show = false;
            }
        }

        if (show) {
            rows[i].style.display = '';
            count++;
        } else {
            rows[i].style.display = 'none';
        }
    }

    if (count === 0) {
        document.getElementById('empty-state').style.display = 'block';
    } else {
        document.getElementById('empty-state').style.display = 'none';
    }
}

function openCancelModal(id) {
    cancelId = id;
    document.getElementById('cancel-modal-text').textContent = 'Are you sure you want to cancel reservation ' + id + '?';
    document.getElementById('cancel-modal').classList.add('active');
}

function closeCancelModal() {
    document.getElementById('cancel-modal').classList.remove('active');
}

function confirmCancel() {
    if (!cancelId) return;

    fetch('/reservations/cancel/' + cancelId, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(function(res) {
        if (res.ok) {
            closeCancelModal();
            showToast('Reservation ' + cancelId + ' has been cancelled.', 'success');
            cancelId = null;
            window.location.reload();
        } else {
            showToast('Failed to cancel reservation.', 'error');
        }
    })
    .catch(function() {
        showToast('Something went wrong.', 'error');
    });
}

document.getElementById('filter-status').addEventListener('change', filterReservations);
document.getElementById('filter-date').addEventListener('change', filterReservations);
document.getElementById('search-room').addEventListener('input', filterReservations);