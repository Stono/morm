'use strict';
var _ = require('lodash');

var enforceValue = function(name, message) {
  if(!name) {
    throw new Error(message);
  }
};

var Model = function(opts) {
  enforceValue(opts, 'You must initialise a model with the request parameters: table');  
  enforceValue(opts.table, 'You must initialise a model with the table option');
  enforceValue(opts.identity, 'You must initialise a model with the id option');
 
  return function(item) {
    var original = _.clone(item);
    item._meta = {};
    item._meta.modified = function() {
      var sample = _.clone(item);
      delete sample._meta;
      return !_.isEqual(sample, original);
    };

    item._meta = Object.freeze(item._meta);
    return item;
  };
};

module.exports = Model;
