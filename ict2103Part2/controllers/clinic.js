var express = require('express');
var router = express.Router();
var db = require('./connection.js'); // db is pool
var common = require('./common.js');
var soap = require('soap');

// Get all Clinic
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
          conn.collection("clinic").find({}).toArray(function(err, rows, fields) {
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
                  id: rows[i].S_N,
                  name: rows[i].CLINIC_NAME,
                  address: "BLK " + rows[i].BLK + " " + rows[i].ROAD_NAME + " " + rows[i].UNIT_NO,
                  postal: rows[i].POSTAL_CODE,
                  buildingname: rows[i].BUILDING_NAME,
                  phone: rows[i].PHONE
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

// Get all Location
router.get('/:id', function(req, res) {
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
        var id = parseInt(req.params.id);
        db.establishConnection(function(conn) {
          conn.collection("clinic").find({
            S_N: id
          }).toArray(function(err, rows, fields) {
            if (err) {
              res.statusCode = 200
              return res.json({
                respond: "Database ran into some problem",
                errors: true
              });
            } else {
              console.log(rows[0])
              var jsonObject = {
                id: rows[0].S_N,
                name: rows[0].CLINIC_NAME,
                address: "BLK " + rows[0].BLK + " " + rows[0].ROAD_NAME + " " + rows[0].UNIT_NO,
                postal: rows[0].POSTAL_CODE,
                buildingname: rows[0].BUILDING_NAME,
                phone: rows[0].PHONE,
                lat: rows[0].LAT,
                lng: rows[0].LONG,
                estate: rows[0].ESTATE,
                fax: rows[0].FAX,
                openinghours: "WEEKDAY : " + rows[0].WEEKDAY + "<br> SAT :" + rows[0].SAT + "<br> SUN :" + rows[0].SUN + "<br> Public Holiday : " + rows[0].PUBLIC_HOLIDAYS,
                //  openinghours : {weekday : rows[0].WEEKDAY , sat : rows[0].SAT , sun : rows[0].SUN , holiday : rows[0].PUBLIC_HOLIDAYS},
                remarks: rows[0].CLINIC_REMARKS
              }
              return res.json({
                respond: jsonObject,
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

router.post('/search', function(req, res) {
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
        if (req.body.searchvalue != "" && req.body.searchvalue != null) {
          var paremeter1 = req.body.searchvalue
          db.establishConnection(function(conn) {
            conn.collection("clinic").find({
              $or: [{
                ESTATE: new RegExp(paremeter1, 'i')
              }, {
                CLINIC_NAME:  new RegExp(paremeter1, 'i')
              }, {
                POSTAL_CODE: new RegExp(paremeter1, 'i')
              }]
            }).toArray(function(err, rows, fields) {
              if (err) {
                res.statusCode = 200
                return res.json({
                  respond: err,
                  errors: true
                });
              } else {
                
                var jsonArray = [];
                for (var i = 0; i < rows.length; i++) {
                  var jsonObject = {
                    id: rows[i].S_N,
                    name: rows[i].CLINIC_NAME,
                    address: "BLK " + rows[i].BLK + " " + rows[i].ROAD_NAME + " " + rows[i].UNIT_NO,
                    postal: rows[i].POSTAL_CODE,
                    buildingname: rows[i].BUILDING_NAME,
                    phone: rows[i].PHONE
                  }
                  jsonArray.push(jsonObject);
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