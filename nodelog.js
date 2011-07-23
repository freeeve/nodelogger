/* Copyright 2011 Wes Freeman
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/* jslint regexp: true, 
 * node: true, 
 * sloppy: true, 
 * maxlen: 80, 
 * indent: 2 */

var GeoIP = require('geoip'),
  MongoDB = require('mongodb'),
  stdin = process.stdin,
  Db = MongoDB.Db,
  Server = MongoDB.Server,
  City = GeoIP.City;

var host = process.env.MONGO_NODE_DRIVER_HOST !== null ? 
           process.env.MONGO_NODE_DRIVER_HOST : 'localhost';
var port = process.env.MONGO_NODE_DRIVER_PORT !== null ? 
           process.env.MONGO_NODE_DRIVER_PORT : MongoDB.Connection.DEFAULT_PORT;

var city = new City('./GeoLiteCity.dat');

// handle input from stdin
stdin.resume(); 
stdin.on('data', function (chunk) { // called on each line of input
  var line = chunk.toString().replace(/\n/, '\\n'),
    line_arr = line.split(" "), 
    vhost = line_arr[0],
    city_obj = city.lookupSync(line_arr[1]),
    lat = "",
    lon = "",
    db = new Db('nodelogs', new Server(host, port, {}), {native_parser: true});

  if (vhost === "") {
    vhost = "default";
  }

  // strip off www and strange and non-word chars
  vhost = vhost.replace(/[^\w]/g, "_").replace(/www_/g, ""); 
  
  
  if (city_obj !== null) {
    if (city_obj.latitude !== null) {
      lat = city_obj.latitude;
    } 
    if (city_obj.longitude !== null) {
      lon = city_obj.longitude;
    } 
  }

  db.open(function (err, db) {
    db.collection(vhost, function (err, collection) {      
      collection.insert({
        'vhost': vhost,
        'ip': line_arr[1],
        'tz': line_arr[5],
        'type': line_arr[6],
        'url': line_arr[7],
        'httpv': line_arr[8],
        'codes': line_arr[9],
        'bytes': line_arr[10],
        'refer': line_arr[11],
        'browser': line_arr[12],
        'dt': new Date(),
        'lat': lat,
        'lon': lon
      });
      db.close();
    });
  });
}).on('end', function () { // called when stdin closes (via ^D)
  console.log('stdin:closed, exiting nodelog');
});

