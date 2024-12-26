 //const endPoint='65.0.7.163';
 const endPoint = 'localhost:3000';

function loginApi(loginData) {
    const messageContainer = document.getElementById('message');
    fetch(`http://${endPoint}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
    })
        .then(async response => {
            if (response.status === 200) {
                return response.json();
            } else if (response.status === 404) {
                throw new Error("Email is not correct.");
            } else if (response.status === 401) {
                throw new Error("Password is not correct.");
            } else {
                throw new Error("An unexpected error occurred.");
            }
        })
        .then(data => {
            messageContainer.style.color = 'green';
            messageContainer.textContent = "Login successful!";
            localStorage.setItem('token', data.token);
            localStorage.setItem('isPremium', data.isPremiumUser);
            window.location.href = "expense.html";
        })
        .catch(error => {
            messageContainer.style.color = 'red';
            messageContainer.textContent = error.message;
            console.error('Error during login:', error);
        });
}

function signupApi(userData) {
    fetch(`http://${endPoint}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (data.token) {
                localStorage.setItem('token', data.token);
                window.location.href = 'login.html';
            }
        })
        .catch(error => {
            alert(error.message);
            console.error('Error registering user:', error);
        });
}

async function getExpensesApi(page, limit) {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Please log in to view expenses.");
        window.location.href = "/login"; // Redirect to login if no token is found
        return;
    }
    try {
        const response = await axios.get(`http://${endPoint}/expenses?page=${page}&limit=${limit}`, {

            headers: { Authorization: token },
        })
        return response
    }
    catch (error) {
        console.log(error.message);
    }
}

async function addExpensesApi(expense) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://${endPoint}/expenses`, {

            headers: {
                "Content-Type": "application/json",
                Authorization: token
            },
            method: "POST",
            body: JSON.stringify(expense),
        })
        return response.json();

    }
    catch (error) {
        console.log(error.message);
    }


}

async function deleteExpensesApi(expenseId) {
    const token = localStorage.getItem("token");
    const response = await fetch(`http://${endPoint}/expenses/${expenseId}`, {
        method: "DELETE",
        headers: { Authorization: token }
    })
    const data = response.json()
    return data;
}

async function fetchLeaderBoardApi() {
    const token = localStorage.getItem('token');
    // Fetch leaderboard data from the backend
    const response = await fetch(`http://${endPoint}/premium/showLeaderboard`, {

        headers: { "Content-Type": "application/json", Authorization: token },
    })

    if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
    }
    const data = response.json();
    return data;
}

async function downloadLatestExpenseApi() {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://${endPoint}/user/download`,
            { headers: { "Authorization": token } })
        return response.data.fileURL;
    }
    catch (error) {
        console.log(error);
    }
}

async function downloadHistoryApi() {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://${endPoint}/download-history`,

            { headers: { "Content-Type": "application/json", Authorization: token } })
        return response.data.downloaded;
    }
    catch (error) {
        console.log(error);
    }
}

async function getLeaderBoardApi() {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get(`http://${endPoint}/premium/showLeaderboard`, {

            headers: { "Content-Type": "application/json", Authorization: token }
        });

        const leaderboardData = response.data; // Assuming response is an array of leaderboard entries
        return leaderboardData;

    } catch (err) {
        console.error("Error fetching leaderboard:", err);
        alert("An error occurred while fetching the leaderboard.");
    }


}

async function isPremiumApi() {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get(`http://${endPoint}/user/data`,

            {
                headers: { "Content-Type": "application/json", Authorization: token }
            })
        return response.data.isPremium;

    }
    catch (err) {
        console.log("Error fetching data", err)
    }
}

async function createOrder() {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get(`http://${endPoint}/purchase/premiummembership`, {

            headers: { Authorization: token }
        });
        console.log(response);
        return response;
    }
    catch (err) {
        console.log("Error fetching data", err)
    }
}

async function updateStateApi(orderId, status, paymentId = '') {
    const token = localStorage.getItem('token');
    try {
        // Send transaction success details to the backend
        await axios.post(`http://${endPoint}/purchase/updatetransactionstatus`, {

            orderid: orderId,
            paymentid: paymentId,
            status: status,
        }, {
            headers: { Authorization: token },
        });


    } catch (error) {
        console.error("Error updating transaction:", error);
        alert("Failed to update the transaction. Please contact support.");
    }


}
