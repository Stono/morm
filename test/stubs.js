'use strict';
var Dal = require('../lib/dal');

var LoggingDal = function() {
  var db = new Dal(':memory:', 'sqlite3');
  var executed = [];

  (function() {
      db.execute('CREATE TABLE example_table (id INTEGER PRIMARY KEY ASC, column1 TEXT, column2 TEXT)');
  })();

  var execute = function(sql) {
    executed.push(sql);
    return db.execute(sql);
  };

  var getLastInsertedId = function() {
    executed.push('SELECT last_insert_row()');
    return db.getLastInsertedId();
  };

  return {
    execute: execute,
    executed: executed,
    getLastInsertedId: getLastInsertedId
  };
};

module.exports = {
  LoggingDal: LoggingDal
};
