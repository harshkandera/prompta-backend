const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({

  
    assignmentType: {
            type: 'String',
            required:true
        },
        groups:{
            type: [String], 
            required: true, 
        }
   
})


const quesSchema = new mongoose.Schema({
    ques: {
        type: 'string',
    },
    quesType: {
        type: 'string',
    },
    mark: {
        type: 'Number',
    }

});


const AssignmentType = mongoose.model("AssignmentType", assignmentSchema);

const  Diagnostics = mongoose.model("Diagnostics", new mongoose.Schema({
    assignmentType: {
        type: 'string'
    },
    diagnosticQues: [{
        headingType: {
            type: 'string',
        },
        questions: [quesSchema]
    }]
}));



module.exports = { AssignmentType, Diagnostics };