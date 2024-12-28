const mongoose = require("mongoose");

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
const questionSchema = new mongoose.Schema({

    assignmentType: {
        type: 'string'
    }
    ,
    
    userQues: [{
        headingType: {
            type: 'string',
        },
        questions: [quesSchema]
    }],
    peerQues: [{
        headingType: {
            type: 'string',
        },
        questions: [quesSchema]
    }],
    expertQues:[{
        headingType: {
            type: 'string',
        },
        questions: [quesSchema]
    }],

})
module.exports = mongoose.model("Question", questionSchema);