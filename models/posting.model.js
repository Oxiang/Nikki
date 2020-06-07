// Import Libraries
const mongoose = require('mongoose');

// Create schema for users
var postSchema = new mongoose.Schema({
    uniqueID: String,
    description: String,
    author: String
  }, {
    timestamps: true,
  });
  
  // Create Model for users
  var Posting = mongoose.model('user_posts', postSchema);

  // Export
  module.exports = Posting;