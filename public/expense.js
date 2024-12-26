console.log(document)
const logoutButton = document.querySelector(".btn-logout button");  // Select the button inside the div

logoutButton.addEventListener("click", () => {

  localStorage.clear();

  window.location.href = "/login";
});


async function handleFormSubmit(event) {
  event.preventDefault();
  const amount = event.target.amount.value;
  const description = event.target.description.value;
  const category = event.target.category.value;
  const date = new Date().toLocaleDateString();
  // Ensure all fields are filled
  if (!amount || !description || !category) {
    alert("Please fill in all fields"); return;
  }

  const expense = { amount, description, category, date };
  const savedExpenses = await addExpensesApi(expense);

  if (savedExpenses) {
    // Display saved expense in the lis
    displayExpense(savedExpenses);
    // Reset form
    event.target.reset();
  }
}

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

async function fetchExpenses(page, limit) {
  const response = await getExpensesApi(page, limit)

  const { expenses, pagination } = response.data;
  loadExpenses(expenses);
  updatePagination(pagination);


}

// Function to delete an expense from the UI and backend
async function deleteExpense(expenseId, row) {
  const data = await deleteExpensesApi(expenseId)

  if (data.success) {
    row.remove(); // Remove the row from the table
  } else {
    alert("Failed to delete expense");
  }



}

function showPremiumuserMessage() {
  const buyPremiumButton = document.getElementById('rzp-button');
  if (buyPremiumButton) {
    buyPremiumButton.textContent = "You are a premium user now";
    buyPremiumButton.disabled = true;

    // Apply premium user styling
    document.body.style.background = "linear-gradient(43deg, #ffcc70 0%, #c850c0 46%, #4158d0 100%)";
    document.body.style.backgroundAttachment = "fixed";

    // Show the leaderboard and download buttons
    const leaderboardButton = document.getElementById('showLeaderboardBtn');
    const downloadButton = document.getElementById('downloadexpense');
    leaderboardButton.style.display = 'block';
    downloadButton.style.display = 'block';

    // Add event listeners if needed
    leaderboardButton.addEventListener('click', fetchLeaderboard);
  }
}

// Hide the "Buy Premium" button


async function fetchLeaderboard() {
  const data = await fetchLeaderBoardApi()
  // If the data is not an array, handle it as an object (single leaderboard entry)
  if (Array.isArray(data)) {
    displayLeaderboard(data); // If data is an array, call displayLeaderboard for multiple users
  } else {
    displayLeaderboard([data]); // Wrap the data in an array and pass it to displayLeaderboard
  }


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


async function downloadLatestExpense() {
  const fileURL = await downloadLatestExpenseApi()

  let a = document.createElement("a");
  a.href = fileURL;
  a.download = 'myexpense.csv';
  a.click();
  fetchDownloadedFiles();

}



async function downloadHistory() {
 
   const downloaded= await downloadHistoryApi()

    displayDownloads(downloaded)
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
    const leaderboardData=await getLeaderBoardApi();
    
        // Check if the response is an array and display it
        if (Array.isArray(leaderboardData)) {
          displayLeaderboard(leaderboardData); // Pass the fetched data to the displayLeaderboard function
        } // Show the modal
      
    });

    // Event listener to close the leaderboard modal
    closeLeaderboardModal.addEventListener("click", () => {
      leaderboardModal.close(); // Close the modal
    });

    await isPremiumApi() &&  showPremiumuserMessage()
  
  });
}

initialize();

document.getElementById('rzp-button').onclick = async function (e) {
  e.preventDefault();

  try {
    const response=await createOrder();
console.log(response);
    const options = {
      key: response.data.key_id, // Razorpay API Key
      order_id: response.data.order.id, // Order ID from Razorpay
      handler: async function (response) {
        await updateStateApi( options.order_id,'SUCCESS',response.razorpay_payment_id)
       
          alert("You are a premium user now!");
          showPremiumuserMessage();
        
      },
    };

    const rzp1 = new Razorpay(options);

    // Add payment failure handler
    rzp1.on("payment.failed", async function (response) {
      if (!options.order_id) {
        console.error("Order ID missing in Razorpay options");
        return;
      }
      await updateStateApi( options.order_id,'FAILED')
      alert("Payment failed. Order status updated to FAILED.");
      
    });

    rzp1.open();
  } catch (error) {
    console.error('Error initiating payment:', error);
    alert('Something went wrong while initiating payment.');
  }
};
