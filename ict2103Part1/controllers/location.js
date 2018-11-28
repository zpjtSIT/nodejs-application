var express = require('express');
var router = express.Router();

var db = require('./connection.js'); // db is pool
var common = require('./common.js');

// Get all Location
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
                db.query('SELECT * from location', function (err, rows, fields) {
                    if (err) {
                        res.statusCode = 200
                        return res.json({
                            respond: "Database ran in to some problems",
                            errors: true
                        });
                    } else {
                        var jsonArray = [];
                        for (var i = 0; i < rows.length; i++) {
                            var jsonObject = {
                                locationid: rows[i].location_ID,
                                locationname: rows[i].location_name,
                                locationaddress: rows[i].location_address,
                                locationlat: rows[i].location_lat,
                                locationlong: rows[i].location_long,
                                locationdescription: rows[i].location_description,
                                locationopening: rows[i].location_opening,
                            }
                            jsonArray.push(jsonObject);
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

// Get schoolroom based on id
router.get('/:id', function (req, res) {
    if (req.get("token") == null || req.get("token") == "") {
        res.statusCode = 200;
        return res.json({
            respond: "Invalid Token Key",
            errors: true
        });
    } else 
        var id = req.params.id;
        var token = req.get("token");
        common.checksession(db, token, function (returnValue) {
            if (returnValue) {
                db.query('SELECT sr.* from school_room sr inner join location l where sr.location_ID = l.location_ID and sr.location_ID = ? ', id , function (err, rows, fields) {
                    if (err) {
                        res.statusCode = 200
                        return res.json({
                            respond: "Database ran in to some problems",
                            errors: true
                        });
                    } else {
                        var jsonArray = [];
                        for (var i = 0; i < rows.length; i++) {
                            var  jsonObject = {
                                id : rows[i].school_room_ID,
                                name: rows[i].school_room_name,
                                size: rows[i].school_room_size,
                                description: rows[i].school_room_description,
                                location: rows[i].location_name
                            }
                            jsonArray.push(jsonObject);
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
    });

// Get all Location based on id
router.get('/admin/:id', function (req, res) {
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
                var parameters = { location_ID: id };
                db.query('SELECT * from location where ?', parameters, function (err, rows, fields) {
                    if (err) {
                        res.statusCode = 200
                        return res.json({
                            respond: "Database ran in to some problems",
                            errors: true
                        });
                    } else {
                        var jsonObject = {};
                        for (var i = 0; i < rows.length; i++) {
                            jsonObject = {
                                locationid: rows[i].location_ID,
                                locationname: rows[i].location_name,
                                locationaddress: rows[i].location_address,
                                locationlat: rows[i].location_lat,
                                locationlong: rows[i].location_long,
                                locationdescription: rows[i].location_description,
                                locationopening: rows[i].location_opening,
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

// create new Location
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
                if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
                    res.statusCode = 200;
                    return res.json({
                        respond: "Missing Fields",
                        errors: true
                    });
                } else {
                    if (req.body.name != "" && req.body.address != "" && req.body.name != null && req.body.address != null) {
                        var paremeters = { location_name: req.body.name, location_address: req.body.address, location_lat: req.body.lat, location_long: req.body.long, location_description: req.body.description, location_opening: req.body.opening };
                        var query = db.query('INSERT INTO location SET ?', paremeters, function (err, result) {
                            if (err) {
                                res.statusCode = 200
                                return res.json({
                                    respond: "Create Location failed",
                                    errors: true
                                });
                            } else {
                                if (result) {
                                    return res.json({
                                        respond: "Successfuly Created Location",
                                        errors: false
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

//Rouetr update based on location id
router.put('/admin/:id', function (req, res) {
    if (req.get("token") == null || req.get("token") == "") {
        res.statusCode = 200;
        return res.json({
            respond: "Invalid Token Key",
            errors: true
        });
    } else {
        var id = req.params.id;
        var token = req.get("token");
        common.checksessionadmin(db, token, function (returnValue) {
            if (returnValue) {
                if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
                    res.statusCode = 200;
                    return res.json({
                        respond: "Missing Fields",
                        errors: true
                    });
                } else {
                    if (req.body.name != "" && req.body.address != "" && req.body.name != null && req.body.address != null) {
                        var updatequery1 = { location_name: req.body.name, location_address: req.body.address, location_lat: req.body.lat, location_long: req.body.long, location_description: req.body.description, location_opening: req.body.opening };
                        var updatequery2 = { location_ID : id };
                        var query = db.query('UPDATE location SET ? where ? ', [updatequery1 , updatequery2], function (err, result) {
                            if(err){
                                res.statusCode = 200;
                                return res.json({
                                  respond: "Update Location failed , Database problem",
                                  error: true
                                });
                              } else {
                                return res.json({
                                  respond: "Successfuly Updated Location",
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