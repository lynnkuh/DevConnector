const express = require ('express');
const mongoose = require('mongoose');
const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');
const app = express();



//Db config
const db = require('./config/keys').mongoURI;

//Connect to MongoDb
mongoose.connect(db)
.then(() => console.log('MongoDb connected.'))
.catch(err => console.log(err));

//Let's write out the first route
app.get('/', (req, res) => res.send('Hello'));

//Use routes
app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);


const port = 5000;
app.listen(port, ()=> console.log(`server is running on port ${port}`));