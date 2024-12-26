const Sequelize=require('sequelize')
const sequelize=require('../util/database')
const Order=sequelize.define('order',{
    id:{
        type:Sequelize.INTEGER,
        autoIncrement:true,
        allowNull:false,
        primaryKey:true
    },
    paymentid:Sequelize.STRING,
    orderid:Sequelize.STRING,
    status:{
        type:Sequelize.STRING,
        defaultValue:'pending'
    }
})
//
module.exports=Order;