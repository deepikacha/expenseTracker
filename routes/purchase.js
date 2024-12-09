const express = require('express');
const purchaseController = require('../controllers/purchase');
const {Authorize}=require('../middleware/auth')
const router = express.Router();
router.get('/premiummembership',Authorize,purchaseController.purchasepremium);
router.post('/updatetransactionstatus',Authorize,purchaseController.updateTransactionStatus );
module.exports=router;