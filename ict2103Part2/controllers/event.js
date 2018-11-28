var express = require('express');
var router = express.Router();
var fs = require("fs");
var db = require('./connection.js'); // db is pool
var common = require('./common.js');
var dateFormat = require('dateformat');

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
        db.establishConnection(function(conn) {
          conn.collection("Eventschroomnameloc").find({}).toArray(function(err, rows, fields) {
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

// Get join status secure_login_ID != student_ID
// Get join status
router.get('/status/:id', function(req, res) {
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
        common.getstudentid(db, token, function(secure_login_id) {
          if (secure_login_id > 0) {
            common.getstudentbasedonstudenttable(db, secure_login_id, function(studentid) {
              db.establishConnection(function(conn) {
                conn.collection("join_event").find({
                  student_ID: studentid,
                  event_ID: id
                }).toArray(function(err, rows, fields) {
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
    var id = parseInt(req.params.id);
    var token = req.get("token");
    common.checksession(db, token, function(returnValue) {
      if (returnValue) {
        common.getstudentid(db, token, function(secure_login_id) {
          console.log("joining")
          if (secure_login_id > 0) {
            common.getstudentbasedonstudenttable(db, secure_login_id, function(studentid) {
              db.establishConnection(function(conn) {
                conn.collection("join_event").find({
                  event_ID: parseInt(id),
                  student_ID: parseInt(studentid)
                }).toArray(function(err, rows, fields) {
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
                      conn.collection("join_event").find({
                        join_event_ID: "$join_event_ID"
                      }).sort({
                        join_event_ID: -1
                      }).limit(1).toArray(function(err, rows, fields) {
                        var joineventid;
                        if (err) {
                          console.log(err)
                        }
                        if (rows.length == 0) {
                          joineventid = 0;
                        }
                        if (rows.length) {
                          joineventid = rows[0].join_event_ID;
                        }
                        conn.collection("Eventschroomnameloc").find({
                          event_ID: id
                        }).toArray(function(err, rows, fields) {
                          if (rows.length) {
                            var paremeters = {
                              join_event_ID: parseInt(joineventid) + 1,
                              event_ID: id,
                              event_name: rows[0].event_name,
                              event_start_time: rows[0].event_start_time,
                              event_image: rows[0].event_image,
                              event_created_by: rows[0].event_created_by,
                              location_name: rows[0].location_name,
                              schoom_room_name: rows[0].school_room_name,
                              event_url: rows[0].event_url,
                              student_ID: studentid,
                              time_stamp: new Date()
                            };
                            conn.collection("join_event").insertOne(paremeters, function(err, result) {
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
                        });

                      });


                    }
                  }
                });
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

        common.getstudentid(db, token, function(secure_login_id) {
          if (secure_login_id > 0) {
            common.getstudentbasedonstudenttable(db, secure_login_id, function(studentid) {
              db.establishConnection(function(conn) {
                conn.collection("join_event").find({
                  student_ID: studentid
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
          var base64Data;
          if (req.body.eventimage !== "" && req.body.eventimage != null) {
            var image = req.body.eventimage;
            if (image != "") {
              base64Data = image.replace(/^data:image\/(png|gif|jpeg);base64,/, '');
            } else {
              image = "/image/student/nopic.jpg";
              base64Data = image.replace(/^data:image\/(png|gif|jpeg);base64,/, '');
            }
            filename = "/image/event/" + new Date().getTime() + ".png";
            var filepathupload = "public" + filename;
            fs.writeFile(filepathupload, new Buffer(base64Data, "base64"), function(err) {
              if (err) console.log(err);
            });
          }

          if (req.body.eventname != "" && req.body.eventstarttime != "" && req.body.eventname != null && req.body.eventstarttime != null && req.body.eventendtime != null && req.body.eventendtime != null && req.body.roomid != null && req.body.roomid != null && req.body.eventcreatedby != null && req.body.eventcreatedby != null) {

            db.establishConnection(function(conn) {
              conn.collection("SchoolroomwithLoc").find({
                school_room_ID: parseInt(req.body.roomid)
              }, {
                school_room_name: "$school_room_name",
                location_name: "$location_name"
              }).toArray(function(err, rows, fields) {
                if (rows.length) {
                  var locationname = rows[0].location_name;
                  var schoolrm = rows[0].school_room_name;
                  conn.collection("Eventschroomnameloc").find({}, {
                    event_ID: "$event_ID"
                  }).sort({
                    event_ID: -1
                  }).limit(1).toArray(function(err, rows, fields) {
                    var eventID;
                    if (rows.length) {
                      eventID = rows[0].event_ID;
                    } else {
                      eventID = 0;
                    }
                    var paremeters = {
                      event_ID: parseInt(eventID) + 1,
                      event_name: req.body.eventname,
                      event_description: req.body.eventdescription,
                      event_start_time: new Date(req.body.eventstarttime + "T01:00:00.000Z"),
                      event_end_time: new Date(req.body.eventendtime + "T10:00:00.000Z"),
                      event_image: filename,
                      school_room_ID: parseInt(req.body.roomid),
                      school_room_name: schoolrm,
                      location_name: locationname,
                      event_created_by: req.body.eventcreatedby,
                      event_url: req.body.eventurl
                    };
                    conn.collection("Eventschroomnameloc").insertOne(paremeters, function(err, result) {
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
    var id = parseInt(req.params.id);
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
       //   console.log(Date(req.body.eventstarttime + "T01:00:00.000Z"));
          
          var day = dateFormat(new Date(req.body.eventstarttime), "yyyy-mm-dd");
          var final_start_date = day + "T01:00:00.000Z";
          
          var day1 = dateFormat(new Date(req.body.eventendtime), "yyyy-mm-dd");
          var final_end_date = day1 + "T10:00:00.000Z";
          
          db.establishConnection(function(conn) {
            conn.collection("SchoolroomwithLoc").find({
              school_room_ID: parseInt(req.body.roomid)
            }, {
              school_room_name: "$school_room_name",
              location_name: "$location_name"
            }).toArray(function(err, rows, fields) {
              if (rows.length) {
                var locationname = rows[0].location_name;
                var schroom = rows[0].school_room_name;
                if (req.body.eventimage !== "" && req.body.eventimage != null) {

                  paremeters = {
                    $set: {
                      event_name: req.body.eventname,
                      event_description: req.body.eventdescription,
                      event_start_time: final_start_date,
                      event_end_time: final_end_date,
                      school_room_ID: parseInt(req.body.roomid),
                      event_created_by: req.body.eventcreatedby,
                      school_room_name: parseInt(schroom),
                      location_name: locationname,
                      event_url: req.body.eventurl,
                      event_image: filename,
                    }

                  };
                } else {
                  paremeters = {
                    $set: {
                      event_name: req.body.eventname,
                      event_description: req.body.eventdescription,
                      event_start_time: new Date(req.body.eventstarttime + "T01:00:00.000Z"),
                      event_end_time: new Date(req.body.eventendtime + "T10:00:00.000Z"),
                      school_room_ID: parseInt(req.body.roomid),
                      event_created_by: req.body.eventcreatedby,
                      school_room_name: schroom,
                      location_name: locationname,
                      event_url: req.body.eventurl
                    }

                  };
                }
                conn.collection("Eventschroomnameloc").updateOne({
                  event_ID: id
                }, paremeters, function(err, result) {
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