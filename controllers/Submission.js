const Assessment = require('../models/NewAssessment');
const newCourse = require('../models/Course');
const { errorHandler } = require("../utils/error");
const cloudinary = require('cloudinary').v2;
const Question = require('../models/Questions')
const User = require("../models/User");
const mongoose = require("mongoose");
const path = require('path');
const NewAssignments = require('../models/NewAssignment');

function isFileSupported(type, supportedTypes) {
  return supportedTypes.includes(type);
}

function DateNumber1(date) {
  const dateNum = parseInt(date.split('-').join(''));
  return dateNum;
}


const today = new Date();

// Get the date in India Standard Time
const options = { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' };
const indiaDate = new Intl.DateTimeFormat('en-IN', options).format(today);

// Format the date string into a number (YYYYMMDD)
const [day, month, year] = indiaDate.split('/');
const todaysDate = parseInt(`${year}${month}${day}`, 10);

console.log(todaysDate);



async function uploadFileToCloudinary(file, folder) {
  const options = {
    resource_type: 'auto',
    folder: folder,
    format: 'pdf',
    resource_type: 'auto',
    public_id: `${Date.now()}`
  };
  return await cloudinary.uploader.upload(file.tempFilePath, options);
}


exports.NewAssessment = async (req, res, next) => {
  try {

    const userId = req.params.userId;
    const assessmentId = req.params.assessmentId;


    let files = req.files ? req.files.file : null;

    const newAssignments = await NewAssignments.findById(assessmentId);

    console.log(DateNumber1(newAssignments?.startDate) > todaysDate)

    console.log(DateNumber1(newAssignments?.startDate), todaysDate)


    // if (newAssignments && (DateNumber1(newAssignments?.startDate) > todaysDate)) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Course Not Started",
    //   })
    // }


    // if (newAssignments && (DateNumber1(newAssignments?.dueDate) < todaysDate)) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Course Completed",
    //   })
    // }


    if (!files.length > 0 && files[0] === null) {
      return res.status(400).json({
        success: false,
        message: "No files were uploaded."
      });

    }

    if (!Array.isArray(files)) {
      files = [files];
    }



    const assignment = await newCourse.findOne({ userId: userId, assignmentId: assessmentId });

    if (!assignment || !assignment.verified) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to submit this assignment.",
      });
    }




    if (assignment?.initialDone || assignment?.preTest?.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Already Submitted"
      })

    }

    const supportedTypes = ["pdf"];
    let errors = [];

    const uploadPromises = files.map(file => {
      const fileType = path.extname(file.name).toLowerCase().slice(1);
      if (!supportedTypes.includes(fileType)) {
        errors.push(`${file.name}: Unsupported file type.`);
        return null;
      }
      return uploadFileToCloudinary(file, "Assignments")
        .then(response => ({ filename: file.name, fileurl: response.secure_url }))
        .catch(err => {
          errors.push(`${file.name}: Failed to upload due to ${err.message}`);
          return null;
        });
    });

    const responses = (await Promise.all(uploadPromises)).filter(r => r != null);

    if (responses.length === 0) {
      return res.status(500).json({
        success: false,
        message: "Failed to upload any files.",
        errors
      });
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Failed to upload some files.",
        errors
      });
    }

    assignment.preTest = responses;
    assignment.initialDone = true;
    await assignment.save();


    const updatedAssignment = await newCourse.findOne({ userId: userId, assignmentId: assessmentId });


    return res.status(200).json({
      success: true,
      message: "Pre Test Submitted successfully",
      updatedAssignment,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error("An error occurred during file submission:", error);
    next(error);
  }
};






exports.Getsubmission = async (req, res, next) => {

  try {

    // fetch profile id
    const assessmentId = req.params.assessmentId;
    const userId = req.params.userId;

    if (!userId) {
      return res.status(404).json({
        success: false,
        message: "user not found",


      })
    }

    const submission = await newCourse.findOne({ assignmentId: assessmentId, userId: userId }).populate('preTest').populate({
      path: 'courses',
      populate: { path: 'assessment' }
    }).populate("preresponses")
      .populate("postresponses")
      .exec();



    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found",


      });
    }

    return res.status(200).json({
      success: true,
      message: "submission send successfully",
      submission

    });

  } catch (error) {
    return next(error)

  }
}



exports.Getcourse = async (req, res, next) => {
  try {
    // Fetch assessmentId and userId from request parameters
    const { assessmentId, userId } = req.params;

    // Check if userId is provided
    if (!userId) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Find the course based on assessmentId and userId
    const course = await Assessment.findOne({ assignmentId: assessmentId, userId: userId });

    // If no course found, return error message
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    // If course found, return success message and course data
    return res.status(200).json({
      success: true,
      message: "Course sent successfully",
      course
    });

  } catch (error) {
    // Handle any errors
    return next(error);
  }
}



// exports.selfSubmit = async (req, res, next) => {

//   const session = await mongoose.startSession();

//   try {

//     session.startTransaction();

//     const { assessmentId, userId } = req.params;
//     const { assignmentId, assignmentTopic, assignmentType  } = req.body;
//     let files = req.files ? req.files.file : null;

//     // console.log(files)


//        if (!files || (Array.isArray(files) && files.length === 0)) {
//         return res.status(400).json({
//           success: false,
//           message: "No files were uploaded."
//         });
//       }
  
//       if (!Array.isArray(files)) {
//         files = [files];
//       }


//     // Validate required parameters
//     if (!userId || !assessmentId || !assignmentId) {
//       return res.status(400).json({ success: false, message: "All parameters are required." });
//     }

//     // Validate user authorization for the course
//     const submission = await newCourse.findOne({ assignmentId: assessmentId, userId: userId }).session(session);
//     if (!submission || !submission.verified) {
//       return res.status(403).json({
//         success: false,
//         message: "You Are Not Authorized For this Course",
//       });
//     }

//     // Fetch the assignment
//     const newAssignments = await NewAssignments.findById(assessmentId).session(session);
//     if (!newAssignments) {
//       return res.status(404).json({
//         success: false,
//         message: "Assignment Not Found",
//       });
//     }



//     // // Validate course and task dates
//     // const todaysDate = Date.now(); // Assuming DateNumber1 is a helper function for formatting
//     // if (DateNumber1(newAssignments?.startDate) > todaysDate) {
//     //   return res.status(403).json({ success: false, message: "Course Not Started" });
//     // }
//     // if (DateNumber1(newAssignments?.dueDate) < todaysDate) {
//     //   return res.status(403).json({ success: false, message: "Course Completed" });
//     // }



//     // Check for proficiency test if mandatory
//     if (newAssignments.profMandatory && (!submission.initialDone || !(submission.preTest?.length > 0))) {
//       return res.status(403).json({
//         success: false,
//         message: "Please Complete Proficiency Test",
//       });
//     }

//     // Validate task submission period
//     const task = newAssignments.alltasks.find(task => task._id == assignmentId);
//     if (!task) {
//       return res.status(404).json({ success: false, message: "Task Not Found" });
//     }



//     // if (DateNumber1(task.startDate) > todaysDate) {
//     //   return res.status(403).json({ success: false, message: "Task Submission Not Started" });
//     // }
//     // if (DateNumber1(task.lastDate) < todaysDate) {
//     //   return res.status(403).json({ success: false, message: "Task Submission Time Expired" });
//     // }



//     // Check if the assessment has already been submitted
//     const existingAssessment = await Assessment.findOne({ assignmentId , userId }).session(session);

//     if (existingAssessment || existingAssessment?.userQuestions[0]?.myfile?.length > 0) {
//       return res.status(409).json({ success: false, message: "Your submission has already been received." });
//     }

//     // Upload files
//     const supportedTypes = ["pdf"];
//     let errors = [];
//     const uploadPromises = files.map(file => {
//       const fileType = path.extname(file.name).toLowerCase().slice(1);
//       if (!supportedTypes.includes(fileType)) {
//         errors.push(`${file.name}: Unsupported file type.`);
//         return null;
//       }
//       return uploadFileToCloudinary(file, "Assignments")
//         .then(response => ({ filename: file.name, fileurl: response.secure_url }))
//         .catch(err => {
//           errors.push(`${file.name}: Failed to upload due to ${err.message}`);
//           return null;
//         });
//     });

//     const responses = (await Promise.all(uploadPromises)).filter(r => r != null);

//     console.log(responses);

//     if (responses.length === 0) {
//       await session.abortTransaction();
//       return res.status(500).json({ success: false, message: "Failed to upload any files.", errors });
//     }

//     if (errors.length > 0) {
//       await session.abortTransaction();
//       return res.status(400).json({ success: false, message: "Failed to upload some files.", errors });
//     }

//     // Create a new assessment
//     const newAssessment = new Assessment({
//       assignmentId,
//       assignmentTopic,
//       assignmentType,
//       userId,
//       userQuestions:[{
//         myfile: responses
//       }]
//     });
//     await newAssessment.save({ session });

//     // Update submission
//     submission.courses.push({ assessment: newAssessment._id });
//     await submission.save({ session });

//     // Commit transaction
//     await session.commitTransaction();
//     session.endSession();

//     return res.status(200).json({ success: true, message: "Submitted successfully", newAssessment });

//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     console.error("Failed to submit assessment:", error);
//     return next(error);
//   }
// };


exports.selfSubmit = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { assessmentId, userId } = req.params;
    const { assignmentId, assignmentTopic, assignmentType } = req.body;
    let files = req.files ? req.files.file : null;

    if (!files || (Array.isArray(files) && files.length === 0)) {
      return res.status(400).json({
        success: false,
        message: "No files were uploaded."
      });
    }

    if (!Array.isArray(files)) {
      files = [files];
    }

    // Validate required parameters
    if (!userId || !assessmentId || !assignmentId) {
      return res.status(400).json({ success: false, message: "All parameters are required." });
    }

    // Validate user authorization for the course
    const submission = await newCourse.findOne({ assignmentId: assessmentId, userId: userId }).session(session);
    if (!submission || !submission.verified) {
      return res.status(403).json({
        success: false,
        message: "You Are Not Authorized For this Course",
      });
    }

    // Fetch the assignment
    const newAssignments = await NewAssignments.findById(assessmentId).session(session);
    if (!newAssignments) {
      return res.status(404).json({
        success: false,
        message: "Assignment Not Found",
      });
    }

    // Check for proficiency test if mandatory
    if (newAssignments.profMandatory && (!submission.initialDone || !(submission.preTest?.length > 0))) {
      return res.status(403).json({
        success: false,
        message: "Please Complete Proficiency Test",
      });
    }

    // Validate task submission period
    const task = newAssignments.alltasks.find(task => task._id == assignmentId);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task Not Found" });
    }

    // Check if the assessment has already been submitted
    const existingAssessment = await Assessment.findOne({ assignmentId, userId }).session(session);

    // Modify the existing check to handle null/undefined case
    if (existingAssessment && 
        existingAssessment.userQuestions && 
        existingAssessment.userQuestions.length > 0 && 
        existingAssessment.userQuestions[0]?.myfile?.length > 0) {
      return res.status(409).json({ success: false, message: "Your submission has already been received." });
    }

    // Upload files
    const supportedTypes = ["pdf"];
    let errors = [];
    const uploadPromises = files.map(file => {
      const fileType = path.extname(file.name).toLowerCase().slice(1);
      if (!supportedTypes.includes(fileType)) {
        errors.push(`${file.name}: Unsupported file type.`);
        return null;
      }
      return uploadFileToCloudinary(file, "Assignments")
        .then(response => ({ filename: file.name, fileurl: response.secure_url }))
        .catch(err => {
          errors.push(`${file.name}: Failed to upload due to ${err.message}`);
          return null;
        });
    });

    const responses = (await Promise.all(uploadPromises)).filter(r => r != null);

    console.log(responses);

    if (responses.length === 0) {
      await session.abortTransaction();
      return res.status(500).json({ success: false, message: "Failed to upload any files.", errors });
    }

    if (errors.length > 0) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: "Failed to upload some files.", errors });
    }

    // Create or update the assessment
    let newAssessment;

    if (existingAssessment) {
      existingAssessment.userQuestions = [{
        myfile: responses
      }];

      newAssessment = await existingAssessment.save({ session });
    } else {
      newAssessment = new Assessment({
        assignmentId,
        assignmentTopic,
        assignmentType,
        userId,
        userQuestions:[{
          myfile: responses
        }]
      });
      await newAssessment.save({ session });
    }

    // Update submission
    submission.courses.push({ assessment: newAssessment._id });
    await submission.save({ session });

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({ success: true, message: "Submitted successfully", newAssessment });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Failed to submit assessment:", error);
    return next(error);
  }
};

exports.selfAssessmentSubmit = async (req, res, next) => {

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { assessmentId , userId } = req.params;

    const { assignmentId , selftotal, marksGot, userfinalResponses } = req.body;

  

    // Validate required parameters
    if (!userId || !assessmentId || !assignmentId) {
      return res.status(400).json({ success: false, message: "All parameters are required." });
    }

    // Validate user authorization for the course
    const submission = await newCourse.findOne({ assignmentId: assessmentId, userId: userId }).session(session);
    if (!submission || !submission.verified) {
      return res.status(403).json({
        success: false,
        message: "You Are Not Authorized For this Course",
      });
    }

    // Fetch the assignment
    const newAssignments = await NewAssignments.findById(assessmentId).session(session);
    if (!newAssignments) {
      return res.status(404).json({
        success: false,
        message: "Assignment Not Found",
      });
    }

    // Validate course and task dates
    // const todaysDate = Date.now(); // Assuming DateNumber1 is a helper function for formatting
    // if (DateNumber1(newAssignments?.startDate) > todaysDate) {
    //   return res.status(403).json({ success: false, message: "Course Not Started" });
    // }
    // if (DateNumber1(newAssignments?.dueDate) < todaysDate) {
    //   return res.status(403).json({ success: false, message: "Course Completed" });
    // }


    // Check for proficiency test if mandatory
    if (newAssignments.profMandatory && (!submission.initialDone || !(submission.preTest?.length > 0))) {
      return res.status(403).json({
        success: false,
        message: "Please Complete Proficiency Test",
      });
    }

    // Validate task submission period
    const task = newAssignments.alltasks.find(task => task._id == assignmentId);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task Not Found" });
    }


    // if (DateNumber1(task.startDate) > todaysDate) {
    //   return res.status(403).json({ success: false, message: "Task Submission Not Started" });
    // }
    // if (DateNumber1(task.lastDate) < todaysDate) {
    //   return res.status(403).json({ success: false, message: "Task Submission Time Expired" });
    // }


    // Check if the assessment has already been submitted
    const existingAssessment = await Assessment.findOne({ assignmentId , userId }).session(session);
    
    if (!existingAssessment && !existingAssessment?.userQuestions[0]?.myfile?.length > 0) {

      return res.status(409).json({ success: false, message: "Submit Your Self Assessment File" });

    }

    if (existingAssessment && existingAssessment?.userQuestions[0]?.submitted) {

      return res.status(409).json({ success: false, message: "Your Self Assessment Has Already Been Submitted" });

    }

    
    existingAssessment.userQuestions[0].submitted = true;
    existingAssessment.userQuestions[0].totalMark = selftotal;
    existingAssessment.userQuestions[0].totalMarkGot = marksGot;
    existingAssessment.userQuestions[0].response = userfinalResponses;

    await existingAssessment.save({ session });

  

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({ success: true, message: "Submitted successfully", existingAssessment });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Failed to submit assessment:", error);
    return next(error);
  }
};




exports.PeerAssessment = async (req, res, next) => {
  try {
    let mergedArray = [];
    let peertotal = req.body.totalMark || 0; 
    let files = req.files ? req.files.file : null;

    // Check if files are uploaded
    if (!files || (Array.isArray(files) && files.length === 0)) {
      return res.status(400).json({
        success: false,
        message: "No files were uploaded."
      });
    }

    // Ensure files is an array
    if (!Array.isArray(files)) {
      files = [files];
    }

    // Extract parameters from request
    const { userId, assessmentId , courseId } = req.params;

    console.log(req.params);
    console.log(req.body);

    // Validate user authorization for the course
    const userSubmission = await newCourse.findOne({ assignmentId: courseId, userId: userId });

    if (!userSubmission || !userSubmission.verified) {
      return res.status(403).json({
        success: false,
        message: "You Are Not Authorized For this Course",
      });
    }


    // Fetch the assignment
    const newAssignments = await NewAssignments.findById(courseId);
    if (!newAssignments) {
      return res.status(404).json({
        success: false,
        message: "Assignment Not Found",
      });
    }

    // Check if the course dates are valid
    // if (newAssignments && (DateNumber1(newAssignments?.startDate) > todaysDate)) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Course Not Started",
    //   })
    // }


    // if (newAssignments && (DateNumber1(newAssignments?.dueDate) < todaysDate)) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Course Completed",
    //   })
    // }

    // Check if proficiency test is mandatory and not completed
    if (newAssignments.profMandatory && (!userSubmission.initialDone || !userSubmission.preTest?.length > 0)) {
      return res.status(403).json({
        success: false,
        message: "Please Complete Proficiency Test",
      });
    }

    // Validate task submission period
    const task = newAssignments.alltasks.find(task => task._id == assessmentId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task Not Found",
      });
    }

    // if (DateNumber1(task.startDate) > todaysDate) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Task Submission Not Started",
    //   });
    // }

    // if (DateNumber1(task.lastDate) < todaysDate) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Task Submission Time Expired",
    //   });
    // }

    // Validate if user has submitted self-assessment
    let submission = await Assessment.findOne({ assignmentId: assessmentId, userId: userId });

    if (!submission || !submission.userQuestions[0]?.submitted) {
      return res.status(404).json({ success: false, message: 'Submit the self-assessment first.' });
    }

    // Check if peer assessment already submitted
    if (submission.peerQuestions[0]?.myfile?.length > 0) {
      return res.status(409).json({ success: false, message: 'Your submission has already been received.' });
    }

    // Find peer assessments
    const assessments = await Assessment.find({ assignmentId: assessmentId });
    if (assessments.length === 0) {
      return res.status(404).json({ success: false, message: "No peers available for assessment" });
    }

    // Filter out the user's own assessment and those already assigned
    const filteredAssessments = assessments.filter(assessment => {
      return String(assessment.userId) !== userId && !assessment.retrieveId;
    });

    if (filteredAssessments.length === 0) {
      return res.status(404).json({ success: false, message: "No peers available for assessment" });
    }

    // Select a random peer assessment
    const randomIndex = Math.floor(Math.random() * filteredAssessments.length);
    const randomPeer = filteredAssessments[randomIndex];

    if (!randomPeer) {
      return res.status(404).json({ success: false, message: "Random peer not found" });
    }

    // Upload files to cloudinary
    const supportedTypes = ["pdf"];
    let errors = [];
    const uploadPromises = files.map(file => {
      const fileType = path.extname(file.name).toLowerCase().slice(1);
      if (!supportedTypes.includes(fileType)) {
        errors.push(`${file.name}: Unsupported file type.`);
        return null;
      }
      return uploadFileToCloudinary(file, "Assignments")
        .then(response => ({ filename: file.name, fileurl: response.secure_url }))
        .catch(err => {
          errors.push(`${file.name}: Failed to upload due to ${err.message}`);
          return null;
        });
    });

    const responses = (await Promise.all(uploadPromises)).filter(r => r != null);

    if (responses.length === 0) {
      return res.status(500).json({
        success: false,
        message: "Failed to upload any files.",
        errors
      });
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Failed to upload some files.",
        errors
      });
    }

    mergedArray = [...responses];

    // Update user's submission
    submission.peerQuestions = submission.peerQuestions || [];
    submission.peerQuestions[0] = submission.peerQuestions[0] || {};
    submission.peerQuestions[0].myfile = mergedArray;
    submission.peerQuestions[0].totalMark = peertotal;

    await submission.save();

    // Update peer's submission
    randomPeer.peerQuestions = randomPeer.peerQuestions || [];
    randomPeer.peerQuestions[0] = randomPeer.peerQuestions[0] || {};
    randomPeer.peerQuestions[0].peerfile = mergedArray;
    randomPeer.retrieveId = submission._id;

    await randomPeer.save();

    return res.status(200).json({
      success: true,
      message: "Peer Test Submitted successfully",
      submission
    });
  } catch (error) {
    console.error("Peer assessment submission failed:", error);
    return next(error);
  }
};





// exports.PeerSubmission = async (req, res, next) => {
//   try {

//     const userId = req.params.userId;
//     const assessmentId = req.params.assessmentId;

//     const { peerfinalResponses, marksGot2, AssignmentId } = req.body



//     const assignment = await newCourse.findOne({ userId: userId, assignmentId: AssignmentId });

//     if (!assignment || !assignment.verified) {
//       return res.status(403).json({
//         success: false,
//         message: "You are not authorized to submit this assignment.",
//       });
//     }

//     // Fetch the assignment
//     const newAssignments = await NewAssignments.findById(assessmentId);
//     if (!newAssignments) {
//       return res.status(404).json({
//         success: false,
//         message: "Assignment Not Found",
//       });
//     }

//     // Check if the course dates are valid
//     if (new Date(newAssignments.startDate) > new Date()) {
//       return res.status(403).json({
//         success: false,
//         message: "Course Not Started",
//       });
//     }

//     if (new Date(newAssignments.dueDate) < new Date()) {
//       return res.status(403).json({
//         success: false,
//         message: "Course Completed",
//       });
//     }

//     // Check if proficiency test is mandatory and not completed
//     if (newAssignments.profMandatory && (!userSubmission.initialDone || !userSubmission.preTest?.length > 0)) {
//       return res.status(403).json({
//         success: false,
//         message: "Please Complete Proficiency Test",
//       });
//     }

//     // Validate task submission period
//     const task = newAssignments.alltasks.find(task => task._id == req.body.assignmentId);
//     if (!task) {
//       return res.status(404).json({
//         success: false,
//         message: "Task Not Found",
//       });
//     }

//     if (new Date(task.startDate) > new Date()) {
//       return res.status(403).json({
//         success: false,
//         message: "Task Submission Not Started",
//       });
//     }

//     if (new Date(task.lastDate) < new Date()) {
//       return res.status(403).json({
//         success: false,
//         message: "Task Submission Time Expired",
//       });
//     }





//     let submission = await Assessment.findOne({ assignmentId: assessmentId, userId: userId });

//     if (!submission) {
//       throw new Error('Submission not found');
//     }


//     if (submission.peerQuestions[0]?.submitted ) {
//       throw new Error('Your Response has already been submitted');
//     }


//     if (!submission.peerQuestions[0]?.myfile.length > 0 || !submission.userQuestions[0]?.submitted) {
//       throw new Error('Complete Previous Submission First');
//     }

//     // console.log("Submission:", submission.retrieveId);

//     const peersubmition = await Assessment.findById({ _id: submission.retrieveId });

//     if (!peersubmition) {
//       throw new Error('Peer submission not found');
//     }

//     peersubmition.peerQuestions[0].response = peerfinalResponses;
//     peersubmition.peerQuestions[0].totalMarkGot = marksGot2;
//     await peersubmition.save();


//     submission.peerQuestions[0].submitted = true;
//     await submission.save();

//     console.log("Random Peer Submission:", peersubmition);

//     return res.status(200).json({
//       success: true,
//       message: "Peer response submitted successfully",
//     });
//   } catch (error) {
//     console.error("An error occurred during Peer response submission:", error);
//     next(error);
//   }
// };


exports.PeerSubmission = async (req, res, next) => {
  try {
    const { userId, assessmentId } = req.params;

    const { peerfinalResponses, marksGot2, AssignmentId } = req.body;

    console.log(assessmentId)
    console.log(AssignmentId)

    // Validate user authorization for the course
    const assignment = await newCourse.findOne({ userId: userId, assignmentId: AssignmentId });
    if (!assignment || !assignment.verified) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to submit this assignment.",
      });
    }

    // Fetch the assignment
    const newAssignments = await NewAssignments.findById(AssignmentId);
    if (!newAssignments) {
      return res.status(404).json({
        success: false,
        message: "Assignment Not Found",
      });
    }

    // Check if the course dates are valid
    // if (newAssignments && (DateNumber1(newAssignments?.startDate) > todaysDate)) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Course Not Started",
    //   })
    // }


    // if (newAssignments && (DateNumber1(newAssignments?.dueDate) < todaysDate)) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Course Completed",
    //   })
    // }

    // Check if proficiency test is mandatory and not completed
    if (newAssignments.profMandatory && (!assignment.initialDone || !assignment.preTest?.length > 0)) {
      return res.status(403).json({
        success: false,
        message: "Please Complete Proficiency Test",
      });
    }

    // Validate task submission period
    const task = newAssignments.alltasks.find(task => task._id == assessmentId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task Not Found",
      });
    }

    // if (DateNumber1(task.startDate) > todaysDate) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Task Submission Not Started",
    //   });
    // }

    // if (DateNumber1(task.lastDate) < todaysDate) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Task Submission Time Expired",
    //   });
    // }

    // Find user submission
    const submission = await Assessment.findOne({ assignmentId: assessmentId, userId: userId });
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    // Check if peer response has already been submitted
    if (submission.peerQuestions[0]?.submitted) {
      return res.status(409).json({ success: false, message: 'Your Response has already been submitted' });
    }

    // Ensure previous submissions are completed
    if (!submission.peerQuestions[0]?.myfile.length > 0 || !submission.userQuestions[0]?.submitted) {
      return res.status(400).json({ success: false, message: 'Complete Previous Submission First' });
    }

    // Find peer submission
    const peersubmission = await Assessment.findById(submission.retrieveId);
    if (!peersubmission) {
      return res.status(404).json({ success: false, message: 'Peer submission not found' });
    }

    // Update peer submission with responses
    peersubmission.peerQuestions[0].response = peerfinalResponses;
    peersubmission.peerQuestions[0].totalMarkGot = marksGot2;
    await peersubmission.save();

    // Mark user's peer submission as submitted
    submission.peerQuestions[0].submitted = true;
    await submission.save();

    console.log("Random Peer Submission:", peersubmission);

    return res.status(200).json({
      success: true,
      message: "Peer response submitted successfully",
    });
  } catch (error) {
    console.error("An error occurred during Peer response submission:", error);
    next(error);
  }
};




exports.GetAllSubmission = async (req, res, next) => {
  try {
    // fetch profile id
    const assessmentId = req.params.assessmentId;

    if (!assessmentId) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found",


      });
    }

    const Allsubmission = await newCourse.find({ assignmentId: assessmentId })
      .populate({
        path: 'userId',
        populate: { path: 'profile' },
        select: '-password', // Exclude the password field
      })
      .exec();

    if (!Allsubmission) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found",


      });
    }

    return res.status(200).json({
      success: true,
      message: "All submission sent successfully",
      Allsubmission,
    });
  } catch (error) {
    return next(error);
  }
};



exports.TeacherSubmission = async (req, res, next) => {
  try {
    let files = req.files ? req.files.file : null;

    const { userId, assessmentId, courseId: AssignmentId } = req.params;

    // Validate user authorization for the course
    const assignment = await newCourse.findOne({ userId: userId, assignmentId: AssignmentId });
    if (!assignment || !assignment.verified) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to submit this assignment.",
      });
    }

    // Fetch the assignment
    const newAssignments = await NewAssignments.findById(AssignmentId);
    if (!newAssignments) {
      return res.status(404).json({
        success: false,
        message: "Assignment Not Found",
      });
    }

    // Check if the course dates are valid
    // const currentDate = new Date();
    // if (newAssignments && (DateNumber1(newAssignments?.startDate) > todaysDate)) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Course Not Started",
    //   })
    // }


    // if (newAssignments && (DateNumber1(newAssignments?.dueDate) < todaysDate)) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Course Completed",
    //   })
    // }

    // Check if proficiency test is mandatory and not completed
    if (newAssignments.profMandatory && (!assignment.initialDone || !assignment.preTest?.length > 0)) {
      return res.status(403).json({
        success: false,
        message: "Please Complete Proficiency Test",
      });
    }

    // Validate task submission period
    const task = newAssignments.alltasks.find(task => task._id == assessmentId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task Not Found",
      });
    }


    // if (DateNumber1(task.startDate) > todaysDate) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Task Submission Not Started",
    //   });
    // }

    // if (DateNumber1(task.lastDate) < todaysDate) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Task Submission Time Expired",
    //   });
    // }


    if (!files.length > 0 && files[0] === null) {
      return res.status(400).json({
        success: false,
        message: "No files were uploaded."
      });


    }

    if (!Array.isArray(files)) {
      files = [files];
    }



    // Validate submission status
    let submission = await Assessment.findOne({ assignmentId: assessmentId, userId: userId });
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    if (!submission.userQuestions[0]?.submitted || !submission.peerQuestions[0]?.submitted) {
      return res.status(400).json({ success: false, message: 'Complete the previous submission first' });
    }

    if (submission.expertQuestions[0]?.myfile?.length > 0) {
      return res.status(400).json({ success: false, message: 'Your submission has already been sent to expert' });
    }

    submission.expertQuestions = submission.expertQuestions || [];

    // File upload and validation
    const supportedTypes = ["pdf"];
    let errors = [];

    const uploadPromises = files.map(file => {
      const fileType = path.extname(file.name).toLowerCase().slice(1);
      if (!supportedTypes.includes(fileType)) {
        errors.push(`${file.name}: Unsupported file type.`);
        return null;
      }
      return uploadFileToCloudinary(file, "Assignments")
        .then(response => ({ filename: file.name, fileurl: response.secure_url }))
        .catch(err => {
          errors.push(`${file.name}: Failed to upload due to ${err.message}`);
          return null;
        });
    });

    const responses = (await Promise.all(uploadPromises)).filter(r => r != null);

    if (responses.length === 0) {
      return res.status(500).json({
        success: false,
        message: "Failed to upload any files.",
        errors
      });
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Failed to upload some files.",
        errors
      });
    }

    // Update submission with uploaded files
    submission.expertQuestions[0] = {
      submitted: false,
      myfile: responses,
    };

    await submission.save();

    return res.status(200).json({
      success: true,
      message: "Teacher file submitted successfully",
    });
  } catch (error) {
    console.error("An error occurred during Teacher submission:", error);
    next(error);
  }
};



// exports.TeacherSubmission = async (req, res, next) => {
//   try {

//     let mergedArray = [];
//     let files = req.files ? req.files.file : null;

//     const userId = req.params.userId;
//     const assessmentId = req.params.assessmentId;
//     const AssignmentId = req.params.courseId;


//     const assignment = await newCourse.findOne({ userId: userId, assignmentId: AssignmentId });

//     if (!assignment || !assignment.verified) {
//       return res.status(403).json({
//         success: false,
//         message: "You are not authorized to submit this assignment.",
//       });
//     }

//     // Fetch the assignment
//     const newAssignments = await NewAssignments.findById(assessmentId);
//     if (!newAssignments) {
//       return res.status(404).json({
//         success: false,
//         message: "Assignment Not Found",
//       });
//     }

//     // Check if the course dates are valid
//     if (new Date(newAssignments.startDate) > new Date()) {
//       return res.status(403).json({
//         success: false,
//         message: "Course Not Started",
//       });
//     }

//     if (new Date(newAssignments.dueDate) < new Date()) {
//       return res.status(403).json({
//         success: false,
//         message: "Course Completed",
//       });
//     }

//     // Check if proficiency test is mandatory and not completed
//     if (newAssignments.profMandatory && (!assignment.initialDone || !assignment.preTest?.length > 0)) {
//       return res.status(403).json({
//         success: false,
//         message: "Please Complete Proficiency Test",
//       });
//     }

//     // Validate task submission period
//     const task = newAssignments.alltasks.find(task => task._id == req.body.assignmentId);
//     if (!task) {
//       return res.status(404).json({
//         success: false,
//         message: "Task Not Found",
//       });
//     }

//     if (new Date(task.startDate) > new Date()) {
//       return res.status(403).json({
//         success: false,
//         message: "Task Submission Not Started",
//       });
//     }

//     if (new Date(task.lastDate) < new Date()) {
//       return res.status(403).json({
//         success: false,
//         message: "Task Submission Time Expired",
//       });
//     }



//     if (!files?.length > 0 && files[0] === null) {
//       return res.status(400).json({
//         success: false,
//         message: "No files were uploaded."
//       });


//     }

//     if (!Array.isArray(files)) {
//       files = [files];
//     }










//     let submission = await Assessment.findOne({ assignmentId: assessmentId, userId: userId });


//     if (!submission) {
//       return res.status(404).json({ success: false, message: 'Submission not found' });
//     }

//     if (submission && !submission.userQuestions[0]?.submitted && !submission.peerQuestions[0]?.submitted) {
//       return res.status(404).json({ success: false, message: 'Complete the previous submission First' });
//     }

//     if (submission && submission.expertQuestions[0]?.myfile?.length > 0) {
//       return res.status(400).json({ success: false, message: 'Your Submission has already been Sent To Expert' });
//     }


//     submission.expertQuestions = submission.expertQuestions || [];




//     const supportedTypes = ["pdf"];
//     let errors = [];

//     const uploadPromises = files.map(file => {
//       const fileType = path.extname(file.name).toLowerCase().slice(1);
//       if (!supportedTypes.includes(fileType)) {
//         errors.push(`${file.name}: Unsupported file type.`);
//         return null;
//       }
//       return uploadFileToCloudinary(file, "Assignments")
//         .then(response => ({ filename: file.name, fileurl: response.secure_url }))
//         .catch(err => {
//           errors.push(`${file.name}: Failed to upload due to ${err.message}`);
//           return null;
//         });
//     });

//     const responses = (await Promise.all(uploadPromises)).filter(r => r != null);

//     if (responses.length === 0) {
//       return res.status(500).json({
//         success: false,
//         message: "Failed to upload any files.",
//         errors
//       });
//     }

//     if (errors.length > 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Failed to upload some files.",
//         errors
//       });
//     }

//     mergedArray = [...responses];





//     submission.expertQuestions[0] = {
//       submitted: false,
//       myfile: mergedArray,

//     };
//     await submission.save();


//     return res.status(200).json({
//       success: true,
//       message: "Teacher file submitted successfully",
//     });
//   } catch (error) {
//     console.error("An error occurred during Peer response submission:", error);
//     next(error);
//   }
// };



exports.GetSubmissionSearch = async (req, res, next) => {
  try {
    let searchTerm = req.query.searchTerm;
    const assessmentId = req.params.assessmentId;



    const Alluser = await newCourse.find({ assignmentId: assessmentId })
      .populate({
        path: 'userId',
        populate: {
          path: 'profile',
          match: {
            $or: [
              { firstname: { $regex: searchTerm, $options: 'i' } },
              { lastname: { $regex: searchTerm, $options: 'i' } },
              { branch: { $regex: searchTerm, $options: 'i' } },
              { email: { $regex: searchTerm, $options: 'i' } },
              { rollnumber: { $regex: searchTerm, $options: 'i' } },
            ],
          },
        },
        select: '-password',
      })
      .exec();

    if (!searchTerm) {
      const Alluser = await Assessment.find({ assignmentId: assessmentId })
        .populate({
          path: 'userId',
          populate: {
            path: 'profile',
          },
          select: '-password',
        })
        .exec();
    }


    console.log(Alluser);


    // Filter out users whose profile does not match the search term
    const filteredUsers = Alluser.filter(user => user.userId.profile !== null);

    console.log(filteredUsers);

    return res.status(200).json({
      success: true,
      message: 'Users fetched successfully',
      users: filteredUsers,
    });
  } catch (error) {
    next(error);
  }
};





// exports.FinalTask = async (req, res, next) => {
//   try {
//     let mergedArray = [];

//     const userId = req.params.userId;
//     const assessmentId = req.params.assessmentId;

//     // console.log(req.body)


//     let files = req.files ? req.files.file : null;


//     const newAssignments = await NewAssignments.findById(assessmentId);

//   // Fetch the assignment
//   if (!newAssignments) {
//     return res.status(404).json({
//       success: false,
//       message: "Assignment Not Found",
//     });
//   }





//   // Validate user authorization for the course
//   const assignment = await newCourse.findOne({ userId: userId, assignmentId: assessmentId });

//   if (!assignment || !assignment.verified) {
//     return res.status(403).json({
//       success: false,
//       message: "You are not authorized to submit this assignment.",
//     });
//   }


//   // Check if the course dates are valid
//   const currentDate = new Date();
//   if (new Date(newAssignments.startDate) > currentDate) {
//     return res.status(403).json({
//       success: false,
//       message: "Course Not Started",
//     });
//   }

//   if (new Date(newAssignments.dueDate) < currentDate) {
//     return res.status(403).json({
//       success: false,
//       message: "Course Completed",
//     });
//   }



//   // Check if proficiency test is mandatory and not completed
//   if ((!assignment.initialDone || !assignment.preTest?.length > 0)) {
//     return res.status(403).json({
//       success: false,
//       message: "Please Complete Pre Test",
//     });
//   }







//     if (!files?.length > 0 && files[0] === null) {
//       return res.status(400).json({
//         success: false,
//         message: "No files were uploaded."
//       });


//     }

//     if (!Array.isArray(files)) {
//       files = [files];
//     }


//     if (!assignment ) {
//       throw new Error('Submission not found');
//     }


//     if (assignment?.completed && assignment?.postTest?.length > 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Already Submitted"
//       })
//     }


//     const supportedTypes = ["pdf"];

//     let errors = [];

//     const uploadPromises = files.map(file => {
//       const fileType = path.extname(file.name).toLowerCase().slice(1);
//       if (!supportedTypes.includes(fileType)) {
//         errors.push(`${file.name}: Unsupported file type.`);
//         return null;
//       }
//       return uploadFileToCloudinary(file, "Assignments")
//         .then(response => ({ filename: file.name, fileurl: response.secure_url }))
//         .catch(err => {
//           errors.push(`${file.name}: Failed to upload due to ${err.message}`);
//           return null;
//         });
//     });

//     const responses = (await Promise.all(uploadPromises)).filter(r => r != null);

//     mergedArray = [...responses];

//     console.log(mergedArray)

//     if (responses.length === 0) {
//       return res.status(500).json({
//         success: false,
//         message: "Failed to upload any files.",
//         errors
//       });
//     }

//     if (errors.length > 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Failed to upload some files.",
//         errors
//       });
//     }






//     assignment.postTest = mergedArray;
//     assignment.completed = true;
//     await assignment.save();



//     return res.status(200).json({
//       success: true,
//       message: "Final File Submitted successfully",
//     });
//   } catch (error) {
//     console.error("An error occurred during file submission:", error);
//     next(error);
//   }
// };



exports.FinalTask = async (req, res, next) => {
  try {
    const { userId, assessmentId } = req.params;
    let files = req.files ? req.files.file : null;

    // Fetch the assignment
    const newAssignments = await NewAssignments.findById(assessmentId);
    if (!newAssignments) {
      return res.status(404).json({
        success: false,
        message: "Assignment Not Found",
      });
    }

    // Validate user authorization for the course
    const assignment = await newCourse.findOne({ userId, assignmentId: assessmentId });
    if (!assignment || !assignment.verified) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to submit this assignment.",
      });
    }

    // Check if the course dates are valid
    const currentDate = new Date();


    // if (newAssignments && (DateNumber1(newAssignments?.startDate) > todaysDate)) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Course Not Started",
    //   })
    // }


    // if (newAssignments && (DateNumber1(newAssignments?.dueDate) < todaysDate)) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Course Completed",
    //   })
    // }

    // Check if proficiency test is mandatory and not completed
    if (!assignment.initialDone || !assignment.preTest?.length) {
      return res.status(403).json({
        success: false,
        message: "Please Complete Pre Test",
      });
    }

    // Check if files are uploaded
    if (!files?.length && files[0] === null) {
      return res.status(400).json({
        success: false,
        message: "No files were uploaded."
      });
    }

    // Ensure files is an array
    if (!Array.isArray(files)) {
      files = [files];
    }

    if (assignment.completed && assignment.postTest?.length) {
      return res.status(400).json({
        success: false,
        message: "Already Submitted"
      });
    }

    // File upload and validation
    const supportedTypes = ["pdf"];
    let errors = [];
    const uploadPromises = files.map(file => {
      const fileType = path.extname(file.name).toLowerCase().slice(1);
      if (!supportedTypes.includes(fileType)) {
        errors.push(`${file.name}: Unsupported file type.`);
        return null;
      }
      return uploadFileToCloudinary(file, "Assignments")
        .then(response => ({ filename: file.name, fileurl: response.secure_url }))
        .catch(err => {
          errors.push(`${file.name}: Failed to upload due to ${err.message}`);
          return null;
        });
    });

    const responses = (await Promise.all(uploadPromises)).filter(r => r != null);

    if (responses.length === 0) {
      return res.status(500).json({
        success: false,
        message: "Failed to upload any files.",
        errors
      });
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Failed to upload some files.",
        errors
      });
    }

    // Update assignment with uploaded files
    assignment.postTest = responses;
    assignment.completed = true;
    await assignment.save();

    return res.status(200).json({
      success: true,
      message: "Final File Submitted successfully",
    });
  } catch (error) {
    console.error("An error occurred during file submission:", error);
    next(error);
  }
};









exports.ExpertFeedback = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const assessmentId = req.params.assessmentId;

    const { feedback } = req.body;
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback Not found",


      });
    }
    console.log(req.body);
    let submission = await newCourse.findOne({ assignmentId: assessmentId, userId: userId });

    if (!submission) {
      throw new Error('Submission not found');
    }

    submission.commonfeedback = feedback;

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





// delte user Submission 
exports.DeleteUserSubmission = async (req, res, next) => {

  try {
    const id = req.params.id;
    const userIds = req.body.userIds;

    if (!userIds || userIds.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No user IDs provided",
      });
    }

    const idsToDelete = userIds.map(id => new mongoose.Types.ObjectId(id));

    // Delete submissions from newCourse collection
    await newCourse.deleteMany({ assignmentId: id, userId: { $in: idsToDelete } });

    // Delete submissions from Assessment collection
    await Assessment.deleteMany({ assignmentId: id, userId: { $in: idsToDelete } });

    // Update User collection to remove deleted submissions from courses array
    await User.updateMany(
      { _id: { $in: idsToDelete } },
      { $pull: { courses: { assessment: id } } }
    );

    // Fetch all submissions for the assignment
    const Allsubmission = await newCourse.find({ assignmentId: id })
      .populate({
        path: 'userId',
        populate: { path: 'profile' },
        select: '-password',
      });

    if (!Allsubmission) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Users Deleted successfully",
      Allsubmission
    });
  } catch (error) {
    next(error);
  }
};




exports.VerifyUserSubmission = async (req, res, next) => {
  try {
    const id = req.params.id;
    console.log(req.params.id);

    const userIds = req.body.userIds; // Assuming you're passing an array of userIds in req.body.userIds

    // Check if userIds array is empty
    if (userIds.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No user found",
      });
    }

    // Convert userIds to MongoDB ObjectIds
    const idsToVerify = userIds.map(id => new mongoose.Types.ObjectId(id));

    // Update documents in newCourse collection
    const result = await newCourse.updateMany(
      { assignmentId: id, userId: { $in: idsToVerify } },
      { verified: true }
    );


    // Update documents in User collection
    for (const userId of idsToVerify) {
      const courseId = await newCourse.findOne({ assignmentId: id, userId: userId });

      await User.updateOne(
        { _id: userId },
        {
          $addToSet: {
            courses: {
              assessment: id,
              course: courseId,
              verified: true
            }
          }
        }
      );
    }

    // Find and populate all submissions for the assignment
    const Allsubmission = await newCourse.find({ assignmentId: id })
      .populate({
        path: 'userId',
        populate: { path: 'profile' },
        select: '-password', // Exclude the password field
      })
      .exec();

    if (!Allsubmission) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found",
      });
    }

    // Send response with success message and all submissions
    return res.status(200).json({
      success: true,
      message: "Users Verified successfully",
      Allsubmission
    });

  } catch (error) {
    next(error); // Pass error to the error handling middleware
  }
};

