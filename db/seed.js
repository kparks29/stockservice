(function() {
	'use strict';

	var uuid = require('uuid'),
		pg = require('pg-promise')(),
	    dbConfig = require('../db.conf.json'),
	    conString = 'postgres://' + dbConfig.username + ':' + dbConfig.password + '@localhost/' + dbConfig.db + '',
	    db = pg(conString),
	    seedData = require('./seed.json'),
	    Promise = require('promise'),
	    bcrypt = require('bcrypt');

	function errorHandler(error) {
	  console.log('ERROR', error)
	}

	db.tx(function(){
	  var promises = [];
	  promises.push(this.any(seedData.clearUsers, []));
	  for (var i=0; i<seedData.users.length; i++) {
	  	var salt = bcrypt.genSaltSync(),
	  		hash = bcrypt.hashSync('test', salt);
	  	// return one result for each query and value pair
	    promises.push(this.any(seedData.users[i], [hash, salt, uuid.v1()]));
	  }
	  return Promise.all(promises).then(function (values) {
	    console.log('Seed DB Complete', values);
	  });
	}).then(function() {
		pg.end();
	}, errorHandler);

})();