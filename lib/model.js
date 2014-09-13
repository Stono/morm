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

    var temp = _.cloneDeep(items);
    _.forEach(temp, function(item) {
      if(item._meta.modified) {
        if(!item._meta.existing) {
          delete item._meta;
          insertMe.push(item);
        } else {
          delete item._meta;
          updateMe.push(item);
        }
      }
    });

    var promise;
    
    var chainPromise = function(p) {
      if(!promise) {
        promise = p;
        return;
      }
      promise.then(p);
    };

    if(insertMe.length > 0) {
      var sql = squel.insert()
        .into(opts.table)
        .setFieldsRows(insertMe)
        .toString();
      chainPromise(opts.dal.execute(sql));
    }
    if(updateMe.length > 0) {
      _.forEach(updateMe, function(updateItem) {
        var sql = squel.update()
          .table(opts.table)
          .setFields(updateItem)
          .toString();
        chainPromise(opts.dal.execute(sql));
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

    item._meta = Object.freeze(item._meta);
    items.push(item);
    return item;
  };

  return Object.freeze({
    save: save,
    create: create
  });
};

module.exports = Model;
