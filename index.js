const express = require("express");
require("dotenv").config()
const cors = require("cors")
const app = express()
app.use(express.json())

app.use(cors({
  origin:  process.env.NODE_ENV === 'production' ? 'https://prompta.in': 'http://localhost:3000',
  methods: ['GET', 'POST'],
  credentials: true
}))

const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin:  process.env.NODE_ENV === 'production' ? 'https://prompta.in': 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  }
});

let users = [];

io.on("connection", (socket) => {
  // console.log('Socket.IO connection established')
  // console.log(socket.id);

  socket.on("addUser", (userId) => {

    const isUserExist = users.find((user) => user.userId === userId);

    if (!isUserExist) {
      const newUser = { userId, socketId: socket.id };
      users.push(newUser);
      io.emit("getUsers", users);
      // console.log(newUser);
    }
  }

  );

  socket.on("sendMessage", ({ message, reciever_id }) => {
    // console.log(message);
    const reciever = users.find((user) => user.userId === reciever_id)
    if (reciever) {
      io.to(reciever.socketId).emit("getMessage", message)
    }
  });



  socket.on("disconnect", () => {
    users = users.filter((user) => user.socketId !== socket.id);
    io.emit("getUsers", users);
    console.log("Updated users:", users); // Log the updated users array here
  });


  console.log(users);
});


const dbconnection = require("./config/database")
const router = require("./routes/router")
const PORT = process.env.PORT || 3000;
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const mainrouter = require('./routes/mainrouter')
app.use(cookieParser());
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: "/tmp/"
}));
dbconnection();

const cloudinary = require('./utils/cloudinary');
cloudinary.cloudinaryConnect();


app.use("/api", router);
app.use("/api/v2", mainrouter);
// app.use("/api/v1",submissionRouter)


app.use((err, req, res, next) => {
  const statusCode = 500;
  const message = err.message || 'there is some error';
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  })
})

app.get('/', (req, res) => {
  console.log('hello world');
});



httpServer.listen(PORT, () => {
  console.log("app is listening on port no. ", PORT)
})

