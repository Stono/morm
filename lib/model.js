'use strict';
var _ = require('lodash');
var squel = require('squel');
var when = require('when');
var sequence = require('when/sequence');

var enforceValue = function(name, message) {
  if(!name) {
    throw new Error(message);
  }
};

var defaultValue = function(obj, val) {
  return obj || val;
};

var Model = function(opts) {
  enforceValue(opts, 'You must initialise a model with the request parameters: table');  
  enforceValue(opts.table, 'You must initialise a model with the table option');
  enforceValue(opts.identity, 'You must initialise a model with the id option');

  var items = [];
  var save = function(saveOpts) {
    saveOpts = defaultValue(saveOpts, {});    

    var insertMe =_.filter(items, function(item) {
      return item._meta.existing === false;
    });

    var updateMe =_.filter(items, function(item) {
      return item._meta.modified() === true;
    });

    var trim = function(item) {
      delete item._meta;
      delete item[opts.identity];
    };

    // TODO: Far too many clones going on here, need a better
    // way to remove the _meta property from the setFieldsRows
    // perhaps _.map or _.reduce
    // At the moment this will insert one by one and get the identity
    // for ORM purposes, however it's much quicker to bulk insert
    // but then theres no identity.  Perhaps a save {bulk: true} is needed?
    var delegates = [];
    var chainPromise = function(delegate) {
      delegates.push(delegate);
    };

    var generateBulkInsert = function() {
      var insertingItems = _.cloneDeep(insertMe);
      _.forEach(insertingItems, function(insertingItem) {
        trim(insertingItem);
      });
      var sql = squel.insert()
        .into(opts.table)
        .setFieldsRows(insertingItems)
        .toString();
      var insertPromise = function() {
        return when.promise(function(resolve) {
          return opts.dal.execute(sql).then(function() {
            resolve();
          });
        });
      };
      chainPromise(insertPromise);
    };

    var generateOrmInsert = function() {
      _.forEach(insertMe, function(insertMeItem) {
        var insertingItem = _.cloneDeep(insertMeItem);
        trim(insertingItem);
        var sql = squel.insert()
          .into(opts.table)
          .setFields(insertingItem)
          .toString();
        var insertPromise = function() {
          return when.promise(function(resolve) {
            return opts.dal.execute(sql).then(function() {
              return opts.dal.getLastInsertedId(opts.table)
                .then(function(id) {
                  insertMeItem._meta.original = insertingItem;
                  insertMeItem._meta.existing = true;
                  insertMeItem[opts.identity] = id;
                  resolve();
                });
            });
          });
        };
        chainPromise(insertPromise);
      });
    };

    var generateOrmUpdate = function() {
      _.forEach(updateMe, function(updateMeItem) {
        if(!updateMeItem[opts.identity]) {
          throw new Error('A model flagged for update must have an identifier set');
        }
        var updatingItem = _.cloneDeep(updateMeItem);
        var id = updateMeItem[opts.identity];
        trim(updatingItem);
        var sql = squel.update()
          .table(opts.table)
          .setFields(updatingItem)
          .where(opts.identity + ' = ' + id)
          .toString();
        var updatePromise = function() {
          return when.promise(function(resolve) {
            return opts.dal.execute(sql).then(function() {
              updateMeItem._meta.original = updatingItem;
              resolve();
            });
          });
        };
        chainPromise(updatePromise);
      });
    };

    if(saveOpts.bulk) {
      generateBulkInsert();
    } else {
      generateOrmInsert();
    }

    generateOrmUpdate();

    var promise = sequence(delegates);
    return promise;
  };

  var create = function(item, meta) {
    item._meta = {
      existing: false,
      original: _.clone(item)
    };
    item._meta = _.merge(item._meta, meta);
    item._meta.modified = function() {
      var sample = _.clone(item);
      // Sanitise the sample object
      delete sample._meta;
      delete sample[opts.identity];
      // Remove the identity from the meta
      delete item._meta.original[opts.identity];
      // Compare the two to find out if they've changed
      return !_.isEqual(sample, item._meta.original);
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
