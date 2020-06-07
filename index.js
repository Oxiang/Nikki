//Import the mongoose module
const mongoose = require('mongoose');
const router = require('express').Router();
const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan')
const cors = require('cors');
require('dotenv').config();
const webpack = require('webpack');

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

// View engine setup
app.set('views', path.join(__dirname, "views"));
app.set('view engine', 'jade');

let cookie_secret = process.env.COOKIESECRET

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false}));
app.use(cookieParser(cookie_secret));
// app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "client/build")));

// Import routes
var usersRoute = require('./routes/users');
var postingsRoute = require('./routes/postings');

// Set up routes
app.use("/users", usersRoute);
app.use("/postings", postingsRoute);

const PORT =  5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
});

console.log("Get started");

new webpack.ProvidePlugin({
  $: "jquery",
  jQuery: "jquery"
}) 