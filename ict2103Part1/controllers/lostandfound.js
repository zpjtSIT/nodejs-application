var express = require('express');
var router = express.Router();
var db = require('./connection.js'); // db is pool
var common = require('./common.js');
var fs = require("fs");

//Get all Lost Report
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
        db.query('SELECT ls.* , location_name , sr.school_room_name FROM lost_found ls inner join school_room sr inner join location l where ls.school_room_ID = sr.school_room_ID and sr.location_ID = l.location_ID ORDER BY lost_found_created DESC;', function(err, rows, fields) {
          if (err) {
            console.log(err);
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
                    id: rows[i].lost_found_ID,
                    date: rows[i].lost_found_created,
                    image: rows[i].lost_found_image,
                    classroom: rows[i].school_room_name,
                    description: rows[i].lost_found_description,
                    location: rows[i].location_name,
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
// New Lost Report
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
          if (req.body.lostimage !== "" && req.body.lostimage != null) {
            var image = req.body.lostimage;
            var base64Data = image.replace(/^data:image\/(png|gif|jpeg);base64,/, '');
            filename = "/image/lost/" + new Date().getTime() + ".png";
            var filepathupload = "public" + filename;
            fs.writeFile(filepathupload, new Buffer(base64Data, "base64"), function(err) {
              if (err) console.log(err);
            });
          }
          common.getstudentid(db, token, function(returnValue) {
            if (returnValue > 0) {
              var paremeters = {
                lost_found_image: filename,
                school_room_ID: req.body.schoolroom,
                lost_found_description: req.body.description,
                secure_login_ID: returnValue,
              };
              var query = db.query('INSERT INTO lost_found SET ?', paremeters, function(err, result) {
                if (err) {
                  res.statusCode = 200
                  return res.json({
                    respond: "Database ran into problem",
                    errors: truelost_found
                  });
                } else {
                  if (result) {
                    return res.json({
                      respond: "Successfully reported",
                      errors: false
                    });
                  } else {
                    res.statusCode = 200
                    return res.json({
                      respond: "Report failed",
                      errors: true
                    });
                  }
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

module.exports = router;