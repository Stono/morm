# morm
A lightweight MSSQL ORM for node.js

Currently does no ORM!  It's more of a convenience facade for mssql with node, but that will change.

WARNING:  I strongly suggest against using this module right now - give it a week or two.  However if you insist, someone needs to check that getLastInsertedId() in lib/dal.js works with sql server!

## Getting Started
```javascript
npm install morm
```

## Documentation
See the tests for currently implemented stuff.

## Examples
Insert a row into a table:
```javascript
var config = {
  user: 'example_user',
  password: 'example_user_password',
  server: '127.0.0.1',
  database: 'example_database'
};
var dal = new Dal(config);

var model = new Model({
  table: 'example_table',
  identity: 'id',
  dal: dal
});

var row1 = model.create({
  column1: 'col1',
  column2: 'col2'
});

model.save();
```

This would allow you to update an existing row:
```javascript
var model = new Model({
  table: 'example_table',
  identity: 'id',
  dal: dal
});

var row1 = model.create({
  id: 1,
  column1: 'col1',
  column2: 'col2'
}, {
  existing: true
});

model.save();
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
 - 0.1.0 Stuck onto NPM just to get the ball rolling
 - 0.1.1 Fixed an issue with updates

## License
Copyright (c) 2014 Karl Stoney  
Licensed under the MIT license.
