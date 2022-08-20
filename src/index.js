const express = require('express');
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const colors = require('colors');
const cors = require('cors');
require('dotenv').config();// load the .env file from the current working directory
const { graphqlHTTP } = require('express-graphql');
const schema = require('./schema/schema');
const connectDB = require('./config/db');
const port = process.env.PORT || 5000;
const { expressjwt: jwt } = require('express-jwt');
const models = require('./models/index');
const app = express();
connectDB();


app.use(cors());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// parse cookies
app.use(cookieParser());


const getUser = async req => {
  const token = req.headers['x-token'];
  if (token) {
    try {
      return await jwt.verify(token, process.env.SECRET);
    } catch (e) {
      throw new Error('Invalid Token');
      
    }
  }
};

async function setContext({ req }) {
  const user = await getUser(req);
  return {
    models,
    user,
    secret: process.env.APP_SECRET,
  }
  
}

app.use('/graphql', graphqlHTTP(async (req, res, graphQLParams) => ({
    schema,
    graphiql: process.env.NODE_ENV === 'development',
    context: await setContext({req})
})));

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