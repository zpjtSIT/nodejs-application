exports.checksession = function (db, token, callback) {
    // clean it and return

    var paremeters1 = { secure_login_session_token: token };
    db.query('SELECT secure_login_ID from secure_login where ?', [paremeters1], function (err, rows, fields) {
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
}

exports.getstudentid = function (db, token, callback) {
    // clean it and return
    var studentid = 0;
    var paremeters1 = { secure_login_session_token: token };
    db.query('SELECT secure_login_ID from secure_login where ?', [paremeters1], function (err, rows, fields) {
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
}

exports.checksessionadmin = function (db, token, callback) {
    // check if text is between min and max length
    var paremeters1 = { secure_login_session_token: token };
    db.query('SELECT secure_login_admin from secure_login where ?', [paremeters1], function (err, rows, fields) {
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
}

exports.checkstudentbymatrics = function (db, ID, callback) {
    // check if text is between min and max length
    var paremeters1 = { student_ID : ID };
    db.query('SELECT student_ID from student where ?', [paremeters1], function (err, rows, fields) {
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
}

exports.checkstudentbymatricsrevise = function (db, ID, callback) {
    // check if text is between min and max length
    var paremeters1 = { student_matrics : ID };
    db.query('SELECT student_ID from student where ?', [paremeters1], function (err, rows, fields) {
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
}

exports.checkadminbymatrics = function (db, ID, callback) {
    // check if text is between min and max length
    var paremeters1 = { admin_matrics : ID };
    db.query('SELECT admin_ID from admin where ?', [paremeters1], function (err, rows, fields) {
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
}

//Check eventJoinStatus
exports.checkeventjoinstatus = function (db, studentID , event_id , callback) {
    // check if text is between min and max length
    var paremeters1 = { student_ID : studentID , event_ID : event_id};
    db.query('SELECT join_event_ID from join_event where ?', [paremeters1], function (err, rows, fields) {
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
}

exports.getstudentbasedonstudenttable = function (db, secure_login, callback) {
    // clean it and return
    var studentid = 0;
    var paremeters1 = { secure_login_ID: secure_login };
    db.query('select * from student where ?', [paremeters1], function (err, rows, fields) {
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
}