var express = require('express');
var router = express.Router();
var common = require('./common.js');
var db = require('./connection.js'); // db is pool

// Get all Department
router.get('/admin', function(req, res) {
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
        db.establishConnection(function(conn) {
          conn.collection("department").find({}).toArray(function(err, rows, fields) {
            if (err) {
              res.statusCode = 200
              return res.json({
                respond: "Database ran into some problem",
                errors: true
              });
            } else {
              var jsonArray = [];
              for (var i = 0; i < rows.length; i++) {
                var jsonObject = {
                  id: rows[i].department_ID,
                  name: rows[i].department_name,
                  description: rows[i].department_description
                }
                jsonArray.push(jsonObject);
              }
              return res.json({
                respond: jsonArray,
                errors: false
              });
            }
          });
        });
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

// create Course
router.post('/admin', function(req, res) {
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
        if (req.body.name !== "" && req.body.name != null) {
          db.establishConnection(function(conn) {
            conn.collection("department").find({}, {
              department_ID: '$department_ID'
            }).sort({
              department_ID: -1
            }).limit(1).toArray(function(err, rows, fields) {
              var departmentID;
              var paremeters;
              if (rows.length) {
                departmentID = rows[0].department_ID;
                paremeters = {
                  department_ID: parseInt(departmentID) + 1,
                  department_name: req.body.name,
                  department_description: req.body.description
                };
                conn.collection("department").insertOne(paremeters, function(err, result) {
                  if (err) {
                    res.statusCode = 200;
                    return res.json({
                      respond: "Creating Department Failed , Database Error",
                      errors: true
                    });
                  } else {
                    if (result) {
                      return res.json({
                        success: "Successfully Created Department",
                        errors: false
                      });
                    }
                  }
                });
              } else {
                departmentID = 0;
                paremeters = {
                  department_ID: parseInt(departmentID) + 1,
                  department_name: req.body.name,
                  department_description: req.body.description
                };
                conn.collection("department").insertOne(paremeters, function(err, result) {
                  if (err) {
                    res.statusCode = 200;
                    return res.json({
                      respond: "Creating Department Failed , Database Error",
                      errors: true
                    });
                  } else {
                    if (result) {
                      return res.json({
                        success: "Successfully Created Department",
                        errors: false
                      });
                    }
                  }
                });
              }
            })
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



module.exports = router;