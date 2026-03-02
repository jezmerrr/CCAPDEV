//get the modal
var modal = document.getElementById("edit-profile-modal");

//get button
var editProfile = document.getElementById("edit-profile-button");

//gets span element to close button
var closeButton = document.getElementsByClassName("close")[0];

function showModal(){
    modal.style.display = "flex";
}

//when user clicks on button, the modal opens
editProfile.onclick = showModal;

function closeModal(){
    modal.style.display = "none";
}

//hides the modal when user clicks close
closeButton.onclick = closeModal;

