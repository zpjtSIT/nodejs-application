var express = require('express');
var router = express.Router();
var fs = require("fs");
var db = require('./connection.js'); // db is pool
var common = require('./common.js');

//retrieve all event
router.get('/', function(req, res) {
  if (req.get("token") == null || req.get("token") === "") {
    res.statusCode = 200;
    return res.json({
      respond: "Invalid Token Key",
      errors: true
    });
  } else {
    var token = req.get("token");
    common.checksession(db, token, function(returnValue) {
      if (returnValue) {
        db.query('select e.* , sr.school_room_name , l.location_name from event e inner join school_room sr inner join location l where e.school_room_ID = sr.school_room_ID and sr.location_ID = l.location_ID', function(err, rows, fields) {
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
                  eventid: rows[i].event_ID,
                  eventname: rows[i].event_name,
                  eventdescription: rows[i].event_description,
                  eventstarttime: rows[i].event_start_time,
                  eventendtime: rows[i].event_end_time,
                  eventlocation: rows[i].school_room_name,
                  eventmainlocation: rows[i].location_name,
                  eventcreatedby: rows[i].event_created_by,
                  eventimage: rows[i].event_image,
                  eventurl: rows[i].event_url

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

// Get join status
router.get('/status/:id', function(req, res) {
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
        common.getstudentid(db, token, function(secure_login_id) {
          if (secure_login_id > 0) {
            common.getstudentbasedonstudenttable(db, secure_login_id, function(studentid) {
            db.query('SELECT join_event_ID from join_event where student_ID = ? and  event_ID = ?', [studentid, id], function(err, rows, fields) {
              if (err) {
                res.statusCode = 200;
                return res.json({
                  respond: "Database Error",
                  errors: true
                });
              } else {

                var join = false;

                if (rows.length) {
                  join = true;
                }

                return res.json({
                  respond: join,
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

// Join Event based on eventid
router.post('/join/:id', function(req, res) {
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
        common.getstudentid(db, token, function(secure_login_id) {
          if (secure_login_id > 0) {
            common.getstudentbasedonstudenttable(db, secure_login_id, function(studentid) {
              db.query('SELECT * FROM join_event where event_ID = ? and student_ID = ?', [id, studentid], function(err, rows, fields) {
                if (err) {
                  res.statusCode = 200;
                  return res.json({
                    respond: " Database Error",
                    errors: true
                  });
                } else {
                  if (rows.length) {
                    res.statusCode = 200;
                    return res.json({
                      respond: "Student Already Join Event ",
                      errors: true
                    });
                  } else {
                    var paremeters = {
                      event_ID: id,
                      student_ID: studentid,
                    };
                    var query = db.query('INSERT INTO join_event SET ?', paremeters, function(err, result) {
                      if (err) {
                        res.statusCode = 200
                        return res.json({
                          respond: "Database ran into problem",
                          errors: true
                        });
                      } else {
                        if (result) {
                          return res.json({
                            respond: "Successfully Join Event",
                            errors: false
                          });
                        } else {
                          res.statusCode = 200
                          return res.json({
                            respond: "Failed Joining event",
                            errors: true
                          });
                        }
                      }
                    });
                  }
                }
              });
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

router.get('/join/status', function(req, res) {
  if (req.get("token") == null || req.get("token") === "") {
    res.statusCode = 200;
    return res.json({
      respond: "Invalid Token Key",
      errors: true
    });
  } else {
    var token = req.get("token");
    common.checksession(db, token, function(returnValue) {
      if (returnValue) {

        common.getstudentid(db, token, function(studentid) {
          db.query('select event_name , event_start_time , event_end_time , event_image , event_created_by , location_name , school_room_name , event_url from event e inner join join_event je inner join student s inner join school_room sr inner join location l where e.event_ID = je.event_ID and s.student_ID = je.student_ID and sr.school_room_ID = e.school_room_ID and l.location_ID = sr.location_ID and s.secure_login_ID = ?', studentid, function(err, rows, fields) {
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
                    eventname: rows[i].event_name,
                    eventstarttime: rows[i].event_start_time,
                    eventendtime: rows[i].event_end_time,
                    eventlocation: rows[i].school_room_name,
                    eventmainlocation: rows[i].location_name,
                    eventcreatedby: rows[i].event_created_by,
                    eventimage: rows[i].event_image,
                    eventurl: rows[i].event_url

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

//Create new event
router.post('/admin', function(req, res) {
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
          var filename = "";
          if (req.body.eventimage !== "" && req.body.eventimage != null) {
            var image = req.body.eventimage;
            var base64Data = image.replace(/^data:image\/(png|gif|jpeg);base64,/, '');
            filename = "/image/event/" + new Date().getTime() + ".png";
            var filepathupload = "public" + filename;
            fs.writeFile(filepathupload, new Buffer(base64Data, "base64"), function(err) {
              if (err) console.log(err);
            });
          }

          if (req.body.eventname != "" && req.body.eventstarttime != "" && req.body.eventname != null && req.body.eventstarttime != null && req.body.eventendtime != null && req.body.eventendtime != null && req.body.roomid != null && req.body.roomid != null && req.body.eventcreatedby != null && req.body.eventcreatedby != null) {
            var paremeters = {
              event_name: req.body.eventname,
              event_description: req.body.eventdescription,
              event_start_time: req.body.eventstarttime,
              event_end_time: req.body.eventendtime,
              event_image: filename,
              school_room_ID: req.body.roomid,
              event_created_by: req.body.eventcreatedby,
              event_url: req.body.eventurl
            };

            var query = db.query('INSERT INTO event SET ?', paremeters, function(err, result) {
              if (err) {
                res.statusCode = 200
                return res.json({
                  respond: "Create event failed",
                  errors: true
                });
              } else {
                if (result) {
                  return res.json({
                    respond: "Successfuly Created event",
                    errors: false
                  });
                } else {
                  res.statusCode = 200
                  return res.json({
                    respond: "Create event failed",
                    errors: true
                  });
                }
              }
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

// Update event
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
        if (req.body.eventname !== "" && req.body.eventstarttime != "" && req.body.eventname != null && req.body.eventstarttime != null && req.body.eventendtime != null && req.body.eventendtime != null && req.body.roomid != null && req.body.roomid != null && req.body.eventcreatedby != null && req.body.eventcreatedby != null) {

          var filename = "";
          if (req.body.eventimage !== "" && req.body.eventimage != null) {
            var image = req.body.eventimage;
            var base64Data = image.replace(/^data:image\/(png|gif|jpeg);base64,/, '');
            filename = "/image/event/" + new Date().getTime() + ".png";
            var filepathupload = "public" + filename;
            fs.writeFile(filepathupload, new Buffer(base64Data, "base64"), function(err) {
              if (err) console.log(err);
            });
          }
          var paremeters = {};
          if (req.body.eventimage !== "" && req.body.eventimage != null) {

            paremeters = {
              event_name: req.body.eventname,
              event_description: req.body.eventdescription,
              event_start_time: req.body.eventstarttime,
              event_end_time: req.body.eventendtime,
              school_room_ID: req.body.roomid,
              event_created_by: req.body.eventcreatedby,
              event_url: req.body.eventurl,
              event_image: filename,
            };
          } else {
            paremeters = {
              event_name: req.body.eventname,
              event_description: req.body.eventdescription,
              event_start_time: req.body.eventstarttime,
              event_end_time: req.body.eventendtime,
              school_room_ID: req.body.roomid,
              event_created_by: req.body.eventcreatedby,
              event_url: req.body.eventurl
            };
          }
          var query = db.query('UPDATE event SET ? where event_ID = ? ', [paremeters, id], function(err, result) {
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

        } else {
          res.statusCode = 200;
          return res.json({
            respond: "Missing Fields",
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