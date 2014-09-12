'use strict';
var Dal = require('../lib/dal');
var Model = require('../lib/model');

describe('Acceptance', function() {
  var config = {
    user: 'example_user',
    password: 'example_user_password',
    server: '172.19.104.11',
    database: 'example_database'
  };
  var dal = new Dal(config);

  beforeEach(function(done) {
    dal.execute('TRUNCATE TABLE example_table').then(done);
  });

  it('Should allow me to insert a row', function(done) {
    var model = new Model({
      table: 'example_table',
      identity: 'id',
      dal: dal
    });
    model.create({
      column1: 'col1',
      column2: 'col2'
    });

    model.save()
      .then(function() {
        dal.execute('SELECT * FROM example_table')
          .then(function(rs) {
            rs[0].column1.should.eql('col1');
            rs[0].column2.should.eql('col2');
            done();
          }).then(null, function(err) {
            console.log(err);
          });
      });
  });

});
