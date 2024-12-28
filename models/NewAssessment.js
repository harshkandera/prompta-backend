const mongoose = require("mongoose");
const User = require('./User');

const AssessmentResponsesSchema = new mongoose.Schema({
  question: {
    type: String,
  },
  answer: {
    type: String,
  },
  markGot: {
    type: Number,
  },
  actualMark: {
    type: Number,
  },
});

const file = new mongoose.Schema({
  filename: {
    type: 'string',
  },
  fileurl: {
    type: 'string',
  }
})

const AssessmentSchema = new mongoose.Schema({
  assignmentType: {
    type: String,
  },

  assignmentTopic: {
    type: String,
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  assignmentId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "newAssignments",
  },

  retrieveId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Assessment",
  },
  
  completed: {
    type: Boolean,
    default: false,
  },
  

  userQuestions: [
    {
      submitted: {
        type: Boolean,
        default: false,
      },
      totalMark: {
        type: Number,
      },
      totalMarkGot: {
        type: Number,
      },
      myfile: [file],

      response: [{
        headingType: {
          type: String,
        },

        responses: [AssessmentResponsesSchema]
      }],
      
    },
  ],
  peerQuestions: [
    {
      submitted: {
        type: Boolean,
        default: false,
      },
      totalMark: {
        type: Number,
      },
      totalMarkGot: {
        type: Number,
      },
      myfile: [file],
      peerfile: [file],
      response: [{
        headingType: {
          type: String,
        },

        responses: [AssessmentResponsesSchema]
      }],
    },
  ],

  expertQuestions: [
    {
      submitted: {
        type: Boolean,
        default: false,
      },
      myfile: [file],
      totalMark: {
        type: Number,
      },
      totalMarkGot: {
        type: Number,
      },
      feedback: {
        type: String,
      },
      response: [{
        headingType: {
          type: String,
        },

        responses: [AssessmentResponsesSchema]
      }],
    },
  ],
},
  { timestamps: true });



module.exports = mongoose.model("Assessment", AssessmentSchema);
