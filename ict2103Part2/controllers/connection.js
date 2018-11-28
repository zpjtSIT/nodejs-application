var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

//var DATABASEUSERNAME = "ict2103";
//var DATABASEPASSWORD = "cat123";
//var DATABASEHOST = "ds141613.mlab.com";
var DATABASEUSERNAME = "root";
var DATABASEPASSWORD = "cat123456!";
var DATABASEHOST  =  'dds-gs57708942855bd41133-pub.mongodb.singapore.rds.aliyuncs.com:3717,dds-gs57708942855bd42248-pub.mongodb.singapore.rds.aliyuncs.com'
// Connection URL
const url = 'mongodb://' + DATABASEUSERNAME + ':' + DATABASEPASSWORD + '@' + DATABASEHOST + ':3717' + '/admin?replicaSet=mgset-300212889';

var connection = [];
// Create the database connection
establishConnection = function(callback) {

  MongoClient.connect(url, {
      poolSize: 10
    }, function(err, db) {
      assert.equal(null, err);

      connection = db
      if (typeof callback === 'function' && callback)
        callback(connection)
    }
  )
}

function getconnection() {
  return connection
}

module.exports = {
  establishConnection: establishConnection,
  getconnection: getconnection
}