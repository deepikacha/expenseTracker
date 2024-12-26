const { Sequelize } = require('sequelize');
const sequelize = require('../util/database'); 
const Expense = require('../models/expense');
const User = require('../models/user');
const path = require('path');
const { Parser } = require('json2csv');
const Downloaded=require('../models/Downloaded')
const AWSService=require('../services/S3services')


// Add a new expense
exports.addExpense = async (req, res) => {
  
  const { amount, description, category } = req.body;
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized: Please login" });
  }
  const userId = req.user.id;
  const transaction = await sequelize.transaction(); 
  

  if (!amount || !description || !category) {   
    return res.status(400).json({ error: "All fields are required." });
  }


  try {
    // Create the new expense
    const newExpense = await Expense.create({
      amount,
      description,
      category,
      userId,
      
    }, { transaction: transaction });

    // Update the user's total expense
    const user = await User.findByPk(userId, { transaction: transaction });
    user.totalexpense += parseFloat(amount); // Ensure amount is a float
    await user.save({ transaction: transaction});

    await transaction.commit(); // Commit the transaction
    return res.status(201).json({
      id: newExpense.id,
      amount: newExpense.amount,
      description: newExpense.description,
      category: newExpense.category,
      date: newExpense.createdAt, // Explicitly map createdAt to date
    });
  } catch (error) {
    await transaction.rollback(); // Rollback the transaction if any error occurs
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

  const transaction = await sequelize.transaction(); // Use the correct Sequelize instance

  try {
    // Find the expense
    const expense = await Expense.findOne({
      where: { id: expenseid, userId: req.user.id },
      transaction: transaction
    });

    if (!expense) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: "Expense doesn't belong to user" });
    }

    // Delete the expense
    await Expense.destroy({
      where: { id: expenseid, userId: req.user.id },
      transaction: transaction
    });

    // Update the user's total expense
    const user = await User.findByPk(req.user.id, { transaction: transaction});
    user.totalexpense -= parseFloat(expense.amount); // Ensure amount is a float
    await user.save({ transaction: transaction });

    await transaction.commit(); // Commit the transaction
    return res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    await transaction.rollback(); // Rollback the transaction if any error occurs
    console.error('Error deleting expense:', error.message);
    return res.status(500).json({ success: false, message: "Failed to delete expense" });
  }
};

// Other existing functions...
exports.getExpenses = async (req, res) => {
  try {
  const userId = req.user.id;
  const user=req.user;
 
  const page=parseInt(req.query.page)||1;
  const limit=parseInt(req.query.limit)||10;
  const offset=(page-1)*limit;
 
const {rows:expenses,count} = await  Expense.findAndCountAll({
  where:{userId:user.id},
  limit,
  offset

})
const isPremium=await user.ispremiumuser;
  
    // const { count, rows: expenses } = await Expense.findAndCountAll({ where: { userId },
    //    limit, offset, order: [['createdAt', 'DESC']] });
    
    // Fetch all expenses from the database
    // const expenses = await Expense.findAll({
    //   where: { userId }
    // });
    // console.log(expenses)

    // Render the 'expense.ejs' view and pass the expenses data
    // res.render('expense', {
    //   pageTitle: 'Expense Tracker',
    //   expenses: expenses, // Pass expenses to the view
    // });
     
     res.json({
      expenses,
      isPremium,
      pagination:{
        currentPage:page,
        totalPages:Math.ceil(count/limit),
        totalItems:count,
        itemsPerPage:limit,
      }
     })

  } catch (error) {
    res.status(500).json({message:"internal server error"})
  }
};

exports.getDownoadFiles=async(req,res)=>{
  const userId=req.user.id;
  try{
  const downloaded=await Downloaded.findAll({where:{userId},
     attributes:['fileName','url','createdAt']
    
  })
  console.log("downloaded")
  return res.status(200).json({downloaded})
}
catch(error){
  res.status(500).json({message:"an error occuring while displaying urls"})
}

}

// exports.getAllExpenses = (req, res) => {
//   const userId=req.user.id
 
//    Expense.findAll({ where: { userId } })
//     .then(expenses => {
//       return res.status(200).json({ expenses, success: true });
//     })
//     .catch(err => {
//       console.log(err);
//     });
// };

exports.showLeaderboard = async (req, res) => {
  try {
    const userId = req.user.id;
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
    // const leaderboardData = {
    //   name: leaderboard.name,
    //   totalexpense: leaderboard.dataValues.totalexpense,
    // };

    res.status(200).json(leaderboardData);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
};

exports.downloadExpenses = async (req, res) => {
  try {
    
     const userId = req.user.id;
     const ispremium=req.user.ispremiumuser;

    // const expenses = await req.user.getExpenses({
    //   attributes: ['amount', 'category', 'description', 'createdAt']
    // });
    console.log(ispremium)
    if(!ispremium){
      
     return res.status(401).json({message:"not a premium user"})
    }

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
    // console.log(uploadResult.Location)
    return res.status(200).json({ fileUrl: uploadResult.Location });

  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: "Internal server error" });
  }
}



