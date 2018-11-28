var express = require('express');
var router = express.Router();
var db = require('./connection.js'); // db is pool
var common = require('./common.js');
var fs = require("fs");


router.get('/', function(req, res) {
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
          conn.collection("Frlocschroomname").find({}).sort({
            fault_reporting_date: -1
          }).toArray(function(err, rows, fields) {
            if (err) {
              console.log(err);
              res.statusCode = 200
              return res.json({
                respond: "Database ran into some problem",
                errors: true
              });
            } else {
              var jsonArray = [];
              var fixed = "Not Fixed";
              if (rows.length) {
                for (var i = 0; i < rows.length; i++) {
                  var fixed = "";
                  if (rows[i].fault_reporting_fixed === 0) {
                    fixed = "Not Fixed";
                  } else {
                    fixed = "Fixed";
                  }
                  var jsonObject = {
                    id: rows[i].fault_reporting_ID,
                    date: rows[i].fault_reporting_date,
                    image: rows[i].fault_reporting_image,
                    classroom: rows[i].school_room_name,
                    description: rows[i].fault_reporting_description,
                    location: rows[i].location_name,
                    fixed: fixed
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

router.post('/', function(req, res) {
  if (req.get("token") == null || req.get("token") == "") {
    res.statusCode = 200;
    return res.json({
      respond: "Invalid Token Key",
      errors: true
    });
  } else {
    var imageurl = "";
    var token = req.get("token");
    common.checksession(db, token, function(returnValue) {
      if (returnValue) {
        if (req.body.schoolroom != null && req.body.schoolroom !== "") {
          var filename = "";
          if (req.body.faultimage !== "" && req.body.faultimage != null) {
            var image = req.body.faultimage;
            var base64Data = image.replace(/^data:image\/(png|gif|jpeg);base64,/, '');
            filename = "/image/fault/" + new Date().getTime() + ".png";
            var filepathupload = "public" + filename;
            fs.writeFile(filepathupload, new Buffer(base64Data, "base64"), function(err) {
              if (err) console.log(err);
            });
          }
          common.getstudentid(db, token, function(returnValue) {
            if (returnValue > 0) {
              console.log("TESTTT")
              db.establishConnection(function(conn) {
                var schroom;
                var schname;
                conn.collection("SchoolroomwithLoc").find({school_room_ID: parseInt(req.body.schoolroom)}).toArray(function(err, rows, fields){
                  if(err){
                    console.log(err)
                  }else{
                    schroom = rows[0].school_room_name;
                    schname = rows[0].location_name;
                  }
                  console.log(schroom)
                });
                conn.collection("Frlocschroomname").find({}, {
                  fault_reporting_ID: "$fault_reporting_ID"
                }).sort({
                  fault_reporting_ID: -1
                }).limit(1).toArray(function(err, rows, fields) {
                  var faultreportID;
                  if (err) {
                    faultreportID = 0;
                  }
                  if (rows.length) {
                    if (rows[0].fault_reporting_ID > 1) {
                      faultreportID = parseInt(rows[0].fault_reporting_ID);
                    } else {
                      faultreportID = 0;
                    }
                  } else {
                    faultreportID = 0;
                  }
                  console.log("schroom")
                  console.log(schroom)
                  var paremeters = {
                    fault_reporting_ID: faultreportID + 1,
                    fault_reporting_date: new Date(),
                    fault_reporting_image: filename,
                    school_room_ID: parseInt(req.body.schoolroom),
                    school_room_name: schroom,
                    location_name: schname,
                    fault_reporting_description: req.body.description,
                    fault_reporting_fixed: 0,
                    secure_login_ID: returnValue,
                  };
                  conn.collection("Frlocschroomname").insertOne(paremeters, function(err, result) {
                    if (err) {
                      console.log(err)
                      res.statusCode = 200
                      return res.json({
                        respond: "Database ran into problem",
                        errors: true
                      });
                    } else {
                      if (result) {
                        conn.collection("fault_reporting_cloud").insertOne({
                          fault_reporting_description: req.body.description
                        });
                        return res.json({
                          respond: "Successfully Log a Fault report",
                          errors: false
                        });
                      } else {
                        res.statusCode = 200
                        return res.json({
                          respond: "Log a fault report failed",
                          errors: true
                        });
                      }
                    }
                  });
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
        } else {
          res.statusCode = 200
          return res.json({
            respond: "Missing Field",
            errors: true
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

router.put('/admin/:id', function(req, res) {
  if (req.get("token") == null || req.get("token") == "") {
    res.statusCode = 200;
    return res.json({
      respond: "Invalid Token Key",
      errors: true
    });
  } else {
    var id = parseInt(req.params.id);
    var token = req.get("token");
    common.checksession(db, token, function(returnValue) {
      if (returnValue) {
        if (req.body.fixed !== "" && req.body.fixed != null) {
          db.establishConnection(function(conn) {
            conn.collection("Frlocschroomname").updateOne({
              fault_reporting_ID: id
            }, {
              $set: {
                fault_reporting_fixed: parseInt(req.body.fixed)
              }
            }, function(err, result) {
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
          });
        } else {
          res.statusCode = 200;
          return res.json({
            respond: "Missing Fields",
            errors: true
          });
        }
      } else {
        res.statusCode = 200;
        return res.json({
          respond: "Invalid Token Key",
          errors: true
        });
      }
    });
  }
});


module.exports = router;