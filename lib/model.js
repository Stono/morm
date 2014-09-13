'use strict';
var _ = require('lodash');
var squel = require('squel');

var enforceValue = function(name, message) {
  if(!name) {
    throw new Error(message);
  }
};

var Model = function(opts) {
  enforceValue(opts, 'You must initialise a model with the request parameters: table');  
  enforceValue(opts.table, 'You must initialise a model with the table option');
  enforceValue(opts.identity, 'You must initialise a model with the id option');

  var items = [];
  var save = function() {
    var insertMe = [];
    var updateMe = [];

    _.forEach(items, function(item) {
      if(item._meta.modified) {
        if(!item._meta.existing) {
          insertMe.push(item);
        } else {
          updateMe.push(item);
        }
      }
    });

    var promise;
   
    // TODO: Far too many clones going on here, need a better
    // way to remove the _meta property from the setFieldsRows
    // perhaps _.map or _.reduce 
    var chainPromise = function(p) {
      if(!promise) {
        promise = p;
        return;
      }
      promise.then(p);
    };

    if(insertMe.length > 0) {
      var inserting = _.cloneDeep(insertMe);
      _.forEach(inserting, function(insertingItem) {
        delete insertingItem._meta;
      });
      var sql = squel.insert()
        .into(opts.table)
        .setFieldsRows(inserting)
        .toString();
      chainPromise(opts.dal.execute(sql).then(function() {
        _.forEach(items, function(item) {
          item._meta.existing = true;
          item._meta.modified = false;
        });
      }));
    }
    if(updateMe.length > 0) {
      _.forEach(updateMe, function(updateItem) {
        if(!updateItem[opts.identity]) {
          throw new Error('A model flagged for update must have an identifier set');
        }
        var updatingItem = _.cloneDeep(updateItem);
        delete updatingItem._meta;
        var sql = squel.update()
          .table(opts.table)
          .setFields(updatingItem)
          .toString();
        chainPromise(opts.dal.execute(sql).then(function() {
          updateItem._meta.modified = false; 
        }));
      });
    }

    return promise;
  };

  var create = function(item, meta) {
    var original = _.clone(item);
    item._meta = {
      existing: false
    };
    item._meta = _.merge(item._meta, meta);
    item._meta.modified = function() {
      var sample = _.clone(item);
      delete sample._meta;
      return !_.isEqual(sample, original);
    };

    items.push(item);
    return item;
  };

  return Object.freeze({
    save: save,
    create: create
  });
};

module.exports = Model;
