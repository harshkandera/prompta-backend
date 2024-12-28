const mongoose = require("mongoose");

const file = new mongoose.Schema({
  filename: {
    type: 'string',
  },
  fileurl: {
    type: 'string',
  }
});


const tasks = new mongoose.Schema({
  assignmentTopic: {
    type: String,
    required: true,
  },
  assignmentQues: [{
    type: String,
  }],
  assignmentType: {
    type: String,
    required: true,
  },
  startDate: {
    type: String,
    required: true,
  },
  lastDate: {
    type: String,
    required: true,
  },
  visibility: {
    type: Boolean,
    default: false
  }
});


const links = new mongoose.Schema({
  linkurl: {
    type: String,
  }
});


const NewAssignmentSchema = new mongoose.Schema({
  assignmentName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  assignmentfileUrl: [file],

  attachlinks: [links],

  preTestTopic: {
    type: String,
  },
  postTestTopic: {
    type: String,
  },
  groups: {
    type: Number,
    required: true,
  },
  maxStudent: {
    type: Number,
    required: true,
  },
  alltasks: [tasks],

  postTaskVisible: {
    type: Boolean,
    default: false
  },

  profMandatory: {
    type: Boolean,
    default: false
  },
  profMarksVisible: {
    type: Boolean,
    default: false
  },
  experts: {
    type: String,
  },
  assessmentType: {
    type: String,
  },
  dueDate: {
    type: String,
    required: true,
  },
  startDate: {
    type: String,
    required: true,
  },
  instructorName: {
    type: String,
    required: true,
  },

  instructorDetails: {
    type: String,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("newAssignments", NewAssignmentSchema);
