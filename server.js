const express = require ('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');
const passport = require('passport');


const app = express();

//Body parser middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//Db config
const db = require('./config/keys').mongoURI;

//Connect to MongoDb
mongoose.connect(db)
.then(() => console.log('MongoDb connected.'))
.catch(err => console.log(err));

//passport middleware
app.use(passport.initialize());

//Passport configuration
require('./config/passport')(passport);

//Use routes
app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);


const port = 5000;
app.listen(port, ()=> console.log(`server is running on port ${port}`));