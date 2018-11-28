 var express = require('express');
 var router = express.Router();
 var db = require('./connection.js'); // db is pool
 var common = require('./common.js');
 var fs = require("fs");
 //retrieve student information based on token
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
           conn.collection("studentWithSecureLogin").find({
             "secure_login_session_token": token
           }).toArray(function(err, rows, fields) {
             if (err) {
               res.statusCode = 200
               return res.json({
                 respond: "Database ran into some problem",
                 errors: true
               });
             } else {
               var jsonObject = {};
               if (rows.length) {
                 for (var i = 0; i < rows.length; i++) {
                   jsonObject = {
                     studentname: rows[i].student_name,
                     studentmatrics: rows[i].student_matrics,
                     studentphone: rows[i].student_phone,
                     studentdob: rows[i].student_dob,
                     studentaddres: rows[i].student_address,
                     studentcourse: rows[i].student_course,
                     studentimage: rows[i].student_image,
                   }
                 }
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

 // Update student details for mobile
 router.put('/', function(req, res) {
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
         if (req.body.phone != "" && req.body.phone != null && req.body.address != "" && req.body.address != null) {
           var phone = req.body.phone;
           var address = req.body.address;

           db.establishConnection(function(conn) {
             conn.collection("studentWithSecureLogin").find({
               "secure_login_session_token": token
             }, {
               "secure_login_ID": "$secure_login_ID",
               "secure_login_password": "$secure_login_password"
             }).toArray(function(err, rows, fields) {
               if (err) {
                 res.statusCode = 200;
                 return res.json({
                   respond: "Database error",
                   errors: true
                 });
               } else {
                 if (rows.length) {
                   var secureid = rows[0].secure_login_ID;
                   var updatequery1 = {
                     $set: {
                       student_phone: phone,
                       student_address: address
                     }
                   };
                   var updatequery2 = {
                     secure_login_ID: secureid
                   };

                   conn.collection("studentWithSecureLogin").updateOne(updatequery2, updatequery1, function(err, result) {
                     if (err) {
                       res.statusCode = 200;
                       return res.json({
                         respond: "Database error",
                         error: true
                       });
                     } else {
                       return res.json({
                         respond: "Successfully Update Student Particulars",
                         errors: false
                       });
                     }
                   });

                 } else {
                   res.statusCode = 200;
                   return res.json({
                     respond: "Invalid app Token or username",
                     error: true
                   });
                 }
               }
             });
           });
         } else {
           res.statusCode = 200;
           return res.json({
             respond: "Missing Fields",
             error: true
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

 router.get('/studentlist/noaccount', function(req, res) {

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
           conn.collection("studentWithSecureLogin").find({
             student_ID: {
               $exists: true
             },
             secure_login_email: {
               $exists: false
             }
           }).toArray(function(err, rows, fields) {
             if (err) {
               res.statusCode = 200
               return res.json({
                 respond: "Database ran into some problem",
                 errors: true
               });
             } else {
               var jsonArray = [];
               if (rows.length) {
                 console.log("Getting student")
                 for (var i = 0; i < rows.length; i++) {
                   if (rows[i].student_active === 0 && rows[i].secure_login_ID >= 0) {

                     var studentimage = "";

                     if (rows[i].student_image) {
                       studentimage = rows[i].student_image;

                     } else {
                       studentimage = "/image/student/nopic.jpg";
                     }
                     var jsonObject = {
                       studentid: rows[i].student_ID,
                       studentname: rows[i].student_name,
                       studentmatrics: rows[i].student_matrics,
                       studentphone: rows[i].student_phone,
                       studentdob: rows[i].student_dob,
                       studentaddress: rows[i].student_address,
                       studentimage: studentimage,
                       studentcourse: rows[i].course_ID
                     }
                     console.log(rows[i].student_ID)
                     jsonArray.push(jsonObject);
                   }
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

 //retrieve all student 
 router.get('/admin', function(req, res) {

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
         db.establishConnection(function(conn) {
           conn.collection("studentWithSecureLogin").find({
             student_ID: {
               $exists: true
             }
           }).toArray(function(err, rows, fields) {
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
                     accountid: rows[i].secure_login_ID,
                     studentname: rows[i].student_name,
                     studentmatrics: rows[i].student_matrics,
                     studentphone: rows[i].student_phone,
                     studentdob: rows[i].student_dob,
                     studentaddress: rows[i].student_address,
                     studentcourse: rows[i].course_ID,
                     studentimage: rows[i].student_image,
                     studentactive: rows[i].student_active,
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

 //Get Student by id
 router.get('/admin/:id', function(req, res) {
   var id = req.params.id;
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

         db.establishConnection(function(conn) {
           conn.collection("studentWithSecureLogin").find({
             "student_ID": req.params.id
           }).toArray(function(err, rows, fields) {
             if (err) {
               res.statusCode = 200
               return res.json({
                 respond: "Database ran into some problem",
                 errors: true
               });
             } else {
               var jsonObject = {};
               if (rows.length) {
                 for (var i = 0; i < rows.length; i++) {
                   var jsonObject = {
                     accountid: rows[i].secure_login_ID,
                     studentname: rows[i].student_name,
                     studentmatrics: rows[i].student_matrics,
                     studentphone: rows[i].student_phone,
                     studentdob: rows[i].student_dob,
                     studentaddress: rows[i].student_address,
                     studentcourse: rows[i].course_ID,
                     studentimage: rows[i].student_image,
                     studentactive: rows[i].student_active,
                   }
                 }
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

 //Create new student
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
         if (req.body.name != "" && req.body.name != null && req.body.matrics != "" && req.body.matrics != null && req.body.phone != "" && req.body.phone != null && req.body.dob != "" && req.body.dob != null && req.body.address != "" && req.body.address != null && req.body.courseid != "" && req.body.courseid != null) {
           var paremeters = {
             student_matrics: req.body.matrics
           };
           db.establishConnection(function(conn) {
             conn.collection("studentWithSecureLogin").find({
               "student_matrics": req.body.matrics
             }).toArray(function(err, rows, fields) {
               if (err) {
                 res.statusCode = 200;
                 return res.json({
                   respond: "Creating Account Failed , Database Error",
                   errors: true
                 });
               } else {
                 if (rows.length) {
                   res.statusCode = 200;
                   return res.json({
                     respond: "Student Already Existed ",
                     errors: true
                   });
                 } else {
                   var filename = "";
                   if (req.body.image !== "" && req.body.image != null) {
                     var image = req.body.image;
                     var base64Data = image.replace(/^data:image\/(png|gif|jpeg);base64,/, '');
                     filename = "/image/student/" + new Date().getTime() + ".png";
                     var filepathupload = "public" + filename;
                     fs.writeFile(filepathupload, new Buffer(base64Data, "base64"), function(err) {
                       if (err) console.log(err);
                     });
                   }
                   var studentID;
                   conn.collection("studentWithSecureLogin").find({}, {
                     student_ID: "$student_ID"
                   }).sort({
                     student_ID: -1
                   }).limit(1).toArray(function(err, rows, fields) {
                     if (rows.length == 0) {
                       studentID = 0;
                     }
                     if (rows.length) {
                       if (rows[0].student_ID > 0) {
                         studentID = parseInt(rows[0].student_ID);
                         console.log("pass");
                       } else {
                         studentID = 0;
                         console.log("empty");
                       }
                       console.log(studentID);
                     }
                     var createstudent_query = {};
                     if (req.body.image !== "" && req.body.image != null) {
                       createstudent_query = {
                         student_ID: studentID + 1,
                         student_name: req.body.name,
                         student_matrics: parseInt(req.body.matrics),
                         student_phone: req.body.phone,
                         student_dob: req.body.dob,
                         student_address: req.body.address,
                         student_image: filename,
                         secure_login_ID: 0,
                         course_ID: parseInt(req.body.courseid),
                         student_active: parseInt(req.body.active)
                       };
                     } else {
                       createstudent_query = {
                         student_ID: studentID + 1,
                         student_name: req.body.name,
                         student_matrics: parseInt(req.body.matrics),
                         student_phone: req.body.phone,
                         student_dob: req.body.dob,
                         student_address: req.body.address,
                         secure_login_ID: 0,
                         course_ID: parseInt(req.body.courseid),
                         student_active: parseInt(req.body.active)
                       };
                     }
                     conn.collection("studentWithSecureLogin").insertOne(createstudent_query, function(err, result) {
                       if (err) {
                         console.log(err)
                         res.statusCode = 200;
                         return res.json({
                           respond: "Creating Student Failed , Database Error",
                           errors: true
                         });
                       } else {
                         if (result) {
                           return res.json({
                             success: "Successfully Created Student",
                             errors: false
                           });
                         }
                       }
                     });
                   });

                 }
               }
             });
           });
         } else {
           res.statusCode = 200
           return res.json({
             respond: "Missing Fieldsa",
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

 // Update student
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
     common.checksessionadmin(db, token, function(returnValue) {
       if (returnValue) {
         console.log(id);
         common.checkstudentbymatrics(db, id, function(matrics_true) {
           console.log(matrics_true)

           if (matrics_true) {
             if (req.body.name != "" && req.body.name != null && req.body.matrics != "" && req.body.matrics != null && req.body.phone != "" && req.body.phone != null && req.body.dob != "" && req.body.dob != null && req.body.address != "" && req.body.address != null && req.body.courseid != "" && req.body.courseid != null) {
               var phone = req.body.phone;
               var address = req.body.address;
               var filename = "";
               if (req.body.image !== "" && req.body.image != null) {
                 var image = req.body.image;
                 var base64Data = image.replace(/^data:image\/(png|gif|jpeg);base64,/, '');
                 filename = "/image/student/" + new Date().getTime() + ".png";
                 var filepathupload = "public" + filename;
                 fs.writeFile(filepathupload, new Buffer(base64Data, "base64"), function(err) {
                   if (err) console.log(err);
                 });
               }
               var paremeters1 = {
                 secure_login_session_token: token
               };
               var updatequery1 = {
                 $set: {
                   student_name: req.body.name,
                   student_matrics: parseInt(req.body.matrics),
                   student_phone: parseInt(req.body.phone),
                   student_dob: req.body.dob,
                   student_address: req.body.address,
                   student_image: filename,
                   secure_login_ID: parseInt(req.body.accountid),
                   course_ID: parseInt(req.body.courseid),
                   student_active: parseInt(req.body.active)
                 }
               };
               var updatequery2 = {
                 student_matrics: parseInt(id)
               }
               db.establishConnection(function(conn) {
                 conn.collection("studentWithSecureLogin").updateOne(updatequery2, updatequery1, function(err, result) {
                   if (err) {
                     res.statusCode = 200;
                     return res.json({
                       respond: "Database error",
                       error: true
                     });
                   } else {
                     return res.json({
                       respond: "Successfully Update Student Particulars",
                       errors: false
                     });
                   }
                 });
               });
             } else {
               res.statusCode = 200;
               return res.json({
                 respond: "Missing Fields",
                 error: true
               });
             }
           } else {
             res.statusCode = 200
             return res.json({
               respond: "Student Id Not Found",
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

router.get('/studentlist', function(req, res) {

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
         db.establishConnection(function(conn){
           conn.collection("studentWithSecureLogin").find({secure_login_admin:0}).toArray(function(err, rows, fields){
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
                 if (rows[i].student_active === 0 && rows[i].secure_login_ID >= 1) {
                   
                    var studentimage ="";
                 
                 if(rows[i].student_image){
                      studentimage = rows[i].student_image;
                     
                   } else {
                     studentimage = "/image/student/nopic.jpg";
                   }
                   
                   var jsonObject = {
                     accountid: rows[i].secure_login_ID,
                     studentid : rows[i].student_ID,
                     studentname: rows[i].student_name,
                     studentmatrics: rows[i].student_matrics,
                     studentimage: studentimage
                   }
                   jsonArray.push(jsonObject);
                 }
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
 module.exports = router;