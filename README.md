

Requirements

	1) npm & node installed (https://nodejs.org)

Create a db.conf.json file

	2) see example script

Run the following commands in your terminal

	3a) chmod 777 utils/install.sh
		utils/install.sh

	   OR

	3b) install PostgresApp v9.4.4.1
		open PostgresApp
		create a user, password, and grant permissions that matches your db.conf.json
		use these commands to do so:
		- psql
		- CREATE USER $username WITH PASSWORD '$password';
		- CREATE DATABASE $db;
		- GRANT ALL PRIVILEGES ON DATABASE $db to $username;
		- ALTER ROLE $username WITH Superuser;

		NOTE: $username, $passowrd, and $db are all variables that you defined in your db.conf.json. 
		Make sure these are replaced with those values.

Postgres will be installed and ran.  A new window will also be opened.


#################################
#		ALREADY INSTALLED 		#
#################################

If you have already install the backend successfully run these commands to launch the backend

 -First Launch PostgresApp

	git checkout dev
	git pull origin dev
	npm install
	node ./db/migrate.js
	node ./db/seed.js
	node app.js


Your server should now be running at http://localhost:8081

if you run the seed script you will have a test user at test@test.com with password of test

#################################
#			API			 		#
#################################


POST '/login'
requires => email_address and password
returns => auth_token


POST '/users/create'
requires => email_address, password, first_name, last_name, phone_number(optional)
returns => 201
