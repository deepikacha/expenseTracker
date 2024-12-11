const { DataTypes, UUIDV4 } = require('sequelize');
const sequelize = require('../util/database');
const User = require('./user');

const ForgotPasswordRequests = sequelize.define('ForgotPasswordRequests', {
  id: {
    type: DataTypes.UUID,
    defaultValue: UUIDV4,
    allowNull: false,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users', // Ensure this matches your User table name
      key: 'id'
    }
  },
  isactive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

User.hasMany(ForgotPasswordRequests, { foreignKey: 'userId' });
ForgotPasswordRequests.belongsTo(User, { foreignKey: 'userId' });

module.exports = ForgotPasswordRequests;
