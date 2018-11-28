var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
var randtoken = require('rand-token');
var common = require('./common.js');
var db = require('./connection.js'); // db is pool


/* Login . */
router.post('/', function(req, res) {
  if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
    res.statusCode = 200;
    return res.json({
      respond: "Missing Fields",
      errors: true
    });
  } else {
    if (req.body.username != "" && req.body.password != "" && req.body.username != null && req.body.password != null) {
      var username = req.body.username;
      var password = req.body.password;
      var parameters = {
        secure_login_email: username
      };

      db.establishConnection(function(conn) {
        conn.collection("studentWithSecureLogin").find({
          "secure_login_email": username,
          "secure_login_admin": 1
        }, {
          "secure_login_ID": "$secure_login_ID",
          "secure_login_password": "$secure_login_password"
        }).toArray(function(err, rows) {
          if (err) {
            res.statusCode = 200;
            return res.json({
              respond: "Missing Fields",
              errors: true
            });
          } else {
            if (rows.length) {
              var securepassword = rows[0].secure_login_password;
              bcrypt.compare(password, securepassword, function(err, result) {
                if (result) {
                  if (err) {
                    res.statusCode = 200;
                    return res.json({
                      respond: "Something went wrong",
                      error: true
                    });
                  } else {

                    var token = randtoken.generate(16);
                    var secureid = rows[0].secure_login_ID;
                    var updatequery1 = {
                      $set: {
                        secure_login_session_token: token
                      }
                    };
                    var updatequery2 = {
                      secure_login_ID: secureid
                    };
                    var query = conn.collection("studentWithSecureLogin").updateOne(updatequery2, updatequery1, function(err, result) {
                      if (err) {
                        res.statusCode = 200;
                        return res.json({
                          respond: "Database error",
                          error: true
                        });
                      } else {
                        res.statusCode = 200;
                        return res.json({
                          token: token,
                          error: false
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
                respond: "Username not found",
                error: true
              });
            }
          }
        });
      });


    } else {
      res.statusCode = 200;
      return res.json({
        respond: "Missing Fields",
        error: true
      });
    }
  }
});

// Get all Location
router.post('/check', function(req, res) {
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
        res.statusCode = 200
        return res.json({
          respond: true,
          errors: false
        });
      } else {
        res.statusCode = 200
        return res.json({
          respond: false,
          errors: true
        });
      }
    });
  }
});

// Create new account
router.put('/', function(req, res) {
  var id = req.params.id;
  if (req.get("token") == null || req.get("token") == "") {
    res.statusCode = 200;
    return res.json({
      respond: "Invalid Token Key",
      errors: true
    });
  } else {
    var token = req.get("token");
    common.checksessionadmin(db, token, function(returnValue) {
      if (returnValue) {
        if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
          res.statusCode = 200;
          return res.json({
            respond: "Missing Fields",
            errors: true
          });
        } else {
          if (req.body.username != "" && req.body.password != "" && req.body.username != null && req.body.password != null) {
            var username = req.body.username;
            var password = req.body.password;
            db.establishConnection(function(conn) {
              conn.collection("studentWithSecureLogin").find({
                secure_login_email: username
              }, {
                secure_login_ID: "$secure_login_ID"
              }).toArray(function(err, rows, fields) {
                if (err) {
                  res.statusCode = 200;
                  return res.json({
                    respond: "Creating Account Failed , Database Error",
                    errors: true
                  });
                } else {
                  if (rows.length) {
                    res.statusCode = 200;
                    return res.json({
                      respond: "Email Already Existed ",
                      errors: true
                    });
                  } else {
                    bcrypt.hash(password, 10, function(err, hash) {
                      var paremeters = {
                        secure_login_email: username,
                        secure_login_password: hash
                      };
                      conn.collection("studentWithSecureLogin").insertOne(paremeters, function(err, result) {
                        if (err) {
                          res.statusCode = 200;
                          return res.json({
                            respond: "Creating Account Failed , Database Error",
                            errors: true
                          });
                        } else {
                          if (result) {
                            return res.json({
                              success: "Successfully Created Account",
                              errors: false
                            });
                          }
                        }
                      });
                    });
                  }
                }
              });
            });
          } else {
            res.statusCode = 200;
            return res.json({
              respond: "Missing Fields",
              errors: true
            });
          }
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


//create new student
router.post('/admin/student/:sid', function(req, res) {
  console.log(req.params.sid);
  console.log("creating students")
  var id = req.params.id;
  if (req.get("token") == null || req.get("token") == "") {
    res.statusCode = 200;
    return res.json({
      respond: "Invalid Token Key",
      errors: true
    });
  } else {
    var token = req.get("token");
    common.checksessionadmin(db, token, function(returnValue) {
      if (returnValue) {
        if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
          res.statusCode = 200;
          return res.json({
            respond: "Missing Fields",
            errors: true
          });
        } else {
          var sid = req.params.sid;
          console.log(sid)
          console.log("sid")
          if (req.body.username != "" && req.body.password != "" && req.body.username != null && req.body.password != null) {
            var username = req.body.username;
            var password = req.body.password;
            var paremeters = {
              secure_login_email: username
            };
            db.establishConnection(function(conn) {
              conn.collection("studentWithSecureLogin").find({
                secure_login_email: username
              }, {
                secure_login_ID: "$secure_login_ID"
              }).toArray(function(err, rows, fields) {
                if (err) {
                  res.statusCode = 200;
                  return res.json({
                    respond: "Creating Account Failed , Database Error",
                    errors: true
                  });
                } else {
                  if (rows.length) {
                    res.statusCode = 200;
                    return res.json({
                      respond: "Email Already Existed ",
                      errors: true
                    });
                  } else {
                    bcrypt.hash(password, 10, function(err, hash) {

                      var paremeters = {
                        $set: {
                          secure_login_email: username,
                          secure_login_password: hash
                        }

                      };
                      conn.collection("studentWithSecureLogin").updateOne({
                        student_ID: parseInt(sid)
                      }, paremeters, function(err, result) {
                        console.log("Insert")
                        if (err) {
                          res.statusCode = 200;
                          return res.json({
                            respond: "Creating Account Failed , Database Error",
                            errors: true
                          });
                        } else {
                          if (result) {

                            conn.collection("studentWithSecureLogin").find({}, {
                              secure_login_ID: "$secure_login_ID"
                            }).sort({
                              secure_login_ID: -1
                            }).limit(1).toArray(function(err, rows, fields) {
                              if (rows.length) {
                                var studentid = parseInt(rows[0].secure_login_ID) + 1;
                                var updatequery1 = {
                                  student_ID: parseInt(sid)
                                };
                                var updatequery2 = {
                                  $set: {
                                    secure_login_ID: studentid,
                                    secure_login_created: new Date(),
                                    secure_login_lastlogin: "NULL",
                                    secure_login_admin: 0,
                                  }
                                };
                                conn.collection("studentWithSecureLogin").updateOne(updatequery1, updatequery2, function(err, result) {
                                  console.log("Update");
                                  console.log(studentid)
                                  console.log(typeof studentid)
                                  if (err) {
                                    res.statusCode = 200;
                                    return res.json({
                                      respond: "Database error",
                                      error: true
                                    });
                                  } else {
                                    return res.json({
                                      respond: "Successfully Updated ",
                                      errors: false
                                    });
                                  }
                                });
                              }
                            });



                          }
                        }
                      });
                    });
                  }
                }
              });
            });

          } else {
            res.statusCode = 200;
            return res.json({
              respond: "Missing Fields",
              errors: true
            });
          }
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

//Create App Token 
//Return App Token 
//Return Session Token
router.post('/phone', function(req, res) {
  if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
    res.statusCode = 200;
    return res.json({
      respond: "Missing Fields",
      errors: true
    });
  } else {
    if (req.body.username != "" && req.body.password != "" && req.body.username != null && req.body.password != null) {
      var username = req.body.username;
      var password = req.body.password;
      db.establishConnection(function(conn) {
        conn.collection("studentWithSecureLogin").find({
          secure_login_email: username,
          secure_login_admin: 0
        }, {
          secure_login_ID: "$secure_login_ID",
          secure_login_password: "$secure_login_password"
        }).toArray(function(err, rows, fields) {
          if (err) {
            res.statusCode = 200;
            return res.json({
              respond: "Missing Fields",
              errors: true
            });
          } else {
            if (rows.length) {
              var securepassword = rows[0].secure_login_password;
              bcrypt.compare(password, securepassword, function(err, result) {
                if (result) {
                  var phonetoken = randtoken.generate(16);
                  var token = randtoken.generate(16);
                  var secureid = rows[0].secure_login_ID;
                  var updatequery1 = {
                    $set: {
                      secure_login_phone_token: phonetoken,
                      secure_login_session_token: token
                    }
                  };
                  var updatequery2 = {
                    secure_login_ID: secureid
                  };
                  conn.collection("studentWithSecureLogin").updateOne(updatequery2, updatequery1, function(err, result) {
                    if (err) {
                      res.statusCode = 200;
                      return res.json({
                        respond: "Database error",
                        error: true
                      });
                    } else {
                      return res.json({
                        app_token: phonetoken,
                        token: token,
                        error: false
                      });
                    }
                  });
                } else {
                  return res.json({
                    respond: "Password not match",
                    error: true
                  });
                }
              });
            } else {
              return res.json({
                respond: "Username not found",
                error: true
              });
            }
          }
        });
      });
    } else {
      res.statusCode = 200;
      return res.json({
        respond: "Missing Fields",
        error: true
      });
    }
  }
});

//Login With APP Token
//Return session token
router.put('/phone', function(req, res) {
  if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
    res.statusCode = 200;
    return res.json({
      respond: "Missing Fields",
      errors: true
    });
  } else {
    if (req.body.app_token != "" && req.body.app_token != null && req.body.username != "" && req.body.username != null) {
      var phoneToken = req.body.app_token;
      var username = req.body.username;
      var paremeters1 = {
        secure_login_phone_token: phoneToken
      };
      var paremeters2 = {
        secure_login_email: username
      };
      db.establishConnection(function(conn) {
        conn.collection("studentWithSecureLogin").find({
          secure_login_phone_token: phoneToken,
          secure_login_email: username,
          secure_login_admin: 0
        }, {
          secure_login_ID: "$secure_login_ID"
        }).toArray(function(err, rows, fields) {
          if (err) {
            res.statusCode = 200;
            return res.json({
              respond: "Database error",
              errors: true
            });
          } else {
            if (rows.length) {
              var token = randtoken.generate(16);
              var secureid = rows[0].secure_login_ID;
              var updatequery1 = {
                $set: {
                  secure_login_session_token: token
                }
              };
              var updatequery2 = {
                secure_login_ID: secureid
              };
              conn.collection("studentWithSecureLogin").updateOne(updatequery2, updatequery1, function(err, result) {
                if (err) {
                  res.statusCode = 200;
                  return res.json({
                    respond: "Database error",
                    error: true
                  });
                } else {
                  return res.json({
                    token: token,
                    error: false
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
      });
    } else {
      res.statusCode = 200;
      return res.json({
        respond: "Missing Fields",
        error: true
      });
    }
  }
});


router.post('/admin/admin/:sid', function(req, res) {
  var id = req.params.id;
  if (req.get("token") == null || req.get("token") == "") {
    res.statusCode = 200;
    return res.json({
      respond: "Invalid Token Key",
      errors: true
    });
  } else {
    var token = req.get("token");
    common.checksessionadmin(db, token, function(returnValue) {
      if (returnValue) {
        if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
          res.statusCode = 200;
          return res.json({
            respond: "Missing Fields",
            errors: true
          });
        } else {
          var sid = parseInt(req.params.sid);
          if (req.body.username != "" && req.body.password != "" && req.body.username != null && req.body.password != null) {
            var username = req.body.username;
            var password = req.body.password;
            var paremeters = {
              secure_login_email: username
            };
            db.establishConnection(function(conn) {
              conn.collection("studentWithSecureLogin").find({
                secure_login_email: username
              }, {
                secure_login_ID: "$secure_login_ID"
              }).toArray(function(err, rows, fields) {
                if (err) {
                  res.statusCode = 200;
                  return res.json({
                    respond: "Creating Account Failed , Database Error",
                    errors: true
                  });
                } else {
                  if (rows.length) {
                    res.statusCode = 200;
                    return res.json({
                      respond: "Email Already Existed ",
                      errors: true
                    });
                  } else {
                    bcrypt.hash(password, 10, function(err, hash) {

                      conn.collection("studentWithSecureLogin").find({}, {
                        secure_login_ID: "$secure_login_ID"
                      }).sort({
                        secure_login_ID: -1
                      }).limit(1).toArray(function(err, rows, result) {
                        if (rows.length) {
                          var loginID = parseInt(rows[0].secure_login_ID);
                          console.log("creating admin ")
                          console.log(loginID);
                          var paremeters = {
                            $set: {
                              secure_login_ID: loginID + 1,
                              secure_login_email: username,
                              secure_login_password: hash,
                              secure_login_created: new Date(),
                              secure_login_admin: 1
                            }
                          };
                          var updatequery1 = {
                            admin_ID: sid
                          }
                          conn.collection("studentWithSecureLogin").updateOne(updatequery1, paremeters, function(err, result) {
                            if (err) {
                              res.statusCode = 200;
                              return res.json({
                                respond: "Creating Account Failed , Database Error",
                                errors: true
                              });
                            } else {
                              if (result) {
                                return res.json({
                                  respond: "Successfully Updated ",
                                  errors: false
                                });
                              }
                            }
                          });
                        }
                      });
                    });
                  }
                }
              });
            });
          } else {
            res.statusCode = 200;
            return res.json({
              respond: "Missing Fields",
              errors: true
            });
          }
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
module.exports = router;