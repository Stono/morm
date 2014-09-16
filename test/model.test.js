'use strict';
var Model = require('../lib/model');
var should = require('should');
var Stubs = require('./stubs');

/*jshint -W068 */
describe('morm Model', function() {

  it('Should initialise ok', function() {
    var model = new Model({
      table: 'example_table',
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
        table: 'example_table'
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
    var myModel = new Model({
      table: 'example_table',
      identity: 'id'
    });
    var myObject = myModel.create({
      column1: 'hi', 
      column2: 'hi again'
    });
    myObject.column1.should.eql('hi');
    myObject.column2.should.eql('hi again');
  });

  it('Should say the model has been modified when it has', function() {
    var myModel = new Model({
      table: 'example_table',
      identity: 'id'
    });
    var myObject = myModel.create({
      column1: 'hi', 
      column2: 'hi again'
    });

    myObject.column2 = 'I have changed';
    myObject._meta.modified().should.eql(true);
  });

  it('Should say the model hasnt been modified when it hasnt', function() {
    var myModel = new Model({
      table: 'example_table',
      identity: 'id'
    });
    var myObject = myModel.create({
      column1: 'hi', 
      column2: 'hi again'
    });
    myObject._meta.modified().should.eql(false);
  });

  describe('Sql generation', function() {
    var dal;
    beforeEach(function(done) {
      setTimeout(function() {
        dal = new Stubs.SqlLiteDal();
        done();
      }, 50);
    });

    it('Should throw an error if a model is flagged for update but has no id', function() {
      (function() {
        var model = new Model({
          table: 'example_table',
          identity: 'id',
          dal: dal
        });
        var item = model.create({
          column1: 'hi', 
          column2: 'hi again'
        }, {
          existing: true
        });

        item.column1 = 'changed';
        model.save();
      }).should.throw('A model flagged for update must have an identifier set');
    });

    describe('Inserting', function() {
      it('Should build a single insert statement for a new model', function(done) {
        var myModel = new Model({
          table: 'example_table',
          identity: 'id',
          dal: dal
        });
        myModel.create({
          column1: 'hi', 
          column2: 'hi again'
        });

        myModel.save().then(function() {
          dal.executed.length.should.eql(2);
          dal.executed[0].should.match(/^INSERT INTO example_table \(column1, column2\) VALUES \([^\(\)]*\)$/i);
          dal.executed[1].should.match(/^SELECT last_insert_row().*$/i);
          done();
        });
      });

      it('Should be flagged as an existing item after its been inserted', function(done) {
        var myModel = new Model({
          table: 'example_table',
          identity: 'id',
          dal: dal
        });
        var item = myModel.create({
          column1: 'hi', 
          column2: 'hi again'
        });

        myModel.save().then(function() {
          item._meta.existing.should.eql(true);
          done();
        });
      });

      it('Should set the id property on a model after an insert', function(done) {
        var myModel = new Model({
          table: 'example_table',
          identity: 'id',
          dal: dal
        });
        var item = myModel.create({
          column1: 'hi', 
          column2: 'hi again'
        });

        myModel.save().then(function() {
          item.id.should.not.eql(null);
          done();
        });
      });

      it('Should set the id property on a model after multiple inserts', function(done) {
        var myModel = new Model({
          table: 'example_table',
          identity: 'id',
          dal: dal
        });
        var item = myModel.create({
          column1: 'hi', 
          column2: 'hi again'
        });
        var item2 = myModel.create({
          column1: 'hi', 
          column2: 'hi again'
        });

        myModel.save().then(function() {
          item.id.should.not.eql(null);
          item2.id.should.not.eql(null);
          done();
        });
      });

      it('Should do a bulk insert if requested to do so', function(done) {
        var myModel = new Model({
          table: 'example_table',
          identity: 'id',
          dal: dal
        });
        myModel.create({
          column1: 'hi', 
          column2: 'hi again'
        });
        myModel.create({
          column1: 'hi 2', 
          column2: 'hi again 2'
        });

        myModel.save({ bulk: true}).then(function() {
          dal.executed.length.should.eql(1);
          dal.executed[0].should.match(/^INSERT INTO example_table \(column1, column2\) VALUES \([^\(\)]*\), \([^\(\)]*\)$/i);
          done();
        });
      });
    });

    describe('Updating', function() {
      it('Should build an update statement for an existing modified model', function(done) {
        var myModel = new Model({
          table: 'example_table',
          identity: 'id',
          dal: dal
        });
        var item = myModel.create({
          id: 1,
          column1: 'hi', 
          column2: 'hi again'
        }, {
          existing: true
        });

        item.column1 = 'updated';
        myModel.save().then(function() {
          dal.executed.length.should.eql(1);
          dal.executed[0].should.match(/^UPDATE example_table .* WHERE \(id = .*/i);
          done();
        });
      });

      it('Should build a mixture of inserts and updates when applicable', function(done) {
        var myModel = new Model({
          table: 'example_table',
          identity: 'id',
          dal: dal
        });
        var updated = myModel.create({
          id: 1,
          column1: 'hi', 
          column2: 'hi again'
        }, {
          existing: true
        });
        updated.column1 = 'updated';

        myModel.create({
          column1: 'another hi', 
          column2: 'to you'
        });
        myModel.save().then(function() {
          dal.executed.length.should.eql(3);
          dal.executed[0].should.match(/^INSERT INTO example_table \(column1, column2\) VALUES \([^\(\)]*\)$/i);
          dal.executed[1].should.match(/^SELECT last_insert_row().*$/i);
          dal.executed[2].should.match(/^UPDATE example_table .* WHERE \(id = .*/i);
          done();
        });
      });

      it('Should do an update after an insert of the same model', function(done) {
        var myModel = new Model({
          table: 'example_table',
          identity: 'id',
          dal: dal
        });
        var item = myModel.create({
          column1: 'hi', 
          column2: 'hi again'
        });

        myModel.save().then(function() {
          item.column2 = 'updated';
          myModel.save().then(function() {
            dal.executed.length.should.eql(3);
            dal.executed[0].should.match(/^INSERT INTO example_table \(column1, column2\) VALUES \([^\(\)]*\)$/i);
            dal.executed[1].should.match(/^SELECT last_insert_row().*$/i);
            dal.executed[2].should.match(/^UPDATE example_table .* WHERE \(id = .*/i);
            done();
          });
        });
      });

      it('Should not update a model that hasnt been modified', function(done) {
        var myModel = new Model({
          table: 'example_table',
          identity: 'id',
          dal: dal
        });
        myModel.create({
          column1: 'hi', 
          column2: 'hi again'
        });

        myModel.save().then(function() {
          myModel.save().then(function() {
            dal.executed.length.should.eql(2);
            dal.executed[0].should.match(/^INSERT INTO example_table \(column1, column2\) VALUES \([^\(\)]*\)$/i);
            dal.executed[1].should.match(/^SELECT last_insert_row().*$/i);
            done();
          });
        });
      });
    });

    describe('Reading', function() {
      it('Should build a valid query statement', function(done) {

        var myModel = new Model({
          table: 'example_table',
          identity: 'id',
          dal: dal
        });
        var model = myModel.create({
          column1: 'hi', 
          column2: 'hi again - just inserted'
        });

        myModel.save().then(function() {
          myModel.clear();
          myModel.select()
            .where('id = \'' + model.id + '\'')
            .go()
            .then(function(results) {
              dal.executed[2].should.match(/^SELECT \* FROM example_table WHERE.*$/i);
              results.length.should.eql(1);
              results[0].column2.should.eql('hi again - just inserted');
            });
          done();
        });
      });
    });

    describe('Deleting' , function() {
      it('Should build a valid delete statement', function(done) {

        var myModel = new Model({
          table: 'example_table',
          identity: 'id',
          dal: dal
        });
        var model = myModel.create({
          column1: 'hi', 
          column2: 'hi again - just inserted'
        });

        myModel.save().then(function() {
          myModel.clear();
          myModel.delete()
            .where('id = \'' + model.id + '\'')
            .go()
            .then(function() {
              dal.executed[2].should.match(/^DELETE FROM example_table WHERE .*$/i);
              myModel.select()
                .where('id = \'' + model.id + '\'')
                .go()
                .then(function(results) {
                  results.length.should.eql(0);
                  done();
                });
            });
        });
      });
    });

  });

});
