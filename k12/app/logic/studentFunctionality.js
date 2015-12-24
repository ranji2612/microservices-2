
//AWS and dynamo DB
var AWS = require('aws-sdk');
//Get Config File
var awsconfig      = require('./../../awsconf.json');
//Load the conf into aws
AWS.config.update({accessKeyId: awsconfig.accessKeyId, secretAccessKey: awsconfig.secretAccessKey});

var ddb = require('dynamodb').ddb({ accessKeyId: awsconfig.accessKeyId, secretAccessKey: awsconfig.secretAccessKey });
var dynamodb = new AWS.DynamoDB();

// Has all the business Logic.

module.exports =  {
    getAllStudent  : function(res) {
        console.log("Getting all items");
        ddb.scan('k12', {}, function(err, resp) {
            if(err) {
                console.log(err);
            } else {
                //console.log(res);
                res.send(resp.items);
            }
        });

    },
    createStudent  : function(res, newStudent) {
        ddb.getItem('k12', newStudent.uni, null, {}, function(err, dbres, cap) {
            //console.log(dbres);
            if (typeof(dbres)==="undefined") {
                ddb.putItem('k12', newStudent, {}, function(err, dbres, cap) {
                    if(err) console.log('Error : ',err);
                    console.log(dbres);
                    console.log(cap);
                    res.json({'message':'Student info created Successfully'});
                });
            } else {
                res.json({'message':'Student already present'});
            }
        });
        
    },

    getStudent : function(res, validStudentSchema, uni) {
        ddb.getItem('k12', uni, null, {}, function(err, dbres, cap) {
            //console.log(dbres);
            if (typeof(dbres)==="undefined")
                res.json({"message":"Student does not exist"});
            res.json(dbres);
        });
        
    },

    updateStudent : function(res, updateData, uni) {
        
        ddb.getItem('k12', uni, null, {}, function(err, dbres, cap) {
            //console.log(dbres);
            if (typeof(dbres)==="undefined") {
            } else {
                var newData = {};
                for (i in updateData) {
                    newData[i] = {"value":updateData[i]};
                }
                
                ddb.updateItem('k12', uni, null, newData, {},
               function(err, dbUpRes, cap) {
                    if(err) console.log('Error : ',err);
                    console.log(dbUpRes);
                    console.log(cap);
                    res.json({'message':'Student info updated Successfully'});
                });
            }
        });
    },

    removeStudent : function(res,uni) {
        ddb.getItem('k12', uni, null, {}, function(err, dbres, cap) {
            //console.log(dbres);
            if (typeof(dbres)==="undefined") {
                res.json({'message':'Student is not present in the system'});
            } else {
                ddb.deleteItem('k12', uni, null, {}, function(err, delres, cap) {
                    if(err) res.send(err);
                    else res.json({'message':'Student info is deleted successfully'});
                });
            }
        });
  }
};
