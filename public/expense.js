 // Replace with your API URL
 function handleFormSubmit(event) {
  event.preventDefault();
  const amount = event.target.amount.value;
  const description = event.target.description.value;
  const category = event.target.category.value;

  // Ensure all fields are filled
  if (!amount || !description || !category) {
    alert("Please fill in all fields");
    return;
  }

  const token = localStorage.getItem('token');  // Get the token

  if (!token) {  // Check if token exists
    alert("You must be logged in");
    return;
  }

  const expense = {
    amount,
    description,
    category,
  };

  // Send POST request to add expense to backend
  
  
  fetch("http://localhost:3000/expenses",
    {headers:{  "Content-Type": "application/json",Authorization:token},
    method:"POST", 
    body: JSON.stringify(expense),})
 
  .then((response) => response.json())
  .then((savedExpense) => {
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
      fetch(`http://localhost:3000/expenses/${expense.id}`, {
        method: "DELETE", 
        headers:{Authorization:token}
      })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // If the expense belongs to the logged-in user, delete the expense from the list
          if (data.success) {
            li.remove(); // Remove the expense from the list
          } else {
            alert(data.message || "Failed to delete expense");
          }
        } else {
          alert(data.message || "Failed to delete expense");
        }
      })
      .catch((error) => {
        console.error("Error deleting expense:", error);
      });
    });

    li.appendChild(deleteButton);
    expenseList.appendChild(li);
  }

 


// Load expenses from the backend on page load
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem('token');  // Get token

  if (!token) {
    alert("You must be logged in to view expenses");
    window.location.href = "login.html";
    return;
  }

  fetch("http://localhost:3000/expenses/all", {

    headers: {"Content-Type": "application/json",
       Authorization: token },
  })
  .then((response) => {
    if (!response.ok) {
      throw new Error('Failed to fetch expenses');
    }
    return response.json();
  })
  .then(data => {
    console.log(data.expenses); // Handle your expenses
    data.expenses.forEach(expense => displayExpense(expense));
})
  .catch((error) => {
    console.error('Error loading expenses:', error);
  });
});

