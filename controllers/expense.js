const { where } = require('sequelize');
const Expense = require('../models/expense');
// Add a new expense
exports.addExpense = async (req, res) => {
  try {
    console.log("message")
    const { amount, description, category } = req.body;
    
    console.log(req.body)
    if (!amount || !description || !category) {
      return res.status(400).json({ error: "All fields are required." });
    }
    console.log(req.user.id)
    const newExpense = await Expense.create({ amount, description, category ,userId: req.user.id });
    
    res.status(201).json(newExpense);
  } catch (error) {
    console.error("Error adding expense:", error.message);
    res.status(500).json({ error: "An error occurred while adding the expense." });
  }
};
// Get all expenses
exports.getExpenses = async (req, res) => {
    try {
      console.log("success")
      const userId=req.user.id;
      // Fetch all expenses from the database
      const expenses = await Expense.findAll({
           where:{userId},
      })
  
      // Render the 'expense.ejs' view and pass the expenses data
      res.render('expense', {
        pageTitle: 'Expense Tracker',
        expenses: expenses, // Pass expenses to the view
      });
    } catch (error) {
      console.error("Error fetching expenses:",error.message);
      res.status(500).render('error', { 
        pageTitle: 'Error',
        errorMessage: "An error occurred while fetching expenses."
      });
    }
  };

  exports.getAllExpenses=(req,res)=>{
    Expense.findAll()
    .then(expenses=>{
     return res.status(200).json({expenses,success:true})
    })
    .catch(err=>{
      console.log(err)
    })
  }
  
// Delete an expense by ID
exports.deleteExpense = async (req, res) => {
  const expenseid=req.params.expenseid;
  if(expenseid==undefined||expenseid.length===0){
    return res.status(400).json({success:false})

  }
  Expense.destroy({where:{id:expenseid,userId:req.user.id}})
  .then((noofrows)=>{
    if(noofrows===0){
      return res.status(404).json({success:false,message:"Expense doesnt belongs to user"})
    }
  return res.status(200).json({success:true,message:"Deleted successfully"})
  })
  .catch(err=>{
  console.log(err);
  return res.status(500).json({success:true,message:"failed"})
  })
};