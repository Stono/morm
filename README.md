# morm
A lightweight MSSQL orm for node.js
Currently does no ORM!
Very much under development

## Getting Started
Right now, you can't, it's not complete...
When it's in a workable state - it'll go on npm.

## Documentation
See the tests for implemented stuff!! However below is an example of a simple insert.
The nice thing about this is the library will bulk insert, rather than row by row.

## Examples
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

var row2 = model.create({
  column1: 'hi',
  column2: 'another row'
});

model.save();
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2014 Karl Stoney  
Licensed under the MIT license.
