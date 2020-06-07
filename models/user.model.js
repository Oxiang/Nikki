// Import libraries
const mongoose = require('mongoose');

// Create schema for users
var UserSchema = new mongoose.Schema({
    userName: String,
    password: String,
    email: String,
    posts: Array,
    sentimentId: String
  });
  
  // Create Model for users
  var User = mongoose.model('user_datas', UserSchema);

  // Export
  module.exports = User;