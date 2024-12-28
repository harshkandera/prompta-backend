const NewAssignments = require('../models/NewAssignment');
const { errorHandler } = require("../utils/error");
const cloudinary = require('cloudinary').v2;
const Assessment = require('../models/NewAssessment');
const path = require('path');
const newCourse = require('../models/Course');
const User = require("../models/User");
const { ObjectId } = require('mongodb');

function isFileSupported(type, supportedTypes) {
  return supportedTypes.includes(type);
}

async function uploadFileToCloudinary(file, folder) {
  const options = {
    resource_type: 'auto',
    folder: folder,
    format: 'pdf',
    public_id: `${Date.now()}`
  };
  return await cloudinary.uploader.upload(file.tempFilePath, options);
}

exports.NewAssignment = async (req, res, next) => {
  try {



    //   let files = req.files ? req.files.file : null;

    //  if (files && !Array.isArray(files)) {
    //     files = [files]; // Convert single file to an array with a single element
    //   }


    // let responses = []

    const { assignmentName, description, dueDate, instructorName, instructorDetails, startDate, experts, assessmentType , preTestTopic, postTestTopic } = req.body;
    // const alltasks = JSON.parse(req.body.alltasks);
    // const attachlinks = JSON.parse(req.body.attachlinks);
    const groups = JSON.parse(req.body.groups);
    const maxStudent = JSON.parse(req.body.maxStudent);
    const postTaskVisible = JSON.parse(req.body.postTaskVisible);
    const profMandatory = JSON.parse(req.body.profMandatory);
    const profMarksVisible=JSON.parse(req.body.profMarksVisible);

    // if (files && files.length > 0 && files[0] !== null) {
    //   const supportedTypes = ["pdf"]

    //   const uploadPromises = files.map(async (file) => {
    //     const fileTypes = path.extname(file.name).toLowerCase().slice(1);
    //     console.log(fileTypes);
    //     if (!isFileSupported(fileTypes, supportedTypes)) {
    //       return errorHandler(400, "Only PDF files supported");
    //     }
    //     const response = await uploadFileToCloudinary(file, "AssignmentFile");
    //     return { filename: file.name, fileurl: response.secure_url };
    //   });


    //   responses = await Promise.all(uploadPromises);

    // }




    const fileData = await NewAssignments.create({
      assignmentName: assignmentName,
      assessmentType: assessmentType,
      experts: experts,
      profMandatory: profMandatory,
      description: description,
      dueDate: dueDate,
      startDate: startDate,
      groups: groups,
      maxStudent: maxStudent,
      postTaskVisible: postTaskVisible,
      instructorName: instructorName,
      instructorDetails: instructorDetails,
      profMarksVisible:profMarksVisible,
      preTestTopic: preTestTopic,
      postTestTopic: postTestTopic
    });
    

    console.log(fileData);
    return res.status(200).json({
      success: true,
      message: "Assignment Created successfully",
    });
  } catch (error) {
    next(error);
  }
};




exports.Allassignments = async (req, res, next) => {

  try {
    const allassignments = await NewAssignments.find({});

    if (!allassignments) {
      return errorHandler(404, "assignments not found")
    }

    return res.status(200).json({
      success: true,
      message: "allassignments got successfully",
      allassignments
    })

  } catch (error) {
    next(error)
  }
}

exports.Assignment = async (req, res, next) => {

  try {
    const assignmentId = req.params.assignmentId;

    const assignment = await NewAssignments.findById(assignmentId);

    if (!assignment) {
      return errorHandler(404, "assignment not found")
    }

    return res.status(200).json({
      success: true,
      message: "allassignments got successfully",
      assignment
    })

  } catch (error) {
    next(error)
  }
}



exports.UpdateAssignment = async (req, res, next) => {
  try {

    console.log(req.body)

    const assignmentId = req.params.assignmentId;

    const { assignmentName, description, dueDate, startDate, instructorDetails, instructorName,experts, assessmentType , preTestTopic, postTestTopic} = req.body;

    const groups = JSON.parse(req.body.groups);
    const maxStudent = JSON.parse(req.body.maxStudent);
    const postTaskVisible = JSON.parse(req.body.postTaskVisible);
    const profMandatory = JSON.parse(req.body.profMandatory);

    const profMarksVisible=JSON.parse(req.body.profMarksVisible);
    const updateFields = {
      assignmentName,
      description,
      dueDate,
      startDate,
      instructorDetails,
      instructorName,
      experts,
      assessmentType,
      groups: groups,
      maxStudent:maxStudent,
      postTaskVisible:postTaskVisible,
      profMandatory:profMandatory,
      profMarksVisible:profMarksVisible,
      preTestTopic: preTestTopic,
      postTestTopic: postTestTopic
    };

    console.log(updateFields);

    // Remove undefined fields from updateFields
    Object.keys(updateFields).forEach(key => updateFields[key] === undefined && delete updateFields[key]);

    const updatedAssignment = await NewAssignments.findByIdAndUpdate(
      assignmentId,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedAssignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment Not Found",
      });
    }


    return res.status(200).json({
      success: true,
      message: "Assignment Updated successfully",
      updatedAssignment,

    });
  } catch (error) {
    next(error);
  }
};



// exports.Addtask = async (req, res, next) => {

//   try {

//     console.log(req.body)

//     const assignmentId = req.params.assignmentId;

//     let mergedArray = [];

//     let files = req.files ? req.files.file : null;

//     if (!Array.isArray(files)) {
//       files = [files]; // Convert single file to an array with a single element
//     }

//     console.log("line0",existingAssignment.alltasks);

//     const alltasks = JSON.parse(req.body.alltasks);
//     const attachlinks = JSON.parse(req.body.attachlinks);


//     const supportedTypes = ["pdf"];


//     const finalUrls = [];

//     for (let key in req.body) {
//       if (key.startsWith('finalUrls')) {
//         const index = key.match(/\[(.*?)\]/)[1];
//         const property = key.match(/\[(.*?)\]\[(.*?)\]/)[2];
//         if (!finalUrls[index]) {
//           finalUrls[index] = {};
//         }
//         finalUrls[index][property] = req.body[key];
//       }
//     }


//     console.log("final ulrs",finalUrls);


//     if (files && files.length > 0 && files[0] !== null) {
//       const uploadPromises = files.map(async (file) => {
//         const fileTypes = path.extname(file.name).toLowerCase().slice(1);
//         if (!isFileSupported(fileTypes, supportedTypes)) {
//           return errorHandler(400, "File type not supported");
//         }
//         const response = await uploadFileToCloudinary(file, "AssignmentFile");
//         return { filename: file.name, fileurl: response.secure_url };
//       });

//       const responses = await Promise.all(uploadPromises);
//       mergedArray = [...finalUrls, ...responses];

//     }
//     else {
//       mergedArray = finalUrls;
//     }



//     // Find the document by ID
//     const existingAssignment = await NewAssignments.findById(assignmentId);

//     console.log("line1 ",existingAssignment.alltasks);

//     // Update additional 
//     if(existingAssignment.alltasks.length > 0){

//       existingAssignment.alltasks = existingAssignment.alltasks.filter((task) =>
//         alltasks.some((t) => t._id === task._id)
//       );
  
//     }

//     console.log("line2 ",existingAssignment.alltasks);


//     // Push the new tasks
//     existingAssignment.alltasks.push(...alltasks);
  
//     console.log("line3 ",existingAssignment.alltasks);

//     existingAssignment.attachlinks = attachlinks;
//     existingAssignment.assignmentfileUrl = mergedArray;

//     // Uncomment the following line to save the updated document
//     const updatedAssignment = await existingAssignment.save();

//     return res.status(200).json({
//       success: true,
//       message: "Assignment Updated successfully",
//       assignmentfileUrl: mergedArray,

//     });
//   } catch (error) {
//     next(error);
//   }
// };


function removeDuplicateTasksById(existingAssignment) {
  // Create a Set to track unique task IDs
  const uniqueTaskIds = new Set();

  // Filter tasks to retain only those with unique _id
  existingAssignment.alltasks = existingAssignment.alltasks.filter(task => {
    if (!uniqueTaskIds.has(task._id.toString())) {
      // If _id is not in the Set, add it and keep the task
      uniqueTaskIds.add(task._id.toString());
      return true;
    }
    // If _id is already in the Set, filter it out
    return false;
  });
}

exports.Addtask = async (req, res, next) => {

  try {

    console.log(req.body);
    // console.log(req.params)

    const assignmentId = req.params.id;

    let mergedArray = [];
    let files = req.files ? req.files.file : null;

    if (!Array.isArray(files)) {
      files = [files]; // Convert single file to an array with a single element
    }

    const newtasks = req.body.alltasks ? JSON.parse(req.body.alltasks) : [];

    const alltasks = req.body.tasks ? JSON.parse(req.body.tasks) : [];

    const attachlinks = req.body.attachlinks ? JSON.parse(req.body.attachlinks) : [];
    

    console.log("here are all the all tasks", alltasks);

    console.log("new  tasks", newtasks);


    const supportedTypes = ["pdf"];


    const finalUrls = [];

    for (let key in req.body) {
      if (key.startsWith('finalUrls')) {
        const index = key.match(/\[(.*?)\]/)[1];
        const property = key.match(/\[(.*?)\]\[(.*?)\]/)[2];
        if (!finalUrls[index]) {
          finalUrls[index] = {};
        }
        finalUrls[index][property] = req.body[key];
      }
    }


    if (files && files.length > 0 && files[0] !== null) {
      const uploadPromises = files.map(async (file) => {
        const fileTypes = path.extname(file.name).toLowerCase().slice(1);
        if (!isFileSupported(fileTypes, supportedTypes)) {
          return errorHandler(400, "File type not supported");
        }
        const response = await uploadFileToCloudinary(file, "AssignmentFile");
        return { filename: file.name, fileurl: response.secure_url };
      });

      const responses = await Promise.all(uploadPromises);
      mergedArray = [...finalUrls, ...responses];
    } else {
      mergedArray = finalUrls;
    }



    // Find the document by ID
    const existingAssignment = await NewAssignments.findById(assignmentId);



    if (!existingAssignment) {
      return res.status(404).json({ success: false, message: "Assignment not found" });
    }




    // Ensure only tasks that exist in `alltasks` remain in `existingAssignment.alltasks`

    const allTaskIds = new Set(alltasks.map(task => task._id && task._id.toString()));

    // Filter existing tasks to only include those present in `alltasks`
    existingAssignment.alltasks = existingAssignment.alltasks.filter(existingTask =>
      allTaskIds.has(existingTask._id.toString())
    );


    removeDuplicateTasksById(existingAssignment);


    // console.log("here is the existing assignment", existingAssignment);

    // const newTasks = alltasks.filter(task => !existingTasksIds.includes(task._id));

    // console.log(newTasks)

    // Push the new tasks
    existingAssignment.alltasks.push(...newtasks);

    existingAssignment.attachlinks = attachlinks;
    existingAssignment.assignmentfileUrl = mergedArray;

    const updatedAssignment = await existingAssignment.save();

    return res.status(200).json({
      success: true,
      message: "Assignment updated successfully",
      updatedAssignment
    });
  } catch (error) {
    next(error);
  }
};



exports.Updatetasks = async (req, res, next) => {
  try {
    
    const { taskdata } = req.body;
    const { taskId } = req.body;
    const assignmentId = req.params.id;

    console.log(req.body);


    // Find the assignment by its ID
    const assignment = await NewAssignments.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found.",
      });
    }

    // // Find the index of the task within the alltasks array
    const taskIndex = assignment.alltasks.findIndex(task => task._id.toString() === taskId);

    console.log(taskIndex)

    if (taskIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    // Update the task
    assignment.alltasks[taskIndex].assignmentTopic = taskdata.assignmentTopic;
    assignment.alltasks[taskIndex].assignmentType = taskdata.assignmentType;
    assignment.alltasks[taskIndex].startDate = taskdata.startDate;
    assignment.alltasks[taskIndex].lastDate = taskdata.lastDate;
    assignment.alltasks[taskIndex].visibility = taskdata.visibility;
    assignment.alltasks[taskIndex].assignmentQues = taskdata.assignmentQues;

    console.log(assignment);
    // Save the updated assignment
    const updatedAssignment = await assignment.save();



    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      updatedAssignment
    });
  } catch (error) {
    console.error("An error occurred during updating:", error);
    next(error);
  }
}





exports.ExpertSubmission = async (req, res, next) => {
  try {

    console.log(req.params)
    console.log(req.body)
    const userId = req.params.userId;
    const assessmentId = req.params.assessmentId;
    // const { feedback, peerfinalResponses, peertotal } = req.body;

    const feedback = req.body.feedback;
    const expertfinalResponses = req.body.expertfinalResponses;
    const peertotal = req.body.peertotal;
    const totalMarksGot = req.body.marksGot


    if (!feedback || !expertfinalResponses || !expertfinalResponses.length > 0) {
      return res.status(400).json({
        success: false,
        message: "All field required",
      });
    }

    let submission = await Assessment.findOne({ assignmentId: assessmentId, userId: userId });

    if (!submission) {
      throw new Error('Submission not found');
    }
    submission.completed = true;
    submission.expertQuestions[0].totalMark = peertotal;
    submission.expertQuestions[0].submitted = true;
    submission.expertQuestions[0].response = expertfinalResponses;
    submission.expertQuestions[0].feedback = feedback;
    submission.expertQuestions[0].totalMarkGot = totalMarksGot;

    await submission.save();

    return res.status(200).json({
      success: true,
      message: "Teacher response submitted successfully",
    });
  } catch (error) {
    console.error("An error occurred during Peer response submission:", error);
    next(error);
  }
};




exports.DeleteAssessment = async (req, res, next) => {
  try {
    const id = req.params.id;
    console.log(req.params.id)



    await User.updateMany(
      { "courses.assessment": id },
      { $pull: { courses: { assessment: id } } }
    );



    const deleteCourse = await NewAssignments.findByIdAndDelete(id);
    const deletedAssessment = await Assessment.deleteMany({ assignmentId: id });
    const deleteResult = await newCourse.deleteMany({ assignmentId: id });


    return res.status(200).json({
      success: true,
      message: "Course Deleted successfully",
    });

  } catch (error) {
    next(error);
  }
};





exports.PreDiagnostic = async (req, res, next) => {
  try {
    const { assessmentId, userId } = req.params;
    const { marksGot1, preTotal, prefinalResponses } = req.body;

    // Validate required parameters
    if (!userId || !assessmentId) {
      return res.status(400).json({ success: false, message: "All parameters are required." });
    }

    // Find the assessment
    const newAssessment = await newCourse.findOne({ userId: userId, assignmentId: assessmentId });
    if (!newAssessment) {
      return res.status(400).json({ success: false, message: "Assessment not found." });
    }

    // Update assessment with pre-assessment data
    newAssessment.preMarks = marksGot1;
    newAssessment.preresponses = prefinalResponses;
    newAssessment.preTotalMarks = preTotal;

    // Save the updated assessment
    await newAssessment.save();

    // Respond with success
    return res.status(200).json({
      success: true,
      message: "Pre-assessment submitted successfully",
    });

  } catch (error) {
    console.error("Failed to submit pre-assessment:", error);
    return next(error);
  }
}



exports.PostDiagnostic = async (req, res, next) => {
  try {
    const { assessmentId, userId } = req.params;
    const { marksGot2, postTotal, postfinalResponses } = req.body;

    // Validate required parameters
    if (!userId || !assessmentId) {
      return res.status(400).json({ success: false, message: "All parameters are required." });
    }

    // Find the assessment
    const newAssessment = await newCourse.findOne({ userId: userId, assignmentId: assessmentId });
    if (!newAssessment) {
      return res.status(400).json({ success: false, message: "Assessment not found." });
    }

    // Update assessment with pre-assessment data
    newAssessment.postMarks = marksGot2;
    newAssessment.postresponses = postfinalResponses;
    newAssessment.postTotalMarks = postTotal;

    // Save the updated assessment
    await newAssessment.save();

    // Respond with success
    return res.status(200).json({
      success: true,
      message: "Pre-assessment submitted successfully",
    });

  } catch (error) {
    console.error("Failed to submit pre-assessment:", error);
    return next(error);
  }
}