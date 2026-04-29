const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const Message = require("./model/message");

dotenv.config();
const PORT = process.env.PORT || 5000;

const connectDb = require("./config/db");
connectDb();

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/auth", require("./routes/authRoutes"));
app.use("/seller", require("./routes/sellerRoutes"));
app.use("/admin", require("./routes/adminRoutes"));
app.use("/pets", require("./routes/petRoutes"));
app.use("/contact", require("./routes/contactRoutes"));
app.use("/user", require("./routes/userRoutes"));
app.use("/request", require("./routes/requestRoutes"));
app.use("/notification", require("./routes/notificationRoutes"));
app.use("/chat", require("./routes/chatRoutes"));

app.use(require("./middleware/errorHandler"));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join_room", (roomId) => {
    if (!roomId) return;

    socket.join(roomId);

    console.log(` ${socket.id} joined room: ${roomId}`);
    console.log("Rooms now:", Array.from(socket.rooms));
  });

  socket.on("send_message", async (data) => {
    try {
      const { senderId, receiverId, message } = data;

      if (!senderId || !receiverId || !message) {
        console.log(" Invalid message data:", data);
        return;
      }

      const roomId = [senderId, receiverId].sort().join("_");

      console.log(" Sending message to room:", roomId);

      const msg = await Message.create({
        roomId,
        senderId,
        receiverId,
        message,
      });

      io.to(roomId).emit("receive_message", msg);

      console.log(" Message emitted:", msg._id);
    } catch (err) {
      console.error(" Message error:", err.message);
    }
  });

  socket.on("disconnect", () => {
    console.log(" User disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});