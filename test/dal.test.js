'use strict';
var Dal = require('./stubs').LoggingDal;
var should = require('should');

describe('Data Access', function() {
  it('Should initialise ok', function() {
    var dal = new Dal();
    should(dal).not.eql(null);
  });

  it('Should throw an error if an execute fails', function(done) {
    var dal = new Dal();
    dal.execute('SELECT * FROM some_table')
      .then(null, function(err) {
        should(err).not.eql(null);
      })
    .then(done);
  }); 

  it('Should not throw an error if the command is OK', function(done) {
    var dal = new Dal();
    dal.execute('SELECT * FROM example_table')
      .then(function(rs) {
        should(rs).not.eql(null);
      })
    .then(done);
  }); 

});
