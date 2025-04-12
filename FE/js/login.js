const baseURL = 'http://localhost:3000';

$("#login").click(() => {
    const email = $("#email").val().trim();
    const password = $("#password").val().trim();

    // Simple frontend validation
    if (!email || !password) {
        alert("Please enter both email and password.");
        return;
    }

    const data = { email, password };
    
    axios.post(`${baseURL}/auth/login`, data, {
        headers: { 'Content-Type': 'application/json; charset=UTF-8' }
    })
    .then(response => {
        
        
        const { message, data } = response.data;
        console.log({ message, data });
        if (message === "loggedin successfully" && data.token?.accessToken) {
            // Consider using cookies instead of localStorage for security
            localStorage.setItem('token', data.token.accessToken);
            window.location.href = 'index.html';
        } else {
            alert("Invalid email or password.");
        }
    })
    .catch(error => {
        console.error("Login Error:", error);
        alert("Something went wrong. Please try again.");
    });
});




