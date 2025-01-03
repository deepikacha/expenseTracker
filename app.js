// starting of app.js file
require('dotenv').config();
const bodyParser = require('body-parser');
const express = require('express');
const sequelize = require('./util/database');
const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expense');
const purchaseRoutes = require('./routes/purchase');
const ForgotPasswordRequests = require('./models/forgotPasswordRequests'); // Import the model
const User = require('./models/user');
const Expense = require('./models/expense');
const Order = require('./models/orders');
const Download = require('./models/Downloaded')
const path = require('path');

const cors = require('cors');
// const helmet=require('helmet');

const app = express();
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(cors());
// app.use(helmet())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.use(authRoutes);
app.use(expenseRoutes);
app.use('/purchase', purchaseRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'expense.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

//one user can have many expenses
User.hasMany(Expense,{ foreignKey: 'userId' });
Expense.belongsTo(User,{ foreignKey: 'userId' });
//  one user can have many orders
User.hasMany(Order,{ foreignKey: 'userId' });
Order.belongsTo(User,{ foreignKey: 'userId' });
//one user can have many forgotpasswordrequests
User.hasMany(ForgotPasswordRequests, { foreignKey: 'userId' });
ForgotPasswordRequests.belongsTo(User, { foreignKey: 'userId' });
//one user can have many downloads
User.hasMany(Download,{foreignKey:'userId'});
Download.belongsTo(User,{foreignKey:'userId'})


async function initialise() {
  try {
    await sequelize.sync(
      // {  force:true}
    )
    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  }
  catch (error) {
    console.log(error.message)
  }
}
initialise()
