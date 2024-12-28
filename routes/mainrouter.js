const express = require("express");
const router = express.Router();
const {NewAssignment,Allassignments,Assignment,UpdateAssignment,ExpertSubmission,Updatetasks,Addtask,DeleteAssessment,PreDiagnostic,PostDiagnostic} = require('../controllers/NewAssigment')
const {SetQues,Allques,quesData,submissionsUser,Alltype,SetDiagnosticQues,Alldiagnostics} =require("../controllers/SetQues")
const {auth,isStudent,isAdmin, isExpert} = require("../middlewares/auth")
const {Getuser,Getusersearch,Deleteuser,Getuserbybranch} = require("../controllers/ProfileUpdate")
const {GetAllSubmission,GetSubmissionSearch,Getsubmission,ExpertFeedback,DeleteUserSubmission,VerifyUserSubmission} = require("../controllers/Submission")
const {RoleChange,Experts, DeleteExperts ,AllExperts}=require("../controllers/Auth")


// post routes
router.post("/new_assignment",auth,isAdmin,NewAssignment);
router.post("/set_question",auth,isAdmin,SetQues)
router.post("/update_assignment/:assignmentId",auth,isAdmin,UpdateAssignment);
router.post("/teacher_submission/:userId/:assessmentId",ExpertSubmission);
router.post("/expert_feedback/:userId/:assessmentId",auth,isAdmin,ExpertFeedback);
router.post("/update_task/:id",auth,isAdmin,Updatetasks);
router.post("/add_task/:id",auth,isAdmin,Addtask);
router.post("/verify_user_submission/:id",auth,isAdmin,VerifyUserSubmission);
router.post("/role_change",auth,isAdmin,RoleChange)
router.post("/experts",auth,isAdmin,Experts)
router.get("/all_experts",AllExperts)
router.delete("/delete_experts/:expertId",auth,isAdmin,DeleteExperts)
router.post("/diagnostics",auth,isAdmin,SetDiagnosticQues)
router.post("/pre_diagnostics/:userId/:assessmentId",auth,isAdmin,PreDiagnostic)
router.post("/post_diagnostics/:userId/:assessmentId",auth,isAdmin,PostDiagnostic)


// get routes
router.get("/get_assignment",Allassignments);
router.get("/get_question",auth,Allques)
router.get("/get_types",auth,Alltype)
router.get("/question_data/:assignmentType",auth,quesData)
router.get("/assignment/:assignmentId",auth,isAdmin,Assignment);
router.get("/get_user_bysearch",auth,isAdmin,Getusersearch);
router.get("/get_user_bybranch/:inputfield/:assessmentId",auth,isAdmin,Getuserbybranch);
router.get("/get_allsubmission/:assessmentId",auth,isAdmin,GetAllSubmission);
router.get("/get_submission_search/:assessmentId",auth,isAdmin,GetSubmissionSearch);
router.get("/get_submission/:userId/:assessmentId",auth,Getsubmission);
router.get("/get_submissionBy_user/:userId",auth,isAdmin,submissionsUser);
router.get("/get_diagnostics",auth,isAdmin,Alldiagnostics)




// delete routes
router.delete("/delete_user",auth,isAdmin,Deleteuser);
router.delete('/delete_user_submission/:id',auth,isAdmin,DeleteUserSubmission)
router.delete('/delete_course/:id',auth,isAdmin,DeleteAssessment)




module.exports= router;