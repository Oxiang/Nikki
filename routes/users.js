// Import libraries for routing
const router = require('express').Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();

let salt = process.env.SALT;
let jwtSecret = process.env.JWTSECRET;

// Import the model required
let User = require('../models/user.model');

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

  // Middle man to salt and hash password
  router.post('/addUser', function(req, res, next) {

    if(isEmpty(req.body.password)) {
      return res.status(400).json("Password must not be empty");
    }
    // let salt = crypto.randomBytes(16).toString('base64');
    let hash = crypto.createHmac('sha512', salt).update(req.body.password).digest("base64");
  
    req.body.password = salt + "$" + hash;
    return next();
  })
  
  // Handles adding user data
  router.route('/addUser').post((req, res) => {
    // Error handling
    let errors = {};
    if(isEmpty(req.body.email)) {
      errors.email = "Email must not be empty"
    } else if (!isEmail(req.body.email)) {
      errors.email = "Must be a valid email"
    }
    if(isEmpty(req.body.username)) {
      errors.username = "Username must not be empty"
    }
    if(isEmpty(req.body.password)) {
      errors.password = "Password must not be empty"
    }
    if(Object.keys(errors).length > 0) return res.status(400).json(errors);
    
    // Create user model and save
    const newUser = new User({
      userName: req.body.username,
      password: req.body.password,
      email: req.body.email,
      posts: [],
      sentimentId: "Testing"
    });
  
    let new_jwt_req = {
      userName : req.body.username,
      email: req.body.email,
    }

    // Ensure email is unique
    User.countDocuments({email: req.body.email})
      .exec((err, count) => {
        if (count > 0) {
          return res.status(400).json({errors: "Email has been used!"});
        } else {
          newUser.save()
          .then(() => {
              let refreshId = newUser.userName + jwtSecret;
              let hash = crypto.createHmac('sha512', salt).update(refreshId).digest("base64");
              // req.body.refreshKey = salt;
              token = jwt.sign(new_jwt_req, jwtSecret);

              let options = {
                maxAge: 1000 * 60 * 15, // would expire after 15 minutes
                // httpOnly: true, // The cookie only accessible by the web server
                signed: true // Indicates if the cookie should be signed
              }  
              return res.status(200).json({login: "Successful", jwt: token, time: options});
          })
          .catch(err => res.status(400).json({login: "Unsucceful", error: err}));
        }
      })
  })

  // Salt and hash password for login
  router.post('/loginUser', function(req, res, next) {
    if(isEmpty(req.body.password)) {
      return res.status(400).json({login: "Password must not be empty"});
    }
    // let salt = crypto.randomBytes(16).toString('base64');
    let hash = crypto.createHmac('sha512', salt).update(req.body.password).digest("base64");
  
    req.body.password = salt + "$" + hash;
    return next();
  })

  // Login
  router.route('/loginUser').post(async (req, res) => {
    // read cookies
    let user_data = await User.find({email: req.body.email})

    var token = "";
    if (user_data.length != 0) {
      if( user_data[0].password == req.body.password) {
          
        let new_jwt_req = {
            userName : user_data[0].userName,
            email: user_data[0].email,
          } 

          let refreshId = new_jwt_req.userName + jwtSecret;
          let hash = crypto.createHmac('sha512', salt).update(refreshId).digest("base64");
          // req.body.refreshKey = salt;
          token = jwt.sign(new_jwt_req, jwtSecret);
          // let b = new Buffer(hash);
          // let refresh_token = b.toString('base64');
          console.log(new_jwt_req);
      } 
      else {
          return res.status(400).json({login: "Unsuccessful, wrong password"});
      }
    } else {
      return res.status(400).json({login: "Unsuccessful, Unable to find account"});
    }

    let options = {
      maxAge: 1000 * 60 * 15, // would expire after 15 minutes
      // httpOnly: true, // The cookie only accessible by the web server
      signed: true // Indicates if the cookie should be signed
    }  
    // return res.cookie("jwt_token", token, options).json({login: "Successful"});
    return res.status(200).json({login: "Successful", jwt: token, time: options});

  })

  // Authentication
  // router.route('/authUser').get((req,res) => {
  //   if (req.headers['authorization']) {
  //     try {
  //         let authorization = req.headers['authorization'].split(' ');
  //         if (authorization[0] !== 'Bearer') {
  //             return res.status(401).send();
  //         } else {
  //             var decoded = jwt.verify(authorization[1], jwtSecret);
  //             console.log(decoded.email);
  //             // return next();
  //         }
  //     } catch (err) {
  //         return res.status(403).send();
  //     }
  //   } else {
  //       return res.status(401).send();
  //   }
  // })

  module.exports = router;