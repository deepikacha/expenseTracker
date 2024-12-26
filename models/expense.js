const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Expense = sequelize.define('expense', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    amount: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    description: {
        type: Sequelize.STRING,
        allowNull: false
    },
    category: {
        type: Sequelize.STRING,
        allowNull: false
    },
    userId: { // Foreign key definition
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'users', // The table name for the User model
            key: 'id'
        }
    }
});

module.exports = Expense;
