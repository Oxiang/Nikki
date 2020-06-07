//Import the mongoose module
// var mongoose = require('mongoose');
// var { v1: uuidv1 } = require('uuid'); // Time based id
// const bodyparser = require('body-parser');
const router = require('express').Router();
const express = require('express');
const app = express();
// const crypto = require('crypto');
// app.use(express.json());
// app.use(express.urlencoded({ extended: false}));
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan')
const cors = require('cors');
require('dotenv').config();

//Connect to Mongoose
const uri = process.env.ATLAS_URI;
mongoose.connect(uri, {useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true})
  .then(() => console.log("DB connected"))
  .catch(err => console.log("DB connection error "+ err))

//Notify connection
const connection = mongoose.connection;
connection.once('open', () => {
    console.log("MongoDB database connection established");
})

// Create schema for users
// var UserSchema = new mongoose.Schema({
//   userName: String,
//   password: String,
//   email: String,
//   posts: Array,
//   sentimentId: String
// });

// Create Model for users
// var User = mongoose.model('user_datas', UserSchema);

// Create schema for users
// var postSchema = new mongoose.Schema({
//   uniqueID: String,
//   description: String,
//   author: String
// }, {
//   timestamps: true,
// });

// Create Model for users
// var Posting = mongoose.model('user_posts', postSchema);

// Check if is email
// const isEmail = (email) => {
//   const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
//   if(email.match(regEx)) return true;
//   else return false;
// }

// // Check empty strings
// const isEmpty = (string) => {
//   if(string.trim() === '') return true;
//   else return false;
// }

// Middle man to salt and hash password
// const SPass = (req, res, next) => {

//   if(isEmpty(req.body.password)) {
//     return res.status(400).json("Password must not be empty");
//   }
//   let salt = crypto.randomBytes(16).toString('base64');
//   let hash = crypto.createHmac('sha512', salt).update(req.body.password).digest("base64");

//   req.body.password = salt + "$" + hash;
//   return next();
// }

// Handles adding user data
// app.post('/addUser', SPass, (req, res) => {

//   // Error handling
//   let errors = {};
//   if(isEmpty(req.body.email)) {
//     errors.email = "Email must not be empty"
//   } else if (!isEmail(req.body.email)) {
//     errors.email = "Must be a valid email"
//   }
//   if(isEmpty(req.body.username)) {
//     errors.username = "Username must not be empty"
//   }
//   if(isEmpty(req.body.password)) {
//     errors.password = "Password must not be empty"
//   }
//   if(Object.keys(errors).length > 0) return res.status(400).json(errors);
  
//   // Create user model and save
//   const newUser = new User({
//     userName: req.body.username,
//     password: req.body.password,
//     email: req.body.email,
//     posts: [],
//     sentimentId: "Testing"
//   });

//   User.countDocuments({userName: req.body.username})
//     .exec((err, count) => {
//       if (count > 0) {
//         return res.status(400).json("username must be unique");
//       } else {
//         newUser.save()
//         .then(() => res.json('User added!'))
//         .catch(err => res.status(400).json('Error '+ err));
//       }
//     })
// })

// // Create posting and update the user's post id
// app.post('/createPost', async (req, res) => {

//   // Error handling
//   let errors = {}

//   if(isEmpty(req.body.username)) errors.email = "Username must not be empty";
//   if(Object.keys(errors).length > 0) return res.status(400).json(errors);

//   const _username = req.body.username;
//   const _description = req.body.description;
//   const uniqueId = uuidv1();

//   const newPost = new Posting({
//     uniqueID: uniqueId,
//     description: _description,
//     author: _username
//   });

//   let userDoc = await User.countDocuments({userName: _username});
//   if (userDoc == 0) {
//     return res.status(400).json("Unable to find username");
//   }

//   var updateMsg = "";
//   // Update post database
//   User.updateOne({userName: _username}, {$push : {posts: uniqueId}})
//     .then(() => updateMsg = updateMsg + "Updated user's post ")
//     .catch(err => res.status(400).json('Error ' + err));

//   newPost.save()
//   .then(() => res.json(updateMsg + "& Created post!"))
//   .catch(err => res.status(400).json('Error '+ err))
// })

// // Get posting
// app.get('/getPost', (req, res) => {

//   // Error handling
//   if (isEmpty(req.body.uniqueId)) return res.status(400).json("uniqueID must not be empty");

//   const _uniqueID = req.body.uniqueId;

//   Posting.find({uniqueID: _uniqueID})
//     .then((doc) => {
//       if (!doc.length) {
//         return res.status(400).json("Document does not exists");
//       } else {res.json('Retrieved document');}
//     })
//     .catch(err => res.status(400).json('Error '+err));
// })

// // Update posting
// app.post('/updatePost', async (req, res) => {

//   // Error handling
//   let errors = {}
//   if (isEmpty(req.body.uniqueId)) errors.uniqueId = "uniqueId must not be empty";
//   if (Object.keys(errors).length > 0) return res.status(400).json(errors);

//   const _uniqueID = req.body.uniqueId;
//   const _description = req.body.description;

//   let postDoc = await Posting.countDocuments({uniqueID : _uniqueID})
//   if (postDoc == 0) {
//     return res.status(400).json("Unable to find the post");
//   }

//   Posting.updateOne({uniqueID : _uniqueID}, {$set: {description: _description}})
//   .then(() => res.json(`Updated post for ${_uniqueID}`))
//   .catch(err => res.status(400).json('Error '+ err))
// })

// // Delete posting
// app.post('/deletePost', async (req, res) => {

//   //Error handling
//   let errors = {}
//   if (isEmpty(req.body.uniqueId)) errors.uniqueId = "uniqueId must not be empty";
//   if (isEmpty(req.body.username)) errors.username = "username must not be empty";
//   if (Object.keys(errors).length > 0) return res.status(400).json(errors);

//   const _uniqueID = req.body.uniqueId;
//   const _username = req.body.username;

//   var updateMsg = "";
//   User.updateOne({userName: _username}, {$pull : {posts: _uniqueID}})
//   .then(() => updateMsg = updateMsg + "Updated user's post ")
//   .catch(err => res.status(400).json('Error ' + err));

//   Posting.remove({uniqueID: _uniqueID})
//     .then(() => res.json(updateMsg + ` Removed post ${_uniqueID}`))
//     .catch(err => res.status(400).json('Error '+ err))
// })

// Import routes
var usersRoute = require('./routes/users');
var postingsRoute = require('./routes/postings');

// View engine setup
app.set('views', path.join(__dirname, "views"));
app.set('view engine', 'jade');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Set up routes
app.use("/users", usersRoute);
app.use("/postings", postingsRoute);

const PORT =  5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
});