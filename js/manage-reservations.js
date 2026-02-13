var cancelId = null;

function filterReservations() {
    var status = document.getElementById('filter-status').value;
    var date = document.getElementById('filter-date').value;
    var search = document.getElementById('search-room').value.toLowerCase();

    var rows = document.getElementById('reservations-body').getElementsByTagName('tr');
    var count = 0;

    for (var i = 0; i < rows.length; i++) {
        var rowStatus = rows[i].getAttribute('data-status');
        var room = rows[i].getElementsByTagName('td')[1].textContent.toLowerCase();
        var rowDate = rows[i].getElementsByTagName('td')[2].textContent;
        var purpose = rows[i].getElementsByTagName('td')[4].textContent.toLowerCase();

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
    var rows = document.getElementById('reservations-body').getElementsByTagName('tr');
    for (var i = 0; i < rows.length; i++) {
        var idCell = rows[i].getElementsByTagName('td')[0].textContent.trim();
        if (idCell === cancelId) {
            rows[i].setAttribute('data-status', 'cancelled');
            rows[i].getElementsByTagName('td')[5].innerHTML = '<span class="status-badge status-cancelled">Cancelled</span>';
            rows[i].getElementsByTagName('td')[6].innerHTML = '<div class="actions-cell"><a href="edit-reservation.html?id=' + cancelId + '" class="btn-action btn-view"><i class="fa-solid fa-eye"></i> View</a></div>';
            break;
        }
    }

    closeCancelModal();
    showToast('Reservation ' + cancelId + ' has been cancelled.', 'success');
    cancelId = null;
    filterReservations();
}

document.getElementById('filter-status').addEventListener('change', filterReservations);
document.getElementById('filter-date').addEventListener('change', filterReservations);
document.getElementById('search-room').addEventListener('input', filterReservations);
