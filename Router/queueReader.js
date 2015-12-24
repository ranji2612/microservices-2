var easy = require("easy-sqs");
var awsconfig = require('./awsconf.json');
var request = require('request');
var awsConfig = {
	"accessKeyId": awsconfig.accessKeyId,
	"secretAccessKey": awsconfig.secretAccessKey,
	"region": awsconfig.region
};
 
var url = "https://sqs.us-east-1.amazonaws.com/575052755988/K12APIQueue";
 
var client = easy.createClient(awsConfig);
var queueReader = client.createQueueReader(url);
 
//Post message in a Queue
function postMessage(outputQueueurl, message) {
    if(typeof(message)=="object")
        message = JSON.stringify(message);
    console.log('Sending too ', outputQueueurl,'\nmessage : ', message);
    client.getQueue(outputQueueurl, function(err, queue){

        if(err) console.log("queue does not exist");

        //messages must be strings for now...
        
        queue.sendMessage(message, function(err){
                if(err) console.log("send failed!");
        });

    });
};

//Call corresponding API
function callAPI(restEndpoint, method, outputQ,corrId, formData) {
    if (method=='GET' ) {
        request(restEndpoint, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var info = JSON.parse(body)
                // do more stuff
                console.log(info);
                if (info)
                    info["corrId"] = corrId;
                postMessage(outputQ, info);
                return info;
            }
        });
    } else if(method=='PUT' || method=="POST") {
        console.log(method,'    ',restEndpoint, '\n',formData);
        request({
          uri: restEndpoint,
          method: method,
          timeout: 10000,
          json: formData,
          followRedirect: true,
          maxRedirects: 10
        }, function(error, response, body) {
            if (error) console.log(error);
            console.log(body);
            if (body)
                body['corrId'] = corrId;
            postMessage(outputQ, JSON.stringify(body));
        });
    } else if(method=='DELETE') {
        request({
          uri: restEndpoint,
          method: method,
          timeout: 10000,
          json: formData,
          followRedirect: true,
          maxRedirects: 10
        }, function(error, response, body) {
            if (error) console.log(error);
            if (body)
                body['corrId'] = corrId;
            postMessage(outputQ, body);
        });
    }
    
};


//Long Poll Queue Reading
queueReader.on("message", function (message) {
    //console.log(message);
    
    //process message.Body here... 
    var data = JSON.parse(message.Body);
    if (typeof(data.corrId)!=="undefined" && typeof(data.restEndpoint)!=="undefined"  && typeof(data.method)!=="undefined"  && typeof(data.outputQ)!=="undefined"  ){
        console.log("\n\nMessage Recieved\n\n");
        console.log(message);
    
        //Call and get the data
        var resp = callAPI(data.restEndpoint,data.method, data.outputQ,data.corrId, data.formData);
        
        //Update the result in new queue
        //postMessage(data.outputQ,JSON.stringify(response));
        
        //Delete the queue
        queueReader.deleteMessage(message);
    }
    
    //callAPI('http://localhost:9001/api/student/sd2688','GET');
 
});
 
queueReader.on("error", function (err) {
 
		console.log("error", err);
 
});
 
queueReader.start();