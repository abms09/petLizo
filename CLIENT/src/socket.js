import { io } from "socket.io-client";

let socket;

export const getSocket = () => {
  if (!socket) {
    socket = io("http://127.0.0.1:5000", {
      autoConnect: false,
      withCredentials: true,
    });
  }
  return socket;
};