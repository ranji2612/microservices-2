//Initial configuration
var express     = require('express');
// create our app w/ express
var app         = express();
var port  	    = 8000;
var ipaddr      = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";

			
require('./queueServer.js');

//Start the awesomeness
app.listen( port, ipaddr, function() {	
	console.log('Magic happens on port ', port, ipaddr); 
});
