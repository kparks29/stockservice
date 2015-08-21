# runs npm installs
# creates user, password, and database if it does not exist
# installs and launches postgres
#############################
#			npm		 		#
#############################
npm install

#############################
#		PostgresApp 		#
#############################

# Downloads postgres and installs it if you need it
echo "Checking if Postgres.app is installed"
testPsql=$(psql --version)

if [ "$testPsql" != "psql (PostgreSQL) 9.4.4" ]
then
	# get the download link
	curl --progress-bar -v -o postgres.xml https://github.com/PostgresApp/PostgresApp/releases/download/9.4.4.1/Postgres-9.4.4.1.zip
	url=$(grep "href" postgres.xml  | cut -d"\"" -f2,2)
	url=${url//amp;/}
	rm postgres.xml

	# downloads postgres.app
	curl --progress-bar -v -o postgres.zip $url

	# unzips the download and moves it to your applications folder
	unzip postgres
	# mv Postgres.app /Applications
	rm postgres.zip
	rm -rf Postgres.app
else
	echo "PostgreSQL 9.4.4 already installed"
fi

#############################
#	SETTING UP PostgreSQL 	#
#############################

# setting up user, db, and password
echo "Checking if user role exists on postgres"
username=$(grep "username" ../db.conf.json | cut -d " " -f 2 | cut -d "\"" -f 2)
password=\'$(grep "password" ../db.conf.json | cut -d " " -f 2 | cut -d "\"" -f 2)\'
testUsername=$(psql postgres -tAc "SELECT 1 FROM pg_roles WHERE rolname='$username'")
if [ "$testUsername" != 1 ]
then
	echo "CREATE USER $username WITH PASSWORD $password;" | psql
else
	echo "Username already exists"
fi

echo "Checking if database exists on postgres"
db=$(grep "db" ../db.conf.json | cut -d " " -f 2 | cut -d "\"" -f 2)
testDb=$(psql postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$db'")
if [ "$testUsername" != 1 ]
then
	echo "CREATE DATABASE $db;" | psql
else
	echo "Database already exists"
fi

echo "Granting privileges to user on database"
echo "GRANT ALL PRIVILEGES ON DATABASE $db to $username;" | psql


#############################
#	LAUNCHING UP PostgreSQL #
#############################

# launches postgres then opens another tab
echo "Launching PostgreSQL"
osascript -e 'tell application "Terminal" to activate' -e 'tell application "System Events" to tell process "Terminal" to keystroke "t" using command down' | /Applications/Postgres.app/Contents/MacOS/Postgres
