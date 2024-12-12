
// const Razorpay = require("razorpay");

function handleFormSubmit(event) {
  event.preventDefault();
  const amount = event.target.amount.value;
  const description = event.target.description.value;
  const category = event.target.category.value;
  // Ensure all fields are filled
  if (!amount || !description || !category) {
    alert("Please fill in all fields"); return;
  }
  const token = localStorage.getItem('token');
  // Get the token
  if (!token) {
    // Check if token exists
    alert("You must be logged in"); return;
  }
  const expense = { amount, description, category, };
  // Send POST request to add expense to backend
  fetch("http://localhost:3000/expenses", {
    headers: {
      "Content-Type": "application/json", Authorization: token
    }, method: "POST", body: JSON.stringify(expense),
  })
    .then((response) => response.json()).then((savedExpense) => {
      // Display saved expense in the list
      displayExpense(savedExpense);
      // Reset form
      event.target.reset();
    })
    .catch((error) => {
      console.error("Error saving expense:", error);
    });
} // Function to display an expense 
function displayExpense(expense) {
  const expenseList = document.getElementById("expenseList");
  const li = document.createElement("li");
  li.setAttribute("data-id", expense.id);
  li.textContent = `${expense.amount} - ${expense.description} - ${expense.category}`;
  const token = localStorage.getItem('token');
  // Ensure expense.id exists
  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", () => {
    fetch(`http://localhost:3000/expenses/${expense.id}`,
      { method: "DELETE", headers: { Authorization: token } }).then((response) => response.json())
      .then((data) => {
        if (data.success) {
          li.remove(); // Remove the expense from the list 
        }
        else { alert(data.message || "Failed to delete expense"); }
      })
      .catch((error) => { console.error("Error deleting expense:", error); });
  });
  li.appendChild(deleteButton); expenseList.appendChild(li);
}
function showPremiumuserMessage() {
  const addExpenseButton = document.querySelector('button[type="submit"]');
  const container = addExpenseButton.parentNode;
  // Check if elements already exist to prevent duplication
  if (!document.getElementById("premium-message")) {
    const premiumMessage = document.createElement("span");
    premiumMessage.id = "premium-message";
    premiumMessage.textContent = "You are a premium user now";
    container.appendChild(premiumMessage);
  }
  if (!document.getElementById("show-leaderboard")) {
    const showLeaderboardButton = document.createElement("button");
    showLeaderboardButton.textContent = "Show Leaderboard";
    showLeaderboardButton.id = "show-leaderboard";
    container.appendChild(showLeaderboardButton);
    // Add event listener for the "Show Leaderboard"
    showLeaderboardButton.addEventListener("click", fetchLeaderboard);
  }
  // Hide the "Buy Premium" button
  const buyPremiumButton = document.getElementById('rzp-button');
  if (buyPremiumButton) { buyPremiumButton.style.display = 'none'; }
  // Show the premium controls (filter and download button) 
}
// Function to fetch expenses from the backend
// Function to handle the download button click 
// Existing functions... 
function fetchLeaderboard() {
  const token = localStorage.getItem('token');
  fetch("http://localhost:3000/premium/showLeaderboard",
    { headers: { "Content-Type": "application/json", Authorization: token }, })
    .then(response => {
      if (!response.ok) { throw new Error('Failed to fetch leaderboard'); }
      return response.json();
    })
    .then(data => {
      if (!Array.isArray(data)) { throw new TypeError('Data is not an array'); }
      displayLeaderboard(data);
    })
    .catch(error => { console.error("Error fetching leaderboard:", error); });
}
function displayLeaderboard(data) {
  // Clear existing leaderboard if any
  let leaderboardContainer = document.getElementById("leaderboard-container");
  if (!leaderboardContainer) {
    leaderboardContainer = document.createElement("div");
    leaderboardContainer.id = "leaderboard-container";
    document.body.appendChild(leaderboardContainer);
  }
  leaderboardContainer.innerHTML = '';
  const leaderboardTitle = document.createElement("h3");
  leaderboardTitle.textContent = "Leaderboard";
  leaderboardContainer.appendChild(leaderboardTitle);
  const leaderboardList = document.createElement("ul");
  leaderboardContainer.appendChild(leaderboardList);
  data.forEach(user => {
    const listItem = document.createElement("li");
    listItem.textContent = `Name: ${user.name},
 Total Expense: ${user.totalexpense}`;
    leaderboardList.appendChild(listItem);
  });
}
function parseJwt(token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
   var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
     return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2); }).join('')); 
     return JSON.parse(jsonPayload);
} // Load expenses from the backend on page load 

function download() {
  const token = localStorage.getItem('token');

  axios.get(`http://localhost:3000/download`, {
    headers: {"Content-Type": "application/json",
      Authorization: token,
      
    }
  })
    .then((response) => {
      let expenses= response.expenses;
      let csvContent=convertToCSV(expenses);
      let blob=new Blob([csvContent],{type:"text/csv"})
      let url=URL.createObjectURL(blob);
      const a = document.createElement("a");
      let filename=`expense_${token}_${new Date()}.csv`
      a.setAttribute("href", url)
      a.setAttribute("download", filename);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  
      URL.revokeObjectURL(url);
  

       
       
      
    })
    .catch((err) => {
      console.error('Error downloading file:', err);
      alert('Failed to download file. Please try again.');
    });
}

function convertToCSV(objects){
  if (!objects || !objects.length) {
    return "";
}

// Extract headers (keys)
const headers = Object.keys(objects[0]);

// Map data to CSV rows
const rows = objects.map(obj => 
    headers.map(header => JSON.stringify(obj[header], null, 2)).join(",")
);

// Combine headers and rows
return [headers.join(","), ...rows].join("\n");


}
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem('token');

  // Get token 
  if (!token) {
    alert("You must be logged in to view expenses");
    window.location.href = "login.html"; return;
  }
  const decodeToken = parseJwt(token);
  console.log(decodeToken);
  const isAdmin = decodeToken.ispremiumuser;
  const isPremium = localStorage.getItem('isPremium') === 'true';
  
  if (isPremium || isAdmin) { showPremiumuserMessage();
    document.getElementById('downloadexpense').disabled = false
   }
   else{
    document.getElementById('downloadexpense').disabled = true
   }
  fetch("http://localhost:3000/expenses/all", {
    headers: { "Content-Type": "application/json", Authorization: token },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to fetch expenses');
      }
      return response.json();
    }).then(data => {
      console.log(data.expenses);
      // Handle your expenses
      data.expenses.forEach(expense => displayExpense(expense));
    })
    .catch((error) => { console.error('Error loading expenses:', error); });
});
document.getElementById('rzp-button').onclick = async function (e) {
  const token = localStorage.getItem('token');
  const response = await axios.get('http://localhost:3000/purchase/premiummembership',
    { headers: { Authorization: token } });
  console.log(response);
  const options = {
    key: response.data.key_id,
    // Razorpay API Key
    order_id: response.data.order.id,
    // Order ID from Razorpay
    handler: async function (response) {
      try {
        // Send transaction success details to the backend
        await axios.post('http://localhost:3000/purchase/updatetransactionstatus', {
          order_id: options.order_id, payment_id: response.razorpay_payment_id, status: "SUCCESS",
        },
          { headers: { Authorization: token }, }); alert("You are a premium user now!");
        localStorage.setItem("isPremium", true); showPremiumuserMessage();
      }
      catch (error) {
        console.error("Error updating transaction to SUCCESS:", error);
        alert("Failed to update the transaction. Please contact support.");
      }
    },
  };
  const rzp1 = new Razorpay(options)
  // Add payment failure handler
  rzp1.on("payment.failed", async function (response) {
    try {
      if (!options.order_id) {
        console.error("Order ID missing in Razorpay options"); return;
      }
      // Notify backend of failed transaction 
      await axios.post("http://localhost:3000/purchase/updatetransactionstatus", {
        order_id: options.order_id, status: "FAILED",
      }, {
        headers: { Authorization: token },
      });
      alert("Payment failed. Order status updated to FAILED.");
    } catch (error) {
      console.error("Error updating transaction to FAILED:", error);
      alert("Failed to update the transaction status.");
    }
  });
  rzp1.open();
  e.preventDefault(); rzp1.on('payment failed', function (reset) {
    console.log(response);
    alert('something went wrong');
  });
};