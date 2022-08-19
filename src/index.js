const express = require('express');
bodyParser = require('body-parser')
const colors = require('colors');
const cors = require('cors');
require('dotenv').config();// load the .env file from the current working directory
const { graphqlHTTP } = require('express-graphql');
const schema = require('./schema/schema');
const User = require('../src/models/User');
const connectDB = require('./config/db');
const port = process.env.PORT || 5000;


const app = express();
connectDB();


app.use(cors());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: process.env.NODE_ENV === 'development'
}));

app.use('/login', async (req, res) => {

  try {
    const user = await User.findOne({ username: req.body.username, password: req.body.password });
    if (user) {
      res.send({
        token: 'this is a token',
        user: user.username
      });
    } else {
      res.send({});
    }
  } catch (err) {
    console.log(err);
  }

  
} );


app.listen(port, console.log(`Server running on port ${port}`));