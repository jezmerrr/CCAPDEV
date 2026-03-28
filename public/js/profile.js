document.getElementById('pfp').addEventListener('change', function(){
    this.closest('form').submit();
});

document.getElementById('deleteBtn').addEventListener('click', function(e){
    if (!confirm('Are you sure you want to delete your account? This cannot be undone.')){
        e.preventDefault();
    }
});