var express = require('express');
var router = express.Router();
var db = require('./connection.js'); // db is pool
var common = require('./common.js');
const bcrypt = require('bcrypt');
var nodemailer = require('nodemailer');
var randomstring = require("randomstring");
// Change password
router.post('/password', function(req, res) {
  if (req.get("token") == null || req.get("token") == "") {
    res.statusCode = 200;
    return res.json({
      respond: "Invalid Token Key",
      errors: true
    });
  } else {
    var token = req.get("token");
    common.checksession(db, token, function(returnValue) {
      if (returnValue) {
        if (req.body.password != "" && req.body.password != null && req.body.newpassword != "" && req.body.newpassword != null) {
          var paremeters1 = {
            secure_login_session_token: token
          };
          db.query('SELECT secure_login_ID , secure_login_password from secure_login where ?', [paremeters1], function(err, rows, fields) {
            if (err) {
              res.statusCode = 200;
              return res.json({
                respond: "Database error",
                errors: true
              });
            } else {
              if (rows.length) {
                var secureid = rows[0].secure_login_ID;
                var securepassword = rows[0].secure_login_password;
                var password = req.body.password;
                var newpassword = req.body.newpassword;
                bcrypt.compare(password, securepassword, function(err, result) {
                  if (result) {
                    if (err) {
                      res.statusCode = 200;
                      return res.json({
                        respond: "Something went wrong",
                        error: true
                      });
                    } else {
                      bcrypt.hash(newpassword, 10, function(err, hash) {
                        if (err) {
                          res.statusCode = 200;
                          return res.json({
                            respond: "Something went wrong",
                            error: true
                          });
                        } else {
                          var updatequery1 = {
                            secure_login_password: hash
                          };
                          var updatequery2 = {
                            secure_login_ID: secureid
                          };
                          var query = db.query('UPDATE secure_login SET ? where ? ', [updatequery1, updatequery2], function(err, result) {
                            if (err) {
                              res.statusCode = 200;
                              return res.json({
                                respond: "Database error",
                                error: true
                              });
                            } else {
                              return res.json({
                                respond: "Successfully Password Change",
                                errors: false
                              });
                            }
                          });
                        }
                      });
                    }
                  } else {
                    res.statusCode = 200;
                    return res.json({
                      respond: "Password not match",
                      error: true
                    });
                  }
                });
              } else {
                res.statusCode = 200;
                return res.json({
                  respond: "Invalid app Token or username",
                  error: true
                });
              }
            }
          });

        } else {
          res.statusCode = 200;
          return res.json({
            respond: "Missing Fields",
            error: true
          });
        }
      } else {
        res.statusCode = 200
        return res.json({
          respond: "Invalid session",
          errors: true
        });
      }
    });
  }
});

router.post('/forget', function(req, res) {
  if (req.body.email !== null && req.body.email !== "null") {
    var paremeters1 = {
      secure_login_email: req.body.email
    };
    db.query('SELECT * from secure_login where ?', [paremeters1], function(err, rows, fields) {
      if (err) {
        res.statusCode = 200
        return res.json({
          respond: "Database problem",
          errors: true
        });
      } else {
        if (rows.length) {

          var newpassword = randomstring.generate(7);

          bcrypt.hash(newpassword, 10, function(err, hash) {
            if (err) {
              res.statusCode = 200;
              return res.json({
                respond: "Something went wrong",
                error: true
              });
            } else {
              var updatequery1 = {
                secure_login_password: hash
              };
              var updatequery2 = {
                secure_login_ID: rows[0].secure_login_ID
              };
              var query = db.query('UPDATE secure_login SET ? where ? ', [updatequery1, updatequery2], function(err, result) {
                if (err) {
                  res.statusCode = 200;
                  return res.json({
                    respond: "Database error",
                    error: true
                  });
                } else {
                  var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                      user: 'ICT2102AY1819TEAM08@gmail.com',
                      pass: 'cat123!@#'
                    }
                  });
                  var mailOptions;

                  mailOptions = {
                    from: 'ICT2103 Admin Team',
                    to: req.body.email,
                    subject: 'Password reset',
                    html: 'HI <br /> Password Change Successfully <br /> <b> New password : ' + newpassword
                  };

                  transporter.sendMail(mailOptions, function(error, info) {
                    if (error) {
                      console.log(error);
                    } else {
                      console.log('Email sent: ' + info.response);
                    }
                    return res.json({
                      respond: "Successful Requested",
                      errors: false
                    });
                  });
                }
              });
            }
          });
        } else {
          res.statusCode = 200
          return res.json({
            respond: "Email Not found",
            errors: true
          });
        }
      }
    });
  } else {
    res.statusCode = 200
    return res.json({
      respond: "Missing Fields",
      errors: true
    });
  }
});

module.exports = router;