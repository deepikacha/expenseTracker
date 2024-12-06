require('dotenv').config()
const bodyParser = require('body-parser')
const express = require('express')
const sequelize = require('./util/database')
const authRoutes = require('./routes/auth')
const expenseRoutes = require('./routes/expense');
const User=require('./models/user')
const Expense=require('./models/expense')
const path = require('path')

const app = express()
app.set('view engine', 'ejs')
app.set('views', 'views')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json());

app.use(authRoutes)
app.use(expenseRoutes);

app.get('/signup', (req, res) => {
 
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

User.hasMany(Expense)
Expense.belongsTo(User)
sequelize
  .sync()
  .then((result) => {
    console.log('Database connected.');
    app.listen(3000, () => {
      console.log('Server is running on http://localhost:3000');
    });
  })
  .catch((err) => console.log('Database connection error:', err));

