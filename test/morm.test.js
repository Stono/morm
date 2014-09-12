'use strict';
var Model = require('../lib/model');
var should = require('should');
/*jshint -W068 */
describe('morm model', function() {

  it('Should initialise ok', function() {
    var model = new Model({
      table: 'morm_test',
      identity: 'id'
    });
    model.should.not.eql(null);
  });

  it('Should require an options object to be passed', function() {
    (function() {
      var model = new Model();
      should(model).eql(null);
    }).should.throw('You must initialise a model with the request parameters: table');
  });

  it('Should require the id parameter', function() {
    (function() {
      var model = new Model({
        table: 'morm_test'
      });
      should(model).eql(null);
    }).should.throw('You must initialise a model with the id option');
  });

  it('Should require the table name parameter', function() {
    (function() {
      var model = new Model({
        identity: 'id'
      });
      should(model).eql(null);
    }).should.throw('You must initialise a model with the table option');
  });

  it('Should be able to create an instance of my model with a single data object', function() {
    var MyModel = new Model({
      table: 'morm_test',
      identity: 'id'
    });
    var myObject = new MyModel({
      column1: 'hi', 
      column2: 'hi again'
    });
    myObject.column1.should.eql('hi');
    myObject.column2.should.eql('hi again');
  });

  it('Should say the model has been modified when it has', function() {
    var MyModel = new Model({
      table: 'morm_test',
      identity: 'id'
    });
    var myObject = new MyModel({
      column1: 'hi', 
      column2: 'hi again'
    });

    myObject.column2 = 'I have changed';
    myObject._meta.modified().should.eql(true);
  });

  it('Should say the model hasnt been modified when it hasnt', function() {
    var MyModel = new Model({
      table: 'morm_test',
      identity: 'id'
    });
    var myObject = new MyModel({
      column1: 'hi', 
      column2: 'hi again'
    });
    myObject._meta.modified().should.eql(false);
  });

});
