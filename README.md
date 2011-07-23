# nodelogger

The idea behind nodelogger is to provide a logging utility able to take the standard "piped" output from apache, that puts the output into a mongodb database.

## installing

This guide assumes you have nodejs (tested with 0.4.9) and npm installed. You also need to have a mongodb server.

1. Install GeoIP: `npm install geoip`
2. Install MongoDB: `npm install mongodb --mongodb:native`
3. Put nodelogger.js in a convenient path somewhere, let's say /usr/local/node_modules/nodelogger/nodelogger.js

## configure your apache

nodelogger expects a particular format from apache. You'll want to set up your httpd.conf to look like this:
```apache
LogFormat "%v %h %l %u %t \"%r\" %>s %b \"%{Referer}i\" \"%{User-Agent}i\"" combined
CustomLog "| /usr/local/bin/node /usr/local/node_modules/nodelogger/nodelogger.js" combined
```