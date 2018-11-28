var express = require('express');
var router = express.Router();

var db = require('./connection.js'); // db is pool
var common = require('./common.js');

//Get all SchoolRoom
router.get('/', function (req, res) {
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
                db.query('SELECT sr.* , location_name FROM school_room sr inner join location l where sr.location_ID = l.location_ID;', function (err, rows, fields) {
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
                                    id: rows[i].school_room_ID,
                                    name: rows[i].school_room_name,
                                    size: rows[i].school_room_size,
                                    description: rows[i].school_room_description,
                                    location: rows[i].location_name
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

//Get SchoolRoom Based on id
router.get('/:id', function (req, res) {
    if (req.get("token") == null || req.get("token") == "") {
        res.statusCode = 200;
        return res.json({
            respond: "Invalid Token Key",
            errors: true
        });
    } else {
        var id = req.params.id;
        var token = req.get("token");
        common.checksession(db, token, function (returnValue) {
            if (returnValue) {
                var parameters = {
                    school_room_ID: id
                };
                db.query('SELECT sr.* , location_name FROM school_room sr inner join location l where sr.location_ID = l.location_ID and ?;', parameters, function (err, rows, fields) {
                    if (err) {
                        res.statusCode = 200
                        return res.json({
                            respond: "Database ran into some problem",
                            errors: true
                        });
                    } else {
                        var jsonObject = {};
                        if (rows.length) {
                            jsonObject = {
                                id : rows[0].school_room_ID,
                                name: rows[0].school_room_name,
                                size: rows[0].school_room_size,
                                description: rows[0].school_room_description,
                                location: rows[0].location_name
                            }
                        }
                        return res.json({
                            respond: jsonObject,
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

// Create schoolroom
router.post('/admin', function (req, res) {
    if (req.get("token") == null || req.get("token") == "") {
        res.statusCode = 200;
        return res.json({
            respond: "Invalid Token Key",
            errors: true
        });
    } else {
        var token = req.get("token");
        common.checksessionadmin(db, token, function (returnValue) {
            if (returnValue) {
                if (req.body.name != "" || req.body.name != null && req.body.size != "" || req.body.size != null && req.body.locationid != "" || req.body.locationid != null) {
                    var sql_name = req.body.name;
                    var sql_description = req.body.description;
                    var sql_size = req.body.size;
                    var sql_locationid = req.body.locationid;

                    var paremeters = {
                        school_room_name: sql_name,
                        school_room_size: sql_size,
                        school_room_description: sql_description,
                        location_ID: sql_locationid,
                    };
                    var query = db.query('INSERT INTO school_room SET ?', paremeters, function (err, result) {
                        if (err) {
                            res.statusCode = 200
                            return res.json({
                                respond: "Create School room failed",
                                errors: true
                            });
                        } else {
                            if (result) {
                                return res.json({
                                    respond: "Successfully Created School Room",
                                    errors: false
                                });
                            } else {
                                res.statusCode = 200
                                return res.json({
                                    respond: "Create School room failed",
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

// update schoolroom
router.put('/admin/:id', function (req, res) {
    if (req.get("token") == null || req.get("token") == "") {
        res.statusCode = 200;
        return res.json({
            respond: "Invalid Token Key",
            errors: true
        });
    } else {
        var token = req.get("token");
        var id = req.params.id;
        common.checksessionadmin(db, token, function (returnValue) {
            if (returnValue) {
                if (req.body.name != "" || req.body.name != null && req.body.size != "" || req.body.size != null && req.body.locationid != "" || req.body.locationid != null) {
                    var sql_name = req.body.name;
                    var sql_description = req.body.description;
                    var sql_size = req.body.size;
                    var sql_locationid = req.body.locationid;
                    var updatequery1 = { school_room_name : sql_name , school_room_size: sql_size , school_room_description: sql_description , location_ID: sql_locationid};
                    var updatequery2 = { school_room_ID : id };
                    var query = db.query('UPDATE school_room SET ? where ? ', [updatequery1 , updatequery2], function (err, result) {
                        if(err){
                            res.statusCode = 200;
                            return res.json({
                              respond: "Update School Room failed , Database problem",
                              error: true
                            });
                          } else {
                            return res.json({
                              respond: "Successfuly School Room",
                              error: false
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