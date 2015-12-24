var amqp = require('amqplib');
var when = require('when');
var studentLogic  = require('./../logic/studentFunctionality');
//Importing Data Models

var Student = require('./../models/student');
var Log = require('./../models/log');
//Seeded Schema changable by admin
var validStudentSchema = {
        firstName   : 1,
        lastName    : 1,
        uni         : 1,
        dob         : 1,
        enrolled    : 1
};

function dropInvalidSchema(inputJson) {
    for (key in inputJson) {
        if (!(key in validStudentSchema))
            delete inputJson[key];
    }
    return inputJson;
};

module.exports = function(app) {

    //--------------------------------------CRUD for student--------------------------------------
 /**
 * @api {get} /api/student/:uni Read data of a student
 * @apiVersion 0.3.0
 * @apiName GetStudent
 * @apiGroup Student
 * @apiPermission admin
 *
 *
 * @apiParam {String} uni The UNI of student.
 *
 * @apiSuccess {String}   firstname     First Name of Student
 * @apiSuccess {String}   lastname      Last Name of Student
 * @apiSuccess {String}   uni           UNI of Student
 * @apiSuccess {Date}     dob           Date of Birth of Student
 * @apiSuccess {String[]} enrolled     List of Courses enrolled.

 * @apiError StudentNotFound   The <code>uni</code> of the Student was not found.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 No Student
 *     {
 *       "error": "Student does not exist"
 *     }
 */

    app.get('/api/student', function(req, res) {
        //Handled at the student logic
        console.log(req.params.uni);
        studentLogic.getAllStudent(res);    
    });
    
    app.get('/api/student/:uni', function(req, res) {
        //Handled at the student logic
        console.log(req.params.uni);
        studentLogic.getStudent(res, validStudentSchema, req.params.uni);    
    });
/*
 * @api {post} /api/student Create a new Student
 * @apiVersion 0.3.0
 * @apiName PostStudent
 * @apiGroup Student
 * @apiPermission none
 *
 * @apiParam {String} uni UNI of the Student
 * @apiError StudentNotFound   The <code>uni</code> of the Student was not found.
 *
 * @apiSuccess {String}   firstname     First Name of Student
 * @apiSuccess {String}   lastname      Last Name of Student
 * @apiSuccess {String}   uni           UNI of Student
 * @apiSuccess {Date}     dob           Date of Birth of Student
 * @apiSuccess {String[]} enrolled     List of Courses enrolled.
 *
 */
    app.post('/api/student/:uni', function(req, res) {
        var newStudent = req.body;
        //var newStudent = dropInvalidSchema(req.body);
        newStudent['lastUpdated'] = (new Date()).getTime();

        
        if (newStudent['uni']!=req.params.uni)
        {

          res.json({"error":"uni does not match"});
          return;
        }
        studentLogic.createStudent(res, newStudent);
       

    });
/**
 * @api {put} /api/student/:uni Change a Student
 * @apiVersion 0.3.0
 * @apiName PutStudent
 * @apiGroup Student
 * @apiPermission none
 *
 * @apiParam {String} uni UNI of the Student
 * @apiError StudentNotFound   The <code>uni</code> of the Student was not found.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 No Student
 *     {
 *       "error": "Student does not exist"
 *     }
 */
    app.put('/api/student/:uni', function(req, res) {
        console.log(req.body);
        //Data to be updated
        var newData = req.body.updatedData;
        //newData['lastUpdated'] = (new Date()).getTime();
        if( newData == {})
            res.json({"message":"Error"});
        if (newData && "uni" in newData)
            res.json({"message":"Cannot change UNI"});
        studentLogic.updateStudent(res,newData,req.params.uni);
        
    });
/**
 * @api {delete} /api/student/:uni Delete a student
 * @apiVersion 0.3.0
 * @apiName DeleteStudent
 * @apiGroup Student
 * @apiPermission none
 *
 * @apiParam {String} uni UNI of the Student
 * @apiError StudentNotFound   The <code>uni</code> of the Student was not found.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 No Student
 *     {
 *       "error": "Student does not exist"
 *     }
 */
    app.delete('/api/student/:uni', function(req, res) {

       studentLogic.removeStudent(res, req.params.uni);
    });

    
    //---------------------------- ADMIN APIs ----------------------------

    //----------------------------DataModel Changes API----------------------------
    /**
 * @api {post} /api/admin/student Effect Data Model changes
 * @apiVersion 0.3.0
 * @apiName PutDrop
 * @apiGroup Admin
 * @apiPermission Admin
 *
 * @apiSuccess {"message":"Schema change successful"}
 *
 */
    app.post('/api/student/admin/schema', function(req,res) {
        if ( !('firstName' in req.body.newSchema) || !('lastName' in req.body.newSchema) || !('uni' in req.body.newSchema) || !('enrolled' in req.body.newSchema)  ) {
            //If one of the mandatory schemas are not there
            res.json({"message":"Schema change un-successful.. Cannot remove mandatory columns like firstName lastName UNI or enrolled"});
        }
        else {
            validStudentSchema = req.body.newSchema;
            // Reinforcing mandatory schema components
            validStudentSchema['firstName'] = 1;
            validStudentSchema['lastName'] = 1;
            validStudentSchema['uni'] = 1;
            validStudentSchema['enrolled'] = 1;

            res.json({"message":"Schema change successful"});
        }
    });

    //Serve API Docs
	app.get('/apidocs', function(req, res){

		res.sendfile('docs/index.html');

	});
    //Send error message for any other requests
    app.get('/*', function(req, res){

		res.json({"error":"Invalid Request"});

	});

};
