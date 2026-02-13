var currentResolveId = null;
var currentRemoveId = null;
var currentFlagEmail = null;

function filterNoShows() {
    var status = document.getElementById('filter-noshow-status').value;
    var search = document.getElementById('search-noshow').value.toLowerCase();

    var rows = document.getElementById('noshows-body').getElementsByTagName('tr');
    var count = 0;

    for (var i = 0; i < rows.length; i++) {
        var rowStatus = rows[i].getAttribute('data-status');
        var student = rows[i].getElementsByTagName('td')[1].textContent.toLowerCase();
        var room = rows[i].getElementsByTagName('td')[2].textContent.toLowerCase();

        var show = true;

        if (status !== 'all' && rowStatus !== status) {
            show = false;
        }

        if (search !== '' && student.indexOf(search) === -1 && room.indexOf(search) === -1) {
            show = false;
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

function findRow(id) {
    var rows = document.getElementById('noshows-body').getElementsByTagName('tr');
    for (var i = 0; i < rows.length; i++) {
        var cellId = rows[i].getElementsByTagName('td')[0].textContent.trim();
        if (cellId === id) {
            return rows[i];
        }
    }
    return null;
}

function openResolveModal(id) {
    currentResolveId = id;
    var row = findRow(id);
    var studentName = row.getElementsByTagName('td')[1].childNodes[0].textContent.trim();
    document.getElementById('resolve-modal-text').textContent = 'Mark no-show for ' + studentName + ' as resolved?';
    document.getElementById('resolve-notes').value = '';
    document.getElementById('resolve-modal').classList.add('active');
}

function closeResolveModal() {
    document.getElementById('resolve-modal').classList.remove('active');
}

function confirmResolve() {
    var row = findRow(currentResolveId);
    row.setAttribute('data-status', 'resolved');
    row.getElementsByTagName('td')[5].innerHTML = '<span class="status-badge status-resolved">Resolved</span>';
    row.getElementsByTagName('td')[7].innerHTML = '<div class="actions-cell"><a href="#" class="btn-action btn-view"><i class="fa-solid fa-eye"></i> View</a></div>';

    closeResolveModal();
    showToast('No-show ' + currentResolveId + ' has been resolved.', 'success');
    currentResolveId = null;
    filterNoShows();
}

function openFlagModal(email, name) {
    currentFlagEmail = email;
    document.getElementById('flag-modal-text').textContent = 'Flag ' + name + ' (' + email + ') for repeated no-shows? This may restrict their booking privileges.';
    document.getElementById('flag-modal').classList.add('active');
}

function closeFlagModal() {
    document.getElementById('flag-modal').classList.remove('active');
}

function confirmFlag() {
    closeFlagModal();
    showToast('User has been flagged for repeated no-shows.', 'warning');
    currentFlagEmail = null;
}

function openRemoveModal(id) {
    currentRemoveId = id;
    var row = findRow(id);
    var studentName = row.getElementsByTagName('td')[1].childNodes[0].textContent.trim();
    document.getElementById('remove-modal-text').textContent = 'Remove the no-show record for ' + studentName + ' (' + id + ')? This action cannot be undone.';
    document.getElementById('remove-modal').classList.add('active');
}

function closeRemoveModal() {
    document.getElementById('remove-modal').classList.remove('active');
}

function confirmRemove() {
    var row = findRow(currentRemoveId);
    row.style.display = 'none';
    closeRemoveModal();
    showToast('No-show record has been removed.', 'success');
    currentRemoveId = null;
    filterNoShows();
}

document.getElementById('filter-noshow-status').addEventListener('change', filterNoShows);
document.getElementById('search-noshow').addEventListener('input', filterNoShows);
