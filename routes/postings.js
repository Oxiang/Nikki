// Import required libraries
const router = require('express').Router();
var { v1: uuidv1 } = require('uuid'); // Time based id

// Import models
let User = require('../models/user.model');
let Posting = require('../models/posting.model');

// Checker functions
// Check if is email
const isEmail = (email) => {
    const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(email.match(regEx)) return true;
    else return false;
  }
  
  // Check empty strings
  const isEmpty = (string) => {
    if(string.trim() === '') return true;
    else return false;
  }

  // Create posting and update the user's post id
router.route('/createPost').post(async (req, res) => {
    // Error handling
    let errors = {}
  
    if(isEmpty(req.body.email)) errors.email = "Email must not be empty";
    if(Object.keys(errors).length > 0) return res.status(400).json(errors);
  
    const _email = req.body.email;
    const _description = req.body.description;
    const uniqueId = uuidv1();
  
    const newPost = new Posting({
      uniqueID: uniqueId,
      description: _description,
      author: _email
    });
    
    let userDoc = await User.countDocuments({email: _email});
    if (userDoc == 0) {
      return res.status(400).json("Unable to find email");
    }
    var updateMsg = "";
    // Update post database
    User.updateOne({email: _email}, {$push : {posts: uniqueId}})
      .then(() => updateMsg = updateMsg + "Updated user's post ")
      .catch(err => res.status(400).json({error: err}));
  
    newPost.save()
    .then(() => res.json({post: "Successful"}))
    .catch(err => res.status(400).json({error: err}))
  })
  
  // Get posting
  router.route('/getPost').post((req, res) => {
    // Error handling
    if (isEmpty(req.body.uniqueId)) return res.status(400).json("uniqueID must not be empty");
  
    const _uniqueID = req.body.uniqueId;
    

    Posting.find({uniqueID: _uniqueID})
      .then((doc) => {
        if (!doc.length) {
          return res.status(400).json({retrieve: "Document does not exists"});
        } else {
          return res.status(200).json({retrieve: 'Retrieved document', data: doc});
        }
      })
      .catch(err => res.status(400).json({error: err}));
  })
  
  // Update posting
  router.route('/updatePost').post(async (req, res) => {
    // Error handling
    let errors = {}
    if (isEmpty(req.body.uniqueId)) errors.uniqueId = "uniqueId must not be empty";
    if (Object.keys(errors).length > 0) return res.status(400).json(errors);
  
    const _uniqueID = req.body.uniqueId;
    const _description = req.body.description;
  
    let postDoc = await Posting.countDocuments({uniqueID : _uniqueID})
    if (postDoc == 0) {
      return res.status(400).json({error: "Unable to find the post"});
    }
  
    Posting.updateOne({uniqueID : _uniqueID}, {$set: {description: _description}})
    .then(() => res.json({update: `Updated post for ${_uniqueID}`}))
    .catch(err => res.status(400).json({error: err}))
  })
  
  // Delete posting
  router.route('/deletePost').post(async (req, res) => {
    //Error handling
    let errors = {}
    if (isEmpty(req.body.uniqueId)) errors.uniqueId = "uniqueId must not be empty";
    if (isEmpty(req.body.username)) errors.username = "username must not be empty";
    if (Object.keys(errors).length > 0) return res.status(400).json(errors);
  
    const _uniqueID = req.body.uniqueId;
    const _username = req.body.username;
  
    var updateMsg = "";
    User.updateOne({userName: _username}, {$pull : {posts: _uniqueID}})
    .then(() => updateMsg = updateMsg + "Updated user's post ")
    .catch(err => res.status(400).json({errors: err}));
  
    Posting.remove({uniqueID: _uniqueID})
      .then(() => res.json(updateMsg + ` Removed post ${_uniqueID}`))
      .catch(err => res.status(400).json({errors: err}))
  })

  // For view mode
  // Update posting
  router.route('/viewPost').post(async (req, res) => {
    // Error handling
    let errors = {}
    if(isEmpty(req.body.email)) errors.email = "Email must not be empty";
    if (Object.keys(errors).length > 0) return res.status(400).json(errors);
  
    let user_data = await User.find({email : req.body.email});
    let all_posts = user_data[0].posts;

    let records = await Posting.find().where('uniqueID').in(all_posts).exec();
    return res.status(200).json({posts: records});
  })

  module.exports = router;