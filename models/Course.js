const mongoose = require("mongoose");

const file = new mongoose.Schema({
  filename: {
    type: 'string',
  },
  fileurl: {
    type: 'string',
  }
})

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

const courses = new mongoose.Schema({
  
  assessment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Assessment"
  }

})


const newCourse = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "newAssignments",
  },

  verified: {
    type: Boolean,
    default: false
},

  group: {
    type: Number,
    required: true
},


  preTest: [file],

  preresponses:[{
    headingType: {
      type: String,
    },

    responses: [AssessmentResponsesSchema]
  }],

  preMarks: {
    type: Number,
  },
  preTotalMarks: {
    type: Number,
  },
  
  initialDone: {
    type: Boolean,
    default: false
  },

 

  courses: [courses],



  postTest: [file],

  postresponses:[{
    headingType: {
      type: String,
    },

    responses: [AssessmentResponsesSchema]
  }],

  postTotalMarks: {
    type: Number,
  },
  postMarks: {
    type: Number,
  },

  completed: {
    type: Boolean,
    default: false
  },

  commonfeedback: {
    type: String,
  }
},
  { timestamps: true });


module.exports = mongoose.model("newCourse", newCourse);
