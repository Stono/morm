var when = require('when');

var p;
var chain = function(pc) {
  if(p) {
    p.then(pc);
  } else {
    p = pc;
  }
};
var p1 = function() {
  return when.promise(function(resolve) {
    console.log('p1');
    resolve();
  });
}
var p2 = function() {
  return when.promise(function(resolve) {
    return p1().then(function() {
      console.log('p2');
      resolve();
    });
  });
}
var p3 = function() {
  return when.promise(function(resolve) {
    console.log('p3');
    resolve();
  });
};

p2().then(p3);
