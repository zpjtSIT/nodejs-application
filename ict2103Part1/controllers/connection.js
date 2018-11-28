var mysql = require('mysql');

var pool      =    mysql.createPool({
    connectionLimit : 1000,
    connectTimeout  : 60 * 60 * 1000,
    aquireTimeout   : 60 * 60 * 1000,
    timeout         : 60 * 60 * 1000,

    host     : 'rm-gs5py2dcox6x82w4l6o.mysql.singapore.rds.aliyuncs.com',
    user     : 'ict2103group12',
    port     : "3306",
    password : 'cat123!@#',
    database : 'group12'
});    

pool.getConnection(function(err, connection) {
  // connected! (unless `err` is set)
    if(err)
    console.log(err);
  
});

pool.on('error', function(err) {
  console.log(err.code); // 'ER_BAD_DB_ERROR' 
  // https://www.npmjs.com/package/mysql#error-handling
});

module.exports = pool;