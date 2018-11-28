var express = require('express');
var router = express.Router();
var common = require('./common.js');
var db = require('./connection.js'); // db is pool

// Get all Location
router.get('/cloud', function(req, res) {
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

        db.query('SELECT * FROM fault_cloud;', function(err, rows, fields) {
          if (err) {
            res.statusCode = 200
            return res.json({
              respond: "Database ran into some problem",
              errors: true
            });
          } else {
            var jsonArray = [];
            if (rows.length) {
              for (var i = 0; i < rows.length; i++) {

                var jsonObject = {
                  name: rows[i].name,

                }
                jsonArray.push(jsonObject);
              }
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

// Get all Location
router.get('/chart', function(req, res) {
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

        db.query('SELECT * FROM fault_chart;', function(err, rows, fields) {
          if (err) {
            res.statusCode = 200
            return res.json({
              respond: "Database ran into some problem",
              errors: true
            });
          } else {
            var jsonArray = [];
            if (rows.length) {
              for (var i = 0; i < rows.length; i++) {

                var jsonObject = {
                  total: rows[i].total,
                  value : rows[i].value

                }
                jsonArray.push(jsonObject);
              }
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


module.exports = router;