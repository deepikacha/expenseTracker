const express = require('express');
const expenseController = require('../controllers/expense');
const {Authorize}=require('../middleware/auth')
const router = express.Router();
router.post('/expenses', Authorize,expenseController.addExpense);
router.get('/expenses/all', Authorize,expenseController.getAllExpenses);
router.get('/expenses', Authorize,expenseController.getExpenses);
router.delete('/expenses/:expenseid',Authorize, expenseController.deleteExpense);
router.get('/premium/showLeaderboard', Authorize, expenseController.showLeaderboard);
// router.get('/user/download', Authorize,  expenseController.downloadExpenses);
router.get('/user/download',Authorize, expenseController.downloadExpenses)
    

module.exports = router;







