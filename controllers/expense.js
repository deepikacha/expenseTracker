const { Sequelize } = require('sequelize');
const sequelize = require('../util/database'); // Ensure to import the sequelize instance correctly
const Expense = require('../models/expense');
const User = require('../models/user');
const { createObjectCsvWriter } = require('csv-writer')
const path = require('path');
const { Parser } = require('json2csv');
const Downloaded=require('../models/Downloaded')
const AWSService=require('../services/S3services')


// Add a new expense
exports.addExpense = async (req, res) => {
  const { amount, description, category } = req.body;
  const userId = req.user.id;

  const t = await sequelize.transaction(); // Use the correct Sequelize instance

  console.log("message");
  console.log(req.body);

  if (!amount || !description || !category) {
    return res.status(400).json({ error: "All fields are required." });
  }
  console.log(req.user.id);

  try {
    // Create the new expense
    const newExpense = await Expense.create({
      amount,
      description,
      category,
      userId
    }, { transaction: t });

    // Update the user's total expense
    const user = await User.findByPk(userId, { transaction: t });
    user.totalexpense += parseFloat(amount); // Ensure amount is a float
    await user.save({ transaction: t });

    await t.commit(); // Commit the transaction
    return res.status(201).json(newExpense);
  } catch (error) {
    await t.rollback(); // Rollback the transaction if any error occurs
    console.error('Error adding expense:', error.message);
    return res.status(500).json({ message: 'Error adding expense' });
  }
};

// Delete an expense by ID
exports.deleteExpense = async (req, res) => {
  const expenseid = req.params.expenseid;

  if (!expenseid) {
    return res.status(400).json({ success: false });
  }

  const t = await sequelize.transaction(); // Use the correct Sequelize instance

  try {
    // Find the expense
    const expense = await Expense.findOne({
      where: { id: expenseid, userId: req.user.id },
      transaction: t
    });

    if (!expense) {
      await t.rollback();
      return res.status(404).json({ success: false, message: "Expense doesn't belong to user" });
    }

    // Delete the expense
    await Expense.destroy({
      where: { id: expenseid, userId: req.user.id },
      transaction: t
    });

    // Update the user's total expense
    const user = await User.findByPk(req.user.id, { transaction: t });
    user.totalexpense -= parseFloat(expense.amount); // Ensure amount is a float
    await user.save({ transaction: t });

    await t.commit(); // Commit the transaction
    return res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    await t.rollback(); // Rollback the transaction if any error occurs
    console.error('Error deleting expense:', error.message);
    return res.status(500).json({ success: false, message: "Failed to delete expense" });
  }
};

// Other existing functions...
exports.getExpenses = async (req, res) => {
  try {
    console.log("success");
    const userId = req.user.id;
    // Fetch all expenses from the database
    const expenses = await Expense.findAll({
      where: { userId }
    });

    // Render the 'expense.ejs' view and pass the expenses data
    res.render('expense', {
      pageTitle: 'Expense Tracker',
      expenses: expenses, // Pass expenses to the view
    });
  } catch (error) {
    console.error("Error fetching expenses:", error.message);
    res.status(500).render('error', {
      pageTitle: 'Error',
      errorMessage: "An error occurred while fetching expenses."
    });
  }
};

exports.getAllExpenses = (req, res) => {
  const userId=req.user.id
 
   Expense.findAll({ where: { userId } })
    .then(expenses => {
      return res.status(200).json({ expenses, success: true });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.showLeaderboard = async (req, res) => {
  try {
    const leaderboard = await User.findAll({
      attributes: [
        'name',
        [Sequelize.fn('SUM', Sequelize.col('expenses.amount')), 'totalexpense']
      ],
      include: [
        {
          model: Expense,
          attributes: []
        }
      ],
      group: ['User.id'],
      order: [[Sequelize.literal('totalexpense'), 'DESC']] // Order by totalexpense in descending order
    });

    // Ensure the result is in JSON format
    const leaderboardData = leaderboard.map(user => ({
      name: user.name,
      totalexpense: user.dataValues.totalexpense
    }));

    res.status(200).json(leaderboardData);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
};

exports.downloadExpenses = async (req, res) => {
  try {
    
     const userId = req.user.id;

    // const expenses = await req.user.getExpenses({
    //   attributes: ['amount', 'category', 'description', 'createdAt']
    // });

    const expenses = await Expense.findAll({ where:  {userId},attributes:["amount","description","category","createdAt"] });

    // Convert JSON to CSV
    const fields = ['amount', 'category', 'description', 'createdAt'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(expenses);

    // Generate unique key for the file
    const key = `myExpenses-${userId}-${Date.now()}.csv`;

    // Upload CSV to S3 using AWSService
    const uploadResult = await AWSService.uploadToS3(process.env.BUCKETNAME, key, csv);

    // const response = await req.user.createDownloaded(fileInfo);

    const file = new Downloaded({
      userId,
      fileName: key,
      url: uploadResult.Location
    })

    await file.save()

    return res.status(200).json({ fileUrl: uploadResult.Location });
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: "Internal server error" });
  }
};
// Generate and download CSV file for user's expenses (premium users only)
// exports.downloadExpenses = async (req, res) => {
//   const userId = req.user.id;
//   const { filter } = req.query;
//   let whereCondition = { userId };
//    let date = new Date();
//   console.log(userId)
//   if (filter === 'daily') {
//      whereCondition.createdAt =  new Date(date.setDate(date.getDate() - 1))
       
      
//      } 
//      else if (filter === 'weekly') { 
//       whereCondition.createdAt =  new Date(date.setDate(date.getDate() - 7))
        
         
//          }
//           else if (filter === 'monthly') {
//     whereCondition.createdAt =  new Date(date.setMonth(date.getMonth() - 1)) 
//       }
//   try {
//     // Fetch expenses for the user from the database
//     console.log(whereCondition)
//     const expenses = await Expense.findAll({ where:  {userId},attributes:["amount","description","category","createdAt"] });
//     console.log(expenses)
   
    
//   res.json({expenses})
    
  
  
//   }
//   catch (error) {
//     console.error('Error writing CSV file:', error);
//     res.status(500).json({ message: 'Error generating CSV file' });
//   }
// };