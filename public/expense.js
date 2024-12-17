let currentPage = 1;
const limit = 10;
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
}

// Function to display an expense 
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
  if (buyPremiumButton) {
    buyPremiumButton.style.display = 'none';

  }
}

function fetchLeaderboard() {
  const token = localStorage.getItem('token');
  fetch("http://localhost:3000/premium/showLeaderboard", {
    headers: { "Content-Type": "application/json", Authorization: token },
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      return response.json();
    })
    // .then(data => {
    //   if (!Array.isArray(data)) {
    //     throw new TypeError('Data is not an array');
    //   }
    //   displayLeaderboard(data);
    // })
    .then(data => {
      // Since the backend now sends a single object, no need to check for an array
      displayLeaderboard(data);
    })
    .catch(error => {
      console.error("Error fetching leaderboard:", error);
    });
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

  // data.forEach(user => {
  //   const listItem = document.createElement("li");
  //   listItem.textContent = `Name: ${user.name}, Total Expense: ${user.totalexpense}`;
  //   leaderboardList.appendChild(listItem);
  // });
  const listItem = document.createElement("li");
  listItem.textContent = `Name: ${data.name}, Total Expense: ₹${data.totalexpense}`;
  leaderboardList.appendChild(listItem);
}

function parseJwt(token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
  return JSON.parse(jsonPayload);
} // Load expenses from the backend on page load 
function downloadLatestExpense() {
  const token = localStorage.getItem('token');
  axios.get('http://localhost:3000/user/download', { headers: { "Authorization": token } })
    .then(response => {
      if (response.status === 200) {
        var a = document.createElement("a");
        a.href = response.data.fileURL;
        a.download = 'myexpense.csv';
        a.click();
        fetchDownloadedFiles();


      }
      else {
        throw new Error(response.data.message)
      }
    })
    .catch((err) => {
      console.log(err)
    })
}



async function downloadHistory() {
  const token = localStorage.getItem('token');

  try {

    await axios.get('http://localhost:3000/download-history',
      { headers: { "Content-Type": "application/json", Authorization: token } })
      .then(response => {
        if (response.status === 401) {
          alert(response.data.message)
          return
        }
        displayDownloads(response.data.downloaded)
        // console.log(response.data)
      })

  }
  catch (err) {
    console.log(err)
  }

}

function displayDownloads(downloads) {
  const modal = document.getElementById('modal');
  modal.innerHTML = ''; // Clear any existing content

  // Create table and button elements

  const closeButton = document.createElement('button');
  closeButton.className = "button close-button";
  closeButton.textContent = "Close Modal";
  closeButton.onclick = () => modal.close();

  // Create a download latest button
  const downloadLatestButton = document.createElement('button');
  downloadLatestButton.className = "button download-button";
  downloadLatestButton.textContent = "Download Latest Expense";
  downloadLatestButton.onclick = downloadLatestExpense;

  const table = document.createElement('table');
  let rows = '';

  if (downloads.length === 0) {
    rows = "<tr><td colspan='3'>No Downloads</td></tr>";
  } else {
    downloads.forEach((download) => {
      rows += `
        <tr>
          <td>${download.fileName}</td>
          <td><a href="${download.url}">Download</a></td>
          <td>${new Date(download.createdAt).toLocaleString()}</td>
        </tr>`;
    });
  }

  table.innerHTML = `
    <thead>
      <tr>
        <th>File Name</th>
        <th>Link</th>
        <th>Downloaded At</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>`;

  // Append the button and table to the modal
  modal.appendChild(closeButton);

  modal.appendChild(downloadLatestButton);

  modal.appendChild(table);


  modal.showModal(); // Show the modal
}

function fetchDownloadedFiles() {
  downloadHistory();  // Reload the download history when called
}

function loadExpenses(expenses) {
   const expenseList = document.getElementById("expenseList"); expenseList.innerHTML = "";
    expenses.forEach(expense => { const li = document.createElement("li");
       li.textContent = `${expense.amount} - ${expense.description} - ${expense.category}`; 
       expenseList.appendChild(li); 
      }); 
      }

function fetchExpenses(page, limit) {
   const token = localStorage.getItem('token');
    axios.get(`http://localhost:3000/expenses?page=${page}&limit=${limit}`,
     { headers: { Authorization: token } })
     .then(response => { loadExpenses(response.data.expenses);
       updatePagination(response.data.pagination); })
       .catch(error => { console.error('Error fetching expenses:', error); 

       });
       }

       function updatePagination(pagination) {
         document.getElementById("pageInfo").textContent = `Page ${pagination.currentPage} of ${pagination.totalPages}`;
          document.getElementById("prevPage").disabled = pagination.currentPage === 1; 
       document.getElementById("nextPage").disabled = pagination.currentPage === pagination.totalPages; }

document.addEventListener("DOMContentLoaded", async () => {
  fetchExpenses(currentPage, limit);
  document.getElementById("prevPage").addEventListener("click", () => {
     if (currentPage > 1) { 
      currentPage--; fetchExpenses(currentPage, limit); 
    }
   });
    document.getElementById("nextPage").addEventListener("click", () => { 
    currentPage++; 
    fetchExpenses(currentPage, limit);
   });

  const token = localStorage.getItem('token');

  // Get token 
  if (!token) {
    alert("You must be logged in to view expenses");
    window.location.href = "login.html"; return;
  }
  try {
    const response = await axios.get('http://localhost:3000/user/data',
      {
        headers: { "Content-Type": "application/json", Authorization: token }
      })
    if (response.data.isPremium) {
      showPremiumuserMessage();
    }
  }
  catch (err) {
    console.log("Error fetching data", err)
  }

  const decodeToken = parseJwt(token);
  // console.log(decodeToken);
  const isAdmin = decodeToken.ispremiumuser;
  // const isPremium = localStorage.getItem('isPremium') === 'true';

  if (isAdmin) {
    showPremiumuserMessage();

  }

  fetch("http://localhost:3000/expenses", {
    headers: { "Content-Type": "application/json", Authorization: token },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to fetch expenses');
      }
      return response.json();
    }).then(data => {
      // console.log(data.expenses);
      // Handle your expenses
      data.expenses.forEach(expense => displayExpense(expense));
    })
    .catch((error) => { console.error('Error loading expenses:', error); });
});
document.getElementById('rzp-button').onclick = async function (e) {
  e.preventDefault();

  const token = localStorage.getItem('token');
  try {
    const response = await axios.get('http://localhost:3000/purchase/premiummembership', {
      headers: { Authorization: token }
    });

    const options = {
      key: response.data.key_id, // Razorpay API Key
      order_id: response.data.order.id, // Order ID from Razorpay
      handler: async function (response) {
        try {
          // Send transaction success details to the backend
          await axios.post('http://localhost:3000/purchase/updatetransactionstatus', {
            orderid: options.order_id, // corrected to 'orderid'
            paymentid: response.razorpay_payment_id, // corrected to 'paymentid'
            status: "SUCCESS",
          }, {
            headers: { Authorization: token },
          });

          alert("You are a premium user now!");
          showPremiumuserMessage();
        } catch (error) {
          console.error("Error updating transaction to SUCCESS:", error);
          alert("Failed to update the transaction. Please contact support.");
        }
      },
    };

    const rzp1 = new Razorpay(options);

    // Add payment failure handler
    rzp1.on("payment.failed", async function (response) {
      try {
        if (!options.order_id) {
          console.error("Order ID missing in Razorpay options");
          return;
        }

        // Notify backend of failed transaction 
        await axios.post("http://localhost:3000/purchase/updatetransactionstatus", {
          orderid: options.order_id, // corrected to 'orderid'
          status: "FAILED",
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
  } catch (error) {
    console.error('Error initiating payment:', error);
    alert('Something went wrong while initiating payment.');
  }
};
