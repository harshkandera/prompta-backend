const { response } = require('express');
const Question = require('../models/Questions')
const { errorHandler } = require("../utils/error")
const Assessment = require('../models/NewAssessment');
const {AssignmentType} = require('../models/AssignmentType');
const {Diagnostics }= require('../models/AssignmentType');

exports.SetQues = async (req, res, next) => {
    try {
        let quesData
        let assignmentTypeNew
        // get the data from req body
        // preQues, postQues
        const { assignmentType, userQues, peerQues, expertQues, groupType } = req.body;

        if (!assignmentType  ) {
            return errorHandler(400, 'All fields required')
        }

        console.log(req.body)

        const assignment = await Question.findOne({ assignmentType: assignmentType })

        if (!assignment) {

             assignmentTypeNew = await AssignmentType.create({
                assignmentType: assignmentType,
                groups: groupType
            })
            
            quesData = await Question.create({
                assignmentType: assignmentType,
                userQues: userQues,
                peerQues: peerQues,
                expertQues: expertQues,
                // preQues: preQues,
                // postQues: postQues
            });
        }
        else {
            assignmentTypeNew = await AssignmentType.findOneAndUpdate({ assignmentType: assignmentType },
                {
                    assignmentType: assignmentType,
                    groups: groupType
                }, { new: true })

            quesData = await Question.findOneAndUpdate({ assignmentType: assignmentType },
                {
                    assignmentType: assignmentType,
                    userQues: userQues,
                    peerQues: peerQues,
                    expertQues: expertQues,
                    // preQues: preQues,
                    // postQues: postQues

                }, { new: true }
            )

        }



        return res.status(200).json({
            success: true,
            message: "Successfully updated",
            quesData
        })

    } catch (error) {
        next(error);
    }
}


exports.SetDiagnosticQues = async (req, res, next) => {
    try {
        let quesData
        let assignmentTypeNew;
        // get the data from req body
        // preQues, postQues
        const { assignmentType, diagnosticQues, groupType } = req.body;

        if (!assignmentType  ) {
            return errorHandler(400, 'All fields required')
        }

        console.log(req.body)

        const assignment = await Diagnostics.findOne({ assignmentType: assignmentType })

        if (!assignment) {

             assignmentTypeNew = await AssignmentType.create({
                assignmentType: assignmentType,
                groups: groupType
            })

            quesData = await Diagnostics.create({
                assignmentType: assignmentType,
              diagnosticQues: diagnosticQues,
              
            });
        }
        else {
            assignmentTypeNew = await AssignmentType.findOneAndUpdate({ assignmentType: assignmentType },
                {
                    assignmentType: assignmentType,
                    groups: groupType
                }, { new: true })

            quesData = await Diagnostics.findOneAndUpdate({ assignmentType: assignmentType },
                {
                    assignmentType: assignmentType,
                    diagnosticQues: diagnosticQues,
                    // preQues: preQues,
                    // postQues: postQues

                }, { new: true }
            )

        }



        return res.status(200).json({
            success: true,
            message: "Successfully updated",
            quesData
        })

    } catch (error) {
        next(error);
    }
}


exports.Allques = async (req, res, next) => {

    try {

        const allques = await Question.find({});
        const alltype = await AssignmentType.find({});
        const Alldiagnostics = await Diagnostics.find({});

        if (!allques) {
            return errorHandler(404, "Question not found")
        }
        if (!alltype) {
            return errorHandler(404, "types not found")
        }
       if(!Alldiagnostics){
        return errorHandler(404, "diagnostics not found")
       }

        return res.status(200).json({
            success: true,
            message: "question got successfully",
            alltype,
            allques,
            Alldiagnostics
        })

    } catch (error) {
        next(error)
    }
}



exports.Alltype = async (req, res, next) => {

    try {

        const alltype = await AssignmentType.find({});
        if (!alltype) {
            return errorHandler(404, "alltype not found")
        }

        return res.status(200).json({
            success: true,
            message: "alltype got successfully",
            alltype,
       

        })

    } catch (error) {
        next(error)
    }
}


exports.Alldiagnostics = async (req, res, next) => {

    try {

        const alltype = await Diagnostics.find({});
        if (!alltype) {
            return errorHandler(404, "diagnostics not found")
        }

        return res.status(200).json({
            success: true,
            message: "diagnostics got successfully",
            alltype,
       

        })

    } catch (error) {
        next(error)
    }
}



exports.quesData = async (req, res, next) => {
    try {
        const assignmentType = req.params.assignmentType;
        const allques = await Question.find({ assignmentType: assignmentType });

        if (!allques || allques.length === 0) {
            // Instead of checking !allques, check if the array is empty
            return res.status(404).json({
                success: false,
                message: "Questions not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Questions retrieved successfully",
            allques,
        });

    } catch (error) {
        // Pass the error to the next middleware
        next(error);
    }
};

exports.submissionsUser = async (req, res, next) => {

    try {
        const userId = req.params.userId;

        if (!userId) {
            return errorHandler(404, "User not found")
        }


        const assessments = await Assessment.find({ userId: userId })

        return res.status(200).json({
            success: true,
            message: "assessments got successfully",
            assessments
        })

    } catch (error) {
        next(error)
    }
}

