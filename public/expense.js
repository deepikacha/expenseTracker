

// const Razorpay = require("razorpay");
const logoutButton = document.querySelector(".btn-logout button");  // Select the button inside the div

logoutButton.addEventListener("click", () => {
  // Clear all data from local storage
  localStorage.clear();
  
  // Redirect to the login page
  window.location.href = "/login";
});


function handleFormSubmit(event) {
  event.preventDefault();
  const amount = event.target.amount.value;
  const description = event.target.description.value;
  const category = event.target.category.value;
  const date = new Date().toLocaleDateString();
  // Ensure all fields are filled
  if (!amount || !description || !category) {
    alert("Please fill in all fields"); return;
  }
  const token = localStorage.getItem('token');
  console.log(token)
  // Get the token
  if (!token) {
    // Check if token exists
    const userResponse = confirm("You must be logged in to add an expense. Do you want to log in?");
    if (userResponse) {
      // Redirect to login page if user clicks 'OK'
      window.location.href = '/login';
    }
    return;
  }
  const expense = { amount, description, category,date: new Date().toLocaleDateString() };
  // Send POST request to add expense to backend
  fetch("http://localhost:3000/expenses", {
    headers: {
      "Content-Type": "application/json", Authorization: token
    }, method: "POST", body: JSON.stringify(expense),
  })
  .then((response) => {
    if (response.status === 401) {
      alert('Please login');
      window.location.href = '/login'; // Redirect to login page
      return; // Prevent further code execution
    } else if (response.ok) {
      alert('Expense added successfully');
      return response.json(); // Parse the response JSON
    } else{
      return response.json().then(data => {
        alert(data.message || 'An error occurred');

      });
      }
    
  })
    .then((savedExpense) => {
      // Display saved expense in the list
      if (savedExpense) {
        // Display saved expense in the list
        displayExpense(savedExpense);
        // Reset form
        event.target.reset();
      }
    })
    .catch((error) => {
      console.error("Error saving expense:", error);
    });
}

// Function to display an expense 
// Function to display an expense in the table
function displayExpense(expense) {
  const expensesTableBody = document.getElementById("expensesTableBody");

  // Create a new row
  const row = document.createElement("tr");

  // Create table data for each expense field
  const amountCell = document.createElement("td");
  amountCell.textContent = expense.amount;
  row.appendChild(amountCell);

  const categoryCell = document.createElement("td");
  categoryCell.textContent = expense.category;
  row.appendChild(categoryCell);

  const descriptionCell = document.createElement("td");
  descriptionCell.textContent = expense.description;
  row.appendChild(descriptionCell);

  const dateCell = document.createElement("td");
  dateCell.textContent = expense.date;
  row.appendChild(dateCell);

  // Create the action cell with a delete button
  const actionCell = document.createElement("td");
  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", () => {
    deleteExpense(expense.id, row); // Pass expense ID and the row to be removed
  });
  actionCell.appendChild(deleteButton);
  row.appendChild(actionCell);

  // Append the row to the table body
  expensesTableBody.appendChild(row);
}


function loadExpenses(expenses) {
  console.log('Loading expenses:', expenses);
  const expensesTableBody = document.getElementById("expensesTableBody");
  expensesTableBody.innerHTML = ""; // Clear existing rows

  // Loop through each expense and create a table row
  expenses.forEach(expense => {
    const row = document.createElement("tr");

    const amountCell = document.createElement("td");
    amountCell.textContent = expense.amount;
    row.appendChild(amountCell);

    const categoryCell = document.createElement("td");
    categoryCell.textContent = expense.category;
    row.appendChild(categoryCell);

    const descriptionCell = document.createElement("td");
    descriptionCell.textContent = expense.description;
    row.appendChild(descriptionCell);

    const dateCell = document.createElement("td");
    dateCell.textContent = expense.date;
    row.appendChild(dateCell);

    // Add action buttons (like delete)
    const actionCell = document.createElement("td");
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => deleteExpense(expense.id, row));
    actionCell.appendChild(deleteButton);
    row.appendChild(actionCell);

    // Append the row to the table body
    expensesTableBody.appendChild(row);
  });
}

function fetchExpenses(page, limit) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please log in to view expenses.");
    window.location.href = "/login"; // Redirect to login if no token is found
    return;
  }
  axios.get(`http://localhost:3000/expenses?page=${page}&limit=${limit}`, {
    headers: { Authorization: token },
  })
    .then(response => {
      const { expenses, pagination } = response.data;
      loadExpenses(expenses);
      updatePagination(pagination);
    })
    .catch(error => {
      console.error("Error fetching expenses:", error);
    });
}

// Function to delete an expense from the UI and backend
function deleteExpense(expenseId, row) {
  const token = localStorage.getItem("token");

  if (token) {
    fetch(`http://localhost:3000/expenses/${expenseId}`, {
      method: "DELETE",
      headers: { Authorization: token }
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          row.remove(); // Remove the row from the table
        } else {
          alert("Failed to delete expense");
        }
      })
      .catch((error) => {
        console.error("Error deleting expense:", error);
      });
  } else {
    alert("Please log in to delete expenses.");
  }
}

function showPremiumuserMessage() {
  const addExpenseButton = document.querySelector('button[type="submit"]');
  const container = addExpenseButton.parentNode;

  // Update or create the premium message
  const buyPremiumButton = document.getElementById('rzp-button'); // "Buy Premium" button
  if (buyPremiumButton) {
    // Update the button text and disable it
    buyPremiumButton.textContent = "You are a premium user now";
    buyPremiumButton.disabled = true;

    // Apply the reversed gradient to the body background
    document.body.style.background = "linear-gradient(43deg, #ffcc70 0%, #c850c0 46%, #4158d0 100%)";
    document.body.style.backgroundAttachment = "fixed"; // Optional for a smoother experience
  }

  // Check if the leaderboard button already exists to prevent duplication
  const showLeaderboardButton = document.getElementById("showLeaderboardBtn");
  if (showLeaderboardButton) {
    showLeaderboardButton.style.display = "block"; // Make it visible if hidden
    showLeaderboardButton.addEventListener("click", fetchLeaderboard);
  }
}

document.getElementById('showLeaderboardBtn').addEventListener('click', fetchLeaderboard);

// Close leaderboard modal when the close button is clicked
document.getElementById('closeLeaderboardModal').addEventListener('click', () => {
  document.getElementById('leaderboardModal').close();
});

  // Hide the "Buy Premium" button
 

function fetchLeaderboard() {
  const token = localStorage.getItem('token');
  
  // Check if the token is present
  if (!token) {
    alert("You must be logged in to view the leaderboard.");
    window.location.href = "/login"; // Redirect to login page if no token is found
    return;
  }

  // Fetch leaderboard data from the backend
  fetch("http://localhost:3000/premium/showLeaderboard", {
    headers: { "Content-Type": "application/json", Authorization: token },
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      return response.json();
    })
    .then(data => {
      // If the data is not an array, handle it as an object (single leaderboard entry)
      if (Array.isArray(data)) {
        displayLeaderboard(data); // If data is an array, call displayLeaderboard for multiple users
      } else {
        displayLeaderboard([data]); // Wrap the data in an array and pass it to displayLeaderboard
      }
    })
    .catch(error => {
      console.error("Error fetching leaderboard:", error);
      alert("An error occurred while fetching the leaderboard.");
    });
}

function displayLeaderboard(data) {
  // Check if data is an array or not
  if (!Array.isArray(data)) {
    console.error("Leaderboard data is not an array:", data);
    alert("An error occurred while fetching the leaderboard data.");
    return;
  }

  // Use the existing leaderboard container
  const leaderboardContainer = document.getElementById("leaderboard-container");

  // Clear the existing leaderboard content
  leaderboardContainer.innerHTML = "";

  // Create a title for the leaderboard
  const leaderboardTitle = document.createElement("h3");
  leaderboardTitle.textContent = "Leaderboard";
  leaderboardContainer.appendChild(leaderboardTitle);

  // Create a list to display leaderboard entries
  const leaderboardList = document.createElement("ul");
  leaderboardContainer.appendChild(leaderboardList);

  // Loop through the data and create a list item for each leaderboard entry
  data.forEach(user => {
    const listItem = document.createElement("li");
    listItem.textContent = `Name: ${user.name}, Total Expense: ₹${user.totalexpense}`;
    leaderboardList.appendChild(listItem);
  });

  // Show the leaderboard modal
  const leaderboardModal = document.getElementById("leaderboardModal");
  leaderboardModal.showModal();
}

function parseJwt(token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
  return JSON.parse(jsonPayload);
} // Load expenses from the backend on page load 
// Function to handle downloading the latest expense
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
// Function to display the downloads in a modal
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
//eventListener to handle closing the modal



function updatePagination(pagination) {
  const pageInfo = document.getElementById("pageInfo");
  const prevPage = document.getElementById("prevPage");
  const nextPage = document.getElementById("nextPage");

  pageInfo.textContent = `Page ${pagination.currentPage} of ${pagination.totalPages}`;
  prevPage.disabled = pagination.currentPage === 1;
  nextPage.disabled = pagination.currentPage === pagination.totalPages;
}
function updateLimit() {
  const limitSelector = document.getElementById("limit");
  limit = limitSelector.value;
  localStorage.setItem("expensesPerPage", limit);
  currentPage = 1; // Reset to the first page
  fetchExpenses(currentPage, limit);
}

function changePage(direction) {
  currentPage += direction;
  fetchExpenses(currentPage, limit);
}
async function initialize() {
  document.addEventListener("DOMContentLoaded", async () => {

    const token = localStorage.getItem('token');

    // Get token 
    if (!token) {
      alert("You must be logged in to view expenses");
      window.location.href = "login.html"; return;
    }

    // Get `expensesPerPage` from localStorage or set a default value
    limit = localStorage.getItem("expensesPerPage") || 10; // Default to 10 if not set
    currentPage = 1; // Start on the first page

    // Update the dropdown to reflect the current limit
    document.getElementById("limit").value = limit;

    // Fetch and display expenses for the current page and limit
    fetchExpenses(currentPage, limit);

    // Add event listeners for pagination
    document.getElementById("prevPage").addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        fetchExpenses(currentPage, limit);
      }
    });

    document.getElementById("nextPage").addEventListener("click", () => {
      currentPage++;
      fetchExpenses(currentPage, limit);
    });

    // Update limit when the dropdown changes
    document.getElementById("limit").addEventListener("change", updateLimit);

    // Add event listener for leaderboard button click
    const leaderboardBtn = document.getElementById("showLeaderboardBtn");
    const leaderboardModal = document.getElementById("leaderboardModal");
    const closeLeaderboardModal = document.getElementById("closeLeaderboardModal");

    leaderboardBtn.addEventListener("click", async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("You must be logged in to view the leaderboard.");
        window.location.href = "login.html"; // Redirect to login page if no token is found
        return;
      }

      try {
        const response = await axios.get('http://localhost:3000/premium/showLeaderboard', {
          headers: { "Content-Type": "application/json", Authorization: token }
        });

        const leaderboardData = response.data; // Assuming response is an array of leaderboard entries

        console.log("Leaderboard data:", leaderboardData);

        // Check if the response is an array and display it
        if (Array.isArray(leaderboardData)) {
          displayLeaderboard(leaderboardData); // Pass the fetched data to the displayLeaderboard function
        } // Show the modal
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        alert("An error occurred while fetching the leaderboard.");
      }
    });

    // Event listener to close the leaderboard modal
    closeLeaderboardModal.addEventListener("click", () => {
      leaderboardModal.close(); // Close the modal
    });

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
    const isAdmin = decodeToken.ispremiumuser;

    if (isAdmin) {
      showPremiumuserMessage();
    }

  });
}

initialize();

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
