var pg = require('pg-promise')(),
    dbConfig = require('./db.conf.json'),
    conString = 'postgres://' + dbConfig.username + ':' + dbConfig.password + '@localhost/' + dbConfig.db + '',
    db = pg(conString),
    migrations = require('./db/migrations.json').migrations,
    userController = require('./users/userController'),
    Promise = require('promise'),
    express = require('express'),
    bodyParser = require('body-parser');

var app = express(),
    server,
    authRoutes = require('./auth');

app.use(bodyParser.json());
app.use('/', authRoutes);

function errorHandler(error) {
  console.log('ERROR', error)
}

function launchServer() {
  return app.listen(8081, function () {

    console.log('Example app listening on port %s', server.address().port);
  });
}

// migrate db
db.tx(function(){
  var promises = [];
  for (var i=0; i<migrations.length; i++) {
    promises.push(this.none(migrations[i]));
  }
  return Promise.all(promises).then(function() {
    console.log('Migrations Complete');
  });
}).then(function(){
  // close the connection to db
  pg.end();
  // seed db

  // start server
  server = launchServer();
}, errorHandler);

