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
  }),
);

const authRoutes = require("./routes/authRoutes");
const sellerRoutes = require("./routes/sellerRoutes");
const adminRoutes = require("./routes/adminRoutes");
const petRoutes = require("./routes/petRoutes");
const contactRoutes = require("./routes/contactRoutes");
const userRoutes = require("./routes/userRoutes");
const requestRoutes = require("./routes/requestRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const chatRoutes = require("./routes/chatRoutes");

app.use("/auth", authRoutes);
app.use("/seller", sellerRoutes);
app.use("/admin", adminRoutes);
app.use("/pets", petRoutes);
app.use("/contact", contactRoutes);
app.use("/user", userRoutes);
app.use("/request", requestRoutes);
app.use("/notification", notificationRoutes);
app.use("/chat", chatRoutes);

const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

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
    socket.join(roomId);
    console.log("Joined room:", roomId);
  });

  socket.on("send_message", async (data) => {
    try {
      const { senderId, receiverId, message } = data;

      if (!senderId || !receiverId || !message) return;

      const roomId = [senderId, receiverId].sort().join("_");

      const msg = await Message.create({
        roomId,
        senderId,
        receiverId,
        message,
      });

      io.to(roomId).emit("receive_message", msg);
    } catch (err) {
      console.error(err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
