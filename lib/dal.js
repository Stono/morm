'use strict';
var mssql = require('mssql');
var when = require('when');

var Mssql = function(opts) {
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

  var getLastInsertedId = function(table) {
    return when.promise(function(resolve) {
      execute('SELECT IDENT_CURRENT(\'' + table + '\')')
      .then(function(rs) {
        resolve(rs[0][Object.keys(rs[0])[0]]);
      });
    });
  };

  return Object.freeze({
    execute: execute,
    getLastInsertedId: getLastInsertedId
  });
};

var SqlLite3 = function(filename) {
  var sqlite3 = require('sqlite3').verbose();
  var db = new sqlite3.Database(filename);

  var execute = function(sql) {
    return when.promise(function(resolve, reject) {
      db.serialize(function() {
        db.all(sql, function(err, rows) {
          if(err) {
            reject(err);
            return;
          } else {
            resolve(rows);
          }
        }); 
      });
    });
  };

  var getLastInsertedId = function() {
    return when.promise(function(resolve) {
      execute('SELECT last_insert_rowid()')
        .then(function(rs) {
          resolve(rs[0]['last_insert_rowid()']);
        });
    });
  };

  return {
    execute: execute,
    getLastInsertedId: getLastInsertedId
  };
};

var Dal = function(opts, driver) {
  driver = driver || 'mssql';
  var drivers = {
    mssql: new Mssql(opts),
    sqlite3: new SqlLite3(opts)
  };
  return drivers[driver];
};

module.exports = Dal;
