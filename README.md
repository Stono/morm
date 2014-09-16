# morm
A lightweight MSSQL ORM for node.js

Well I use the term ORM loosely, it's currently more of a facade which makes interacting with MSSQL from node a little less painful.  More ORM features are coming soon - but for now check the tests for implemented stuff.

WARNING: This module is far from complete, i'd probably not use it if I were you.  However if you do use it, please feel free to submit issues or even contribute yourself.

## TODO
 - Need to improve how I return the identity from an insert statement in SQL.. it all feels a bit hacky right now and I should be using @@IDENTITY instead - just makes it harder to test as sql lite doesnt support that.  But hey, it works.
 - Implemented querying of models to return ORM tracked objects.
 - One to Many / Many to Many relationships etc.
 - Change the way we're using sqlite for the tests - as we're not actually testing lib/dal in any way.

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
var morm = require('morm');
var config = {
  user: 'example_user',
  password: 'example_user_password',
  server: '127.0.0.1',
  database: 'example_database'
};

// Or if you're using Sql Azure:
var config = {
  user: 'example_user',
  password: 'example_user_password',
  server: '127.0.0.1',
  database: 'example_database',
  options: {
    encrypt: true
  }
};

var dal = new morm.Dal(config);

var model = new morm.Model({
  table: 'example_table',
  identity: 'id',
  dal: dal
});

var row1 = model.create({
  column1: 'col1',
  column2: 'col2'
});

model.save()
.then(function() {
  console.log(row1.id);
});
```

This would allow you to update an existing object without first reading it from the database.
```javascript
var model = new morm.Model({
  table: 'example_table',
  identity: 'id',
  dal: dal
});

model.create({
  id: 1,
  column1: 'col1',
  column2: 'col2'
}, {
  existing: true
});

model.save();
```

This will allow you to do a bulk insert of rows rather than individual update statements.  
NOTE: By doing this you'll skip the post insert ID lookup which means you wont have tracking of these objects - but obviously its a lot faster.
```javascript
var model = new morm.Model({
  table: 'example_table',
  identity: 'id',
  dal: dal
});

model.create({
  column1: 'col1',
  column2: 'col2'
});

model.create({
  column1: 'col1',
  column2: 'col2'
});

model.save({ bulk: true });
```

This will allow you to read a bunch of objects and return tracked instances of them which can be modified and updated.  Please note the syntax here is using [squel]https://github.com/hiddentao/squel as that's what i'm using under the hood to generate the SQL.
```javascript
var model = new morm.Model({
  table: 'example_table',
  identity: 'id',
  dal: dal
});
model.select()
  .where('id > 1')
  .where('id < 10')
  .go()
  .then(function(results) {
    console.log(results);
  });
```

This will allow you to delete a bunch of objects.
```javascript
var model = new morm.Model({
  table: 'example_table',
  identity: 'id',
  dal: dal
});
model.delete()
  .where('id > 1')
  .where('id < 10')
  .go()
  .then(function() {
    console.log('done!');
  });

```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
 - 0.1.0 Stuck onto NPM just to get the ball rolling
 - 0.1.1 Fixed an issue with updates
 - 0.1.2 Huge fixes with the promises for sync operation of the insert and update tasks.
 - 0.1.3 Implemented the mssql last inserted id lookup, starting to become an orm...
 - 0.1.4 Implemented bulk inserts
 - 0.1.5 Cleaning up and performance improvements in the model.
 - 0.1.6 Added read and delete.

## License
Copyright (c) 2014 Karl Stoney  
Licensed under the MIT license.
