exports.checksession = function(db, token, callback) {
  // clean it and return
  db.establishConnection(function(conn) {
    conn.collection("studentWithSecureLogin").find({
      "secure_login_session_token": token
    }).toArray(function(err, rows, fields) {
      if (err) {
        callback(false);
      } else {
        if (rows.length) {
          callback(true);
        } else {
          callback(false);
        }
      }
    });
  });
}

exports.getstudentid = function(db, token, callback) {
  // clean it and return
  var studentid = 0;
  db.establishConnection(function(conn) {
    conn.collection("studentWithSecureLogin").find({
      "secure_login_session_token": token
    }, {
      "secure_login_ID": "$secure_login_ID"
    }).toArray(function(err, rows, fields) {
      if (err) {
        callback(0);
      } else {
        if (rows.length) {
          studentid = rows[0].secure_login_ID;
          callback(studentid);
        } else {
          callback(0);
        }
      }
    });
  });
}

exports.checksessionadmin = function(db, token, callback) {
  // check if text is between min and max length
  db.establishConnection(function(conn) {
    conn.collection("studentWithSecureLogin").find({
      "secure_login_session_token": token,
    }, {
      "secure_login_admin": "$secure_login_admin"
    }).toArray(function(err, rows, fields) {
      if (err) {
        callback(false);
      } else {
        if (rows.length) {
          if (rows[0].secure_login_admin == 1) {
            callback(true);
          } else {
            callback(false);
          }
        } else {
          callback(false);
        }
      }
    });
  });
}

exports.checkstudentbymatrics = function(db, id, callback) {
  // check if text is between min and max length
  db.establishConnection(function(conn) {
    conn.collection("studentWithSecureLogin").find({"student_matrics": parseInt(id) }).toArray(function(err, rows, fields) {
      if (err) {
        callback(false);
      } else {
        if (rows.length) {
          callback(true);
        } else {
          callback(false);
        }
      }
    });
  });
}
exports.checkadminbymatrics = function(db, id, callback) {
  // check if text is between min and max length
  console.log(id);
  console.log(typeof id);
  db.establishConnection(function(conn) {
    conn.collection("studentWithSecureLogin").find({"admin_matrics": id }).toArray(function(err, rows, fields) {
      if (err) {
        callback(false);
      } else {
        if (rows.length) {
          callback(true);
        } else {
          callback(false);
        }
      }
    });
  });
}

//Check eventJoinStatus
exports.checkeventjoinstatus = function(db, studentID, event_id, callback) {
  // check if text is between min and max length
  db.establishConnection(function(conn) {
    conn.collection("join_event").find({
      "student_ID": studentID,
      "event_ID": event_id
    }, {
      "join_event_ID": "$join_event_ID"
    }).toArray(function(err, rows, fields) {
      if (err) {
        callback(false);
      } else {
        if (rows.length) {
          callback(true);
        } else {
          callback(false);
        }
      }
    });
  });
}


exports.getstudentbasedonstudenttable = function (db, secure_login, callback) {
    // clean it and return
    var studentid = 0;
    var paremeters1 = { secure_login_ID: secure_login };
    db.establishConnection(function(conn){
      conn.collection("studentWithSecureLogin").find({secure_login_ID: secure_login, student_ID:{$exists: true}}).toArray(function(err, rows, fields){
        if (err) {
            callback(0);
        } else {
            if (rows.length) {
                studentid = rows[0].student_ID;
                callback(studentid);
            } else {
                callback(0);
            }
        }
      });
    });
}


