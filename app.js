var pg = require('pg'),
    dbConfig = require('./db.conf.json'),
    conString = 'postgres://' + dbConfig.username + ':' + dbConfig.password + '@localhost/' + dbConfig.db + '',
    client = new pg.Client(conString)
    migrations = require('./migrations.json').migrations;

client.connect(function(err) {
  if(err) {
    return console.error('could not connect to postgres', err);
  }
  function queryDb(i) {
    client.query(migrations[i], function(err, result) {
      if(err) {
        console.error('error running query', err);
      }
      else {
        console.log('Ran migration ' + (i + 1));
      }
      client.end();
    });
  }
  for (var i=0; i<migrations.length; i++) {
    queryDb(i);
  }
});