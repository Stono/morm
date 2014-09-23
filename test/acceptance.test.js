'use strict';
var Dal = require('./stubs').LoggingDal;
var Model = require('../lib/model');

describe('Acceptance', function() {
  var dal = new Dal();

  beforeEach(function(done) {
    dal.execute('DELETE FROM example_table').then(function() {
      done(); 
    });
  });

  it('Should allow me to insert a row', function(done) {
    var model = new Model({
      table: 'example_table',
      identity: 'id',
      dal: dal
    });
    var item = model.create({
      column1: 'col1',
      column2: 'col2'
    });

    model.save()
      .then(function() {
        item.id.should.not.eql(null);
        dal.execute('SELECT * FROM example_table')
          .then(function(rs) {
            rs.length.should.eql(1);
            rs[0].column1.should.eql('col1');
            rs[0].column2.should.eql('col2');
            done();
          }).then(null, function(err) {
            console.log(err);
          });
      });
  });

});
