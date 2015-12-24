var easy = require("easy-sqs");
var awsconfig = require('./awsconf.json');
var request = require('request');
var awsConfig = {
	"accessKeyId": awsconfig.accessKeyId,
	"secretAccessKey": awsconfig.secretAccessKey,
	"region": awsconfig.region
};
 
var url = "https://sqs.us-east-1.amazonaws.com/575052755988/";
 
var client = easy.createClient(awsConfig);
var queueReader = client.createQueueReader(url);


//Post message in a Queue
function postMessage(message) {
    if(typeof(message)=="object")
        message = JSON.stringify(message);
    console.log('Sending too ', url,'\nmessage : ', message);
    client.getQueue(url, function(err, queue){

        if(err) console.log("queue does not exist");

        //messages must be strings for now...
        
        queue.sendMessage(message, function(err){
                if(err) console.log("send failed!");
        });

    });
};
