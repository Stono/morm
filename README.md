# morm
A lightweight MSSQL ORM for node.js

Currently does no ORM!  It's more of a convenience facade for mssql with node, but that will change.  It is also currently WRITE ONLY.

WARNING:  I strongly suggest against using this module right now - give it a week or two.  However if you insist, someone needs to check that getLastInsertedId() in lib/dal.js works with sql server!

## TODO
 - Need to improve how I return the identity from an insert statement in SQL.. it all feels a bit hacky right now and I should be using @@IDENTITY instead.
 - Implement a model.save({bulk: true}) which will do a bulk insert rather than a row by row returning the ID.  Ultimately the models wouldnt then be controllable in an ORM manner but that is fine for some situations.

## Getting Started
```javascript
npm install morm
```

## Documentation
See the tests for currently implemented stuff.

## Examples
Insert a row into a table:
After it's been inserted it is being "tracked" and you can subsequently modify it and re-save and an update will be performed.
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

This would allow you to update an existing object without first reading it from the database.
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
 - 0.1.2 Huge fixes with the promises for sync operation of the insert and update tasks.

## License
Copyright (c) 2014 Karl Stoney  
Licensed under the MIT license.
