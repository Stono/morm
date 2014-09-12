'use strict';
var mssql = require('mssql');
var when = require('when');

var Dal = function(opts) {
  var db;

  var getDbConnection = function() {
    return when.promise(function(resolve, reject) {
      if(db && db.connected) {
        resolve(db);
      } else {
        db = new mssql.Connection(opts, function(err) {
          if(err) {
            reject(err);
            return;
          }
          resolve(db);
        });
      }
    });
  };

  var execute = function(sql) {
    return getDbConnection()
      .then(function(connection) {
        return when.promise(function(resolve, reject) {
          var request = new mssql.Request(connection);
          request.query(sql, function(err, recordset) {
            if(err) {
              reject(err);
            } else {
              resolve(recordset);
            }
          });
        });
      });
  };

  return Object.freeze({
    execute: execute
  });
};

module.exports = Dal;
