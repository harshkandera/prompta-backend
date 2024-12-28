const express = require("express");
const router = express.Router();
const {ExpertSubmission} = require('../controllers/NewAssigment')

router.post("/teacher_submission/:userId/:assessmentId",ExpertSubmission);


module.exports = router;
