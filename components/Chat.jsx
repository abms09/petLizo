import { useEffect, useRef, useState } from "react";
import { socket } from "../src/socket";
import axios from "axios";
import { useLocation } from "react-router-dom";

export default function Chat() {
  const location = useLocation();
  const { state } = location || {};
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user?.id || user?._id;
  const sellerId = state?.sellerId || localStorage.getItem("chatSellerId");
  const roomId =userId && sellerId ? [userId, sellerId].sort().join("_") : null;
  
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!roomId) return;
    socket.emit("join_room", roomId);
  }, [roomId]);

  useEffect(() => {
    if (!roomId) {
      setLoading(false);
      return;
    }

    const fetchMessages = async () => {
      try {
        setLoading(true);

        const res = await axios.get(`http://localhost:5000/chat/${roomId}`);

        setMessages(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [roomId]);

  useEffect(() => {
    const handleMessage = (data) => {
      setMessages((prev) => [...prev, data]);
    };

    socket.on("receive_message", handleMessage);

    return () => socket.off("receive_message", handleMessage);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim()) return;

    if (!userId || !sellerId) {
      console.error("❌ Missing IDs", { userId, sellerId });
      return;
    }

    socket.emit("send_message", {
      senderId: userId,
      receiverId: sellerId,
      message,
    });

    setMessage("");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="bg-white shadow p-4 text-center font-semibold">
        💬 Chat
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        {loading ? (
          <p className="text-center text-gray-500 mt-10">Loading...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-400 mt-10">Start chatting 👋</p>
        ) : (
          messages.map((msg, i) => {
            const isMine = msg.senderId?.toString() === userId?.toString();

            return (
              <div
                key={i}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-4 py-2 rounded-2xl max-w-xs text-sm shadow-md wrap-break-word
                  ${
                    isMine
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-gray-200 text-gray-900 rounded-bl-sm"
                  }`}
                >
                  <p>{msg.message}</p>

                  <div
                    className={`text-[10px] mt-1 ${
                      isMine
                        ? "text-blue-100 text-right"
                        : "text-gray-500 text-right"
                    }`}
                  >
                    {msg.createdAt
                      ? new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </div>

                  <div
                    className={`text-[10px] mt-1 ${
                      isMine
                        ? "text-blue-100 text-right"
                        : "text-gray-500 text-right"
                    }`}
                  >
                    {isMine ? "You" : "Seller"}
                  </div>
                </div>
              </div>
            );
          })
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white p-3 flex gap-2 border-t">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type message..."
          className="flex-1 border rounded-full px-4 py-2 outline-none"
        />

        <button
          onClick={sendMessage}
          disabled={!message.trim()}
          className="bg-blue-600 text-white px-5 py-2 rounded-full disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
