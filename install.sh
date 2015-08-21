# runs npm installs
# installs and launches postgres
# TODO unzip and move file after curl finishes
# TODO run create use and database script after new tab is open

npm install

testPsql=$(psql --version)

if [ "$testPsql" = "psql (PostgreSQL) 9.4.4" ]
then
	# downloads postgres.app
	curl -o postgres.zip "https://s3.amazonaws.com/github-cloud/releases/3946572/b195fe36-2ebe-11e5-95f2-84451509761f.zip?response-content-disposition=attachment%3B%20filename%3DPostgres-9.4.4.1.zip&response-content-type=application/octet-stream&AWSAccessKeyId=AKIAISTNZFOVBIJMK3TQ&Expires=1440177405&Signature=ZUT1XRPF0xD8jO3XttQFaCAKl3A%3D"

	# unzips the download and moves it to your applications folder
	unzip postgres
	mv Postgres.app /Applications
	rm postgres.zip
fi

# launches postgres then opens another tab
osascript -e 'tell application "Terminal" to activate' -e 'tell application "System Events" to tell process "Terminal" to keystroke "t" using command down' | /Applications/Postgres.app/Contents/MacOS/Postgres

# 
# echo "CREATE USER stockuser WITH PASSWORD 'no7!st';CREATE DATABASE stockservice;GRANT ALL PRIVILEGES ON DATABASE stockservice to stockuser;" | psql

