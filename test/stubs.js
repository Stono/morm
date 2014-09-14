'use strict';
var when = require('when');
var sqlite3 = require('sqlite3').verbose();

var SqlLiteDal = function() {
  var db = new sqlite3.Database(':memory:');
  var executed = [];

  (function() {
    db.serialize(function() {
      db.run('CREATE TABLE example_table (id INTEGER PRIMARY KEY ASC, column1 TEXT, column2 TEXT)');
    });
  })();

  var execute = function(sql) {
    return when.promise(function(resolve, reject) {
      db.serialize(function() {
        db.all(sql, function(err, rows) {
          executed.push(sql);
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
    executed: executed,
    getLastInsertedId: getLastInsertedId
  };
};

module.exports = {
  SqlLiteDal: SqlLiteDal
};
