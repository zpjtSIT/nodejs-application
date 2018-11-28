var express = require('express');
var router = express.Router();
var db = require('./connection.js'); // db is pool
var common = require('./common.js');
var soap = require('soap');
var xml2js = require('xml2js');
var eyes = require('eyes');
var http = require('http');
var fs = require('fs');
var parser = new xml2js.Parser();

var APIToken = 'REVWLVFpQ2hlbmc6UWlDaGVuZ0luTkxCQDheX144';
var url = 'http://openweb-stg.nlb.gov.sg/OWS/CatalogueService.svc?singleWsdl';

// Get all popular book
router.get('/popular', function (req, res) {
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
                var popular_url = "http://opendata.nlb.gov.sg/content/RSS.DDC.Popular/332";

                parser.on('error', function(err) { console.log('Parser error', err); });

                var data = '';
                http.get(popular_url, function(result) {
                    if (result.statusCode >= 200 && result.statusCode < 400) {
                        result.on('data', function(data_) { data += data_.toString(); });
                        result.on('end', function() {
                        parser.parseString(data, function(err, result) {
                            var json_result = []
                            var result_sort = result.rss.channel[0];
                            
                            for (var i = 0; i < (result_sort.item).length; i++) {
                                
                               var image_url = "http://www.syndetics.com/index.aspx?isbn=" + result_sort.item[i].ISBN_Number + "/mc.gif&client=natlibsingapore";
                               var bid = result_sort.item[i].BID;
                                    var book = {
                                        BID: result_sort.item[i].BID[0],
                                        ISBN: result_sort.item[i].ISBN_Number[0],
                                        TitleName: result_sort.item[i].title[0],
                                        Author: result_sort.item[i].Author[0],
                                        PublishYear: result_sort.item[i].Publication_Year[0],
                                        MediaCode: result_sort.item[i].Media_Type[0],
                                        MediaDesc: result_sort.item[i].Media_Description[0],
                                        thumbnail: image_url
                                    }
                                    json_result.push(book);
                              }
                            return res.json({
                                respond: json_result,
                                errors: false
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

// Get all books based on title
router.post('/:page', function (req, res) {
    if (req.get("token") == null || req.get("token") == "") {
        res.statusCode = 200;
        return res.json({
            respond: "Invalid Token Key",
            errors: true
        });
    } else {
        var pagenumber = req.params.page;
        var token = req.get("token");
        common.checksession(db, token, function (returnValue) {
            if (returnValue) {
                if (req.body.bookname !== "" && req.body.bookname != null) {
                    var args = {
                        SearchItem: {
                            SearchField: "Title",
                            SearchTerms: req.body.bookname
                        }
                    };
                    var args1 = {
                        StartRecordPosition: pagenumber,
                        SetId: req.body.setid,
                        MaximumRecords: 20
                    }
                    var args = {
                        APIKey: APIToken,
                        SearchItems: args,
                        Modifiers: args1
                    };
                    soap.createClient(url, {
                        wsdl_options: {
                            timeout: 0
                        }
                    }, function (err, client) {
                        client.Search(args, function (err, result) {
                            if(err){
                                return res.json({
                                    respond: err,
                                    errors: false
                                });
                            }
                          
                          console.log(result);
                            if (result.Status != "FAIL") {
                                var json_result = []

                                var json_object = {
                                    NextRecordPosition: result.NextRecordPosition,
                                    SetId: result.SetId,
                                    TotalRecords: result.TotalRecords,
                                }

                                for (var i in result.Titles.Title) {
                                    var image_url = "http://www.syndetics.com/index.aspx?isbn=" + result.Titles.Title[i].ISBN + "/mc.gif&client=natlibsingapore"
                                    var book = {
                                        BID: result.Titles.Title[i].BID,
                                        ISBN: result.Titles.Title[i].ISBN,
                                        TitleName: result.Titles.Title[i].TitleName,
                                        Author: result.Titles.Title[i].Author,
                                        PublishYear: result.Titles.Title[i].PublishYear,
                                        MediaCode: result.Titles.Title[i].MediaCode,
                                        MediaDesc: result.Titles.Title[i].MediaDesc,
                                        thumbnail: image_url
                                    }
                                    json_result.push(book);
                                }

                                var final_result = {
                                    info: json_object,
                                    book_info: json_result
                                }


                                return res.json({
                                    respond: final_result,
                                    errors: false
                                });


                            } else {
                                res.statusCode = 200
                                return res.json({
                                    respond: "Empty Respond",
                                    errors: true
                                });
                            }
                        });
                    });
                } else {
                    res.statusCode = 200
                    return res.json({
                        respond: "MIssing Fields",
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

// Get Indidvual Book Information
router.put('/info', function (req, res) {
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
                if (req.body.ISBN != "" && req.body.ISBN != null && req.body.BID != "" && req.body.BID != null) {

                    var args = {
                        APIKey: APIToken,
                        BID: req.body.BID,
                        ISBN: req.body.ISBN
                    };
                    var args1 = {
                        APIKey: APIToken,
                        BID: req.body.BID,
                        ISBN: req.body.ISBN
                    };

                    soap.createClient(url, {
                        wsdl_options: {
                            timeout: 10000
                        }
                    }, function (err, client) {
                        client.GetTitleDetails(args, function (err, result) {
                            soap.createClient(url, {
                                wsdl_options: {
                                    timeout: 10000
                                }
                            }, function (err, client) {
                                client.GetAvailabilityInfo(args1, function (err, result1) {
                                    var image_url = "http://www.syndetics.com/index.aspx?isbn=" + req.body.ISBN + "/mc.gif&client=natlibsingapore"
                                    var url_share = "http://catalogue.nlb.gov.sg/cgi-bin/spydus.exe/ENQ/EXPNOS/BIBENQ?BRN=" + req.body.BID;
                                    var return_json = {
                                        url: url_share,
                                        thumbnail: image_url,
                                        titledetails: result,
                                        availabilityinfo: result1
                                    }
                                    res.send(return_json);
                                })
                            });
                        })
                    });
                } else {
                    return res.json({
                        respond: "MIssing Fields",
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