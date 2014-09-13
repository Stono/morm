'use strict';
var Dal = require('../lib/dal');
var should = require('should');

describe.skip('Data Access', function() {
  var config = {
    user: 'example_user',
    password: 'example_user_password',
    server: '172.19.104.11',
    database: 'example_database'
  };
  it('Should initialise ok', function() {
    var dal = new Dal(config);
    should(dal).not.eql(null);
  });

  it('Should throw an error if an execute fails', function(done) {
    var dal = new Dal(config);
    dal.execute('SELECT * FROM some_table')
      .then(null, function(err) {
        should(err).not.eql(null);
      })
    .then(done);
  }); 

  it('Should not throw an error if the command is OK', function(done) {
    var dal = new Dal(config);
    dal.execute('SELECT * FROM example_table')
      .then(function(rs) {
        should(rs).not.eql(null);
      })
    .then(done);
  }); 

});
