const chat = require('../models/Chat')
const { errorHandler } = require("../utils/error")

exports.Getchat = async (req, res, next) => {
    try {
   const sender_id = req.query.sender_id;
   const reciever_id = req.query.reciever_id;

   
      // Validate that both sender_id and receiver_id are present
      if (!sender_id || !reciever_id) {
        return res.status(400).json({
          success: false,
          message: 'Both sender_id and receiver_id are required.'
        });
      }
  
      const participants = [sender_id, reciever_id];
  
      const chatInstance = await chat.findOne({ participants: { $all: participants } }).populate('messages.sender').populate('messages.reciever').exec();
 

      return res.status(200).json({
        success: true,
        message: 'Chat fetched successfully',
        chat: chatInstance
      });
  
    } catch (error) {
      next(error);
    }
  };
  


  exports.Sendchat = async (req, res, next) => {
    try {
        const sender_id = req.query.sender_id;
        const reciever_id = req.query.reciever_id;


      const participants = [sender_id, reciever_id];
      let userchat  = await chat.findOne({ participants: { $all: participants } })
  
 
      // If chat doesn't exist, create a new one
      if (!userchat) {
        let newChat = await chat.create({
          participants: participants,
          messages: [req.body]
        });
        
        return res.status(201).json({
          success: true,
          message: 'Chat created and message sent successfully',
          newChat
        });
        
      }


    
      // If chat exists, add the new message to the messages array
      userchat.messages.push(req.body);
      await userchat.save();

      const updatedChat = await chat.findById(userchat._id).populate('messages.sender').populate('messages.reciever').exec();



      return res.status(200).json({
        success: true,
        message: 'Message sent successfully',
        updatedChat
      });
  
    } catch (error) {
      next(error);
    }
  };
  
  
  exports.Allchat = async (req, res, next) => {
    try {

  
      const chatInstance = await chat.find({}).populate('messages.sender').populate('messages.reciever').exec();
 

      return res.status(200).json({
        success: true,
        message: 'Chat fetched successfully',
        chat: chatInstance
      });
  
    } catch (error) {
      next(error);
    }
  };
  