const { Model, DataTypes } = require('sequelize');
const sequelize = require('../util/database'); // Ensure to import the sequelize instance correctly
const User = require('./user');

class Downloaded extends Model {}

Downloaded.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true
  },
  userId: { // This is the foreign key linking to the User model
    type: DataTypes.INTEGER, // Should match the data type of User's primary key
    allowNull: false,
  },
  fileName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'downloaded'
});

// Define associations
User.hasMany(Downloaded, { foreignKey: 'userId', onDelete: 'CASCADE' });
Downloaded.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });

module.exports = Downloaded;
