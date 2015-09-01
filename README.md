Requirements

	1) npm & noded installed (https://nodejs.org)

Create a db.conf.json file

	see example script

Run the following commands in your terminal

	chmod 777 utils/install.sh
	utils/install.sh

Postgres will be installed and ran.  A new window will also be opened.
Run this line in that window

	node app.js

After running those commands your local server and db should be up and running




#################################
#		ALREADY INSTALLED 		#
#################################

If you have already install the backend successfully run these commands to launch the backend

 -First Launch PostgresApp

	git checkout dev
	git pull origin dev
	npm install
	./db/migrate.js
	./db/seed.js
	node app.js


Your server should now be running at http://localhost:8081