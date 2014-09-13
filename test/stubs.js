'use strict';
var when = require('when');
var sqlite3 = require('sqlite3').verbose();

var SqlLiteDal = function() {
  var db = new sqlite3.Database(':memory:');

  (function() {
    db.serialize(function() {
      db.run('CREATE TABLE example_table (id INTEGER PRIMARY KEY ASC, column1 TEXT, column2 TEXT)');
    });
  })();

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

  return {
    execute: execute
  };
};

module.exports = {
  SqlLiteDal: SqlLiteDal
};
