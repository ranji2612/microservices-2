var easy = require("easy-sqs");
var awsconfig = require('./awsconf.json');
var request = require('request');
var awsConfig = {
	"accessKeyId": awsconfig.accessKeyId,
	"secretAccessKey": awsconfig.secretAccessKey,
	"region": awsconfig.region
};
 
var url = "https://sqs.us-east-1.amazonaws.com/575052755988/lol";
 
var client = easy.createClient(awsConfig);
var queueReader = client.createQueueReader(url);


//Long Poll Queue Reading
queueReader.on("message", function (message) {
    console.log("\n\nMessage Recieved\n\n");
    //console.log(message);
    //process message.Body here... 
    console.log(message);
    queueReader.deleteMessage(message);
    
});
 
queueReader.on("error", function (err) {
 
		console.log("error", err);
 
});
 
queueReader.start();