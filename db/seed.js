(function() {
	'use strict';

	var uuid = require('uuid'),
		pg = require('pg-promise')(),
	    dbConfig = require('../db.conf.json'),
	    conString = 'postgres://' + dbConfig.username + ':' + dbConfig.password + '@localhost/' + dbConfig.db + '',
	    db = pg(conString),
	    seedData = require('./seed.json'),
	    Promise = require('promise');

	function getUUID () {
		return uuid.v1();
	}

	function errorHandler(error) {
	  console.log('ERROR', error)
	}

	db.tx(function(){
	  var promises = [];
	  for (var i=0; i<seedData.users.length; i++) {
	  	// return one result for each query and value pair
	    promises.push(this.any(seedData.users[i], [getUUID()]));
	  }
	  return Promise.all(promises).then(function (values) {
	    console.log('Seed DB Complete', values);
	  });
	}).then(function() {
		pg.end();
	}, errorHandler);

})();