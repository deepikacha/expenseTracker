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
  userId: {
    type: DataTypes.UUID,
    allowNull: false
    
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

User.hasMany(Downloaded, { foreignKey: 'userId' });
Downloaded.belongsTo(User, { foreignKey: 'id' });

module.exports = Downloaded;
