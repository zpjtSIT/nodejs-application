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
        db.query('SELECT * FROM department', function(err, rows, fields) {
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
                  description : rows[i].department_description
                }
                jsonArray.push(jsonObject);
              }
            return res.json({
              respond: jsonArray,
              errors: false
            });
          }
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
router.post('/admin', function (req, res) {
    if (req.get("token") == null || req.get("token") == "") {
        res.statusCode = 200;
        return res.json({
            respond: "Invalid Token Key",
            errors: true
        });
    } else {
        var token = req.get("token");
        common.checksession(db, token, function (returnValue) {
            if (returnValue) {
               if (req.body.name !== "" && req.body.name != null){
                 var paremeters = {
                    department_name : req.body.name,
                    department_description : req.body.description
                  };
                 var query = db.query('INSERT INTO department SET ?', paremeters , function (err, result) {
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