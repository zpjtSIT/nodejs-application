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
        db.establishConnection(function(conn) {
          conn.collection("fault_reporting_cloud").find({}).toArray(function(err, rows, fields) {
            if (err) {
              res.statusCode = 200
              return res.json({
                respond: "Database ran into some problem",
                errors: true
              });
            } else {
              var jsonArray = [];
              if (rows.length) {
                var word = '';

                for (var i = 0; i < rows.length; i++) {

                  word += rows[i].fault_reporting_description + ","

                }
                var jsonObject = {
                  name: word,

                }
                jsonArray.push(jsonObject);
                return res.json({
                  respond: jsonArray,
                  errors: false
                });
              }

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

//Get all Location
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
        console.log("LAI");
        db.establishConnection(function(conn) {
          console.log("GON REDUCE")
          conn.collection("fault_reporting_cloud").mapReduce(function() {
            var summary = this.fault_reporting_description;
            if (summary) {
              // quick lowercase to normalize 
              summary = summary.toLowerCase().split(" ");
              for (var i = summary.length - 1; i >= 0; i--) {
                if (summary[i]) { // make sure there's something
                  emit(summary[i], 1); // store a 1 for each word
                }
              }
            }
          }, function(key, values) {
            var count = 0;
            values.forEach(function(v) {
              count += v;
            });
            return count;
          }, {
            out: "fault_chartss"
          });

          conn.collection("fault_chartss").find({}).sort({
            value: -1
          }).toArray(function(err, rows, fields) {
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
                    total: rows[i].value,
                    value: rows[i]._id

                  }
                  jsonArray.push(jsonObject);
                }
              }

              return res.json({
                respond: jsonArray,
                errors: false
              });
            }
          })

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