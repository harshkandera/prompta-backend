const express = require("express");
const router = express.Router();
const {auth,isStudent,isAdmin, isExpert} = require("../middlewares/auth")
const {SendOTP , Signup, login,ForgotPass,ChangePass,RequestAuthorizeCourse }=require("../controllers/Auth")
const {ProfileUpdate,Getprofile,Getuser,GetUserCourses} = require ("../controllers/ProfileUpdate")
const {Assignment} = require('../controllers/NewAssigment')
const {NewAssessment,Getsubmission,Getcourse,PeerAssessment,PeerSubmission,TeacherSubmission,FinalSubmission,FinalTask,selfSubmit , selfAssessmentSubmit} = require("../controllers/Submission")
const {Sendchat,Getchat,Allchat} = require('../controllers/ChatApp')


// authroutes
router.post("/signup",Signup);
router.post("/sendotp",SendOTP);
router.post("/login",login);
router.post("/forgot_password",ForgotPass);
router.post("/change_password",ChangePass);


// students routes

// post
router.post("/profileupdate",auth,ProfileUpdate);
router.post("/new_assessment/:userId/:assessmentId",auth,isStudent,NewAssessment);
router.post("/peer_assessment/:userId/:assessmentId/:courseId",PeerAssessment);
router.post("/peer_submission/:userId/:assessmentId",PeerSubmission);
router.post("/teacher_assessment/:userId/:assessmentId/:courseId",auth,isStudent,TeacherSubmission);
router.post("/final_task/:userId/:assessmentId",auth,isStudent,FinalTask);
router.post("/selfsubmit/:userId/:assessmentId",selfSubmit)
router.post("/authorize_course/:userId/:assessmentId/:group",auth,isStudent,RequestAuthorizeCourse )
router.post("/self_assessment_submit/:userId/:assessmentId",selfAssessmentSubmit)

// get
router.get("/profile/:profileId",Getprofile);
router.get("/assignment/:assignmentId",auth,isStudent,Assignment);
router.get("/get_submission/:userId/:assessmentId",auth,Getsubmission);
router.get("/get_course/:userId/:assessmentId",auth,Getcourse);
router.get("/get_user_courses/:id",auth,GetUserCourses)



// chat app routes
router.post("/start_chat",auth,Sendchat);
router.get("/create_chat",auth,Getchat);
router.get("/get_users",auth,isStudent,Getuser);
router.get("/all_chats",auth,isAdmin,Allchat);




router.get("/student",auth,isStudent, (req, res) => {
 res.status(200).json({success:true
,message:"welcome to protected route"});
});






module.exports= router;