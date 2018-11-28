var express = require('express');
var router = express.Router();
var common = require('./common.js');
var db = require('./connection.js'); // db is pool

// Get all Course
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
          conn.collection("course").find({}).toArray(function(err, rows, fields) {
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
                  id: rows[i].course_ID,
                  name: rows[i].course_name,
                  description: rows[i].course_description
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
            conn.collection("course").find({}, {
              course_ID: "$course_ID"
            }).sort({
              course_ID: -1
            }).limit(1).toArray(function(err, rows, fields) {
              var courseID;
              if (rows.length) {
                courseID = rows[0].course_ID;
              } else {
                courseID = 0;
              }

              var paremeters = {
                course_ID: parseInt(courseID) + 1,
                course_name: req.body.name,
                course_description: req.body.description
              };
              conn.collection("course").insertOne(paremeters, function(err, result) {
                if (err) {
                  res.statusCode = 200;
                  return res.json({
                    respond: "Creating course Failed , Database Error",
                    errors: true
                  });
                } else {
                  if (result) {
                    return res.json({
                      success: "Successfully Created course",
                      errors: false
                    });
                  }
                }
              });

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

// Update Course based on id
router.put('/admin/:id', function(req, res) {
  if (req.get("token") == null || req.get("token") == "") {
    res.statusCode = 200;
    return res.json({
      respond: "Invalid Token Key",
      errors: true
    });
  } else {
    var id = req.params.id;
    var token = req.get("token");
    common.checksession(db, token, function(returnValue) {
      if (returnValue) {

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