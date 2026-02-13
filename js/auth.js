function goToLogin() {
    const firstName = document.getElementById("fName").value.trim();
    const lastName = document.getElementById("lName").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("paswword").value.trim();
    const accountType = document.getElementById("accType").value.trim();

    if (firstName === "" || lastName === "" || email === "" || password === "" || accountType === "") {
        alert("Please fill in all fields before proceeding.");
    } else {
        window.location.href = "../pages/login.html";
    }
}

function validateLogin() {
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;

    if (email === "" || password === "") {
        alert("Please enter both email and password.");
    } else {
        window.location.href = "../pages/dashboard.html";
    }
}

function togglePassword() {
    var passwordInput = document.getElementById("password");
    var eyeIcon = document.getElementById("eye-icon");

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        eyeIcon.classList.remove("fa-eye-slash");
        eyeIcon.classList.add("fa-eye");
    } else {
        passwordInput.type = "password";
        eyeIcon.classList.remove("fa-eye");
        eyeIcon.classList.add("fa-eye-slash");
    }
}
