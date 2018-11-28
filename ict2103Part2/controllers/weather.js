var express = require('express');
var router = express.Router();
var db = require('./connection.js'); // db is pool
var common = require('./common.js');

const OpenWeatherMapHelper = require("openweathermap-node");
const helper = new OpenWeatherMapHelper(
    {
        APPID: 'ed41d6be84ab3155cbc03b521adcfcd2',
        units: "metric"
    }
);
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
                helper.getCurrentWeatherByCityName("Singapore", (err, currentWeather) => {
                    if(err){
                        res.statusCode = 200
                        return res.json({
                            respond: "Invalid session",
                            errors: true
                        });
                    }
                    else{
                        var weather = {
                            state : currentWeather.weather[0].main,
                            icon : "http://openweathermap.org/img/w/" + currentWeather.weather[0].icon + ".png",
                            temp : Math.round(currentWeather.main.temp) + " °C"
                        }
                        return res.json({
                            respond: weather,
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

module.exports = router;