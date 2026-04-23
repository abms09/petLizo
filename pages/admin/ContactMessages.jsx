import { useEffect, useState } from "react";
import axios from "axios";

export default function ContactMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);
  useEffect(() => {
    const markRead = async () => {
      const token = localStorage.getItem("token");

      await axios.put(
        "http://localhost:5000/admin/contacts/read-all",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      window.dispatchEvent(new Event("countsUpdated"));
    };

    markRead();
  }, []);
  const fetchMessages = async () => {
    try {
      const res = await axios.get("http://localhost:5000/contact", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setMessages(res.data);
    } catch (err) {
      console.error("Error loading messages:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p className="text-gray-500">Loading messages...</p>;
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          📩 Contact Messages
        </h2>
        <p className="text-sm text-gray-500">Messages submitted by users</p>
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-sm">No messages found</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {messages.map((msg) => (
            <div
              key={msg._id}
              className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    {msg.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>

                  <div>
                    <p className="font-semibold text-gray-800">{msg.name}</p>
                    <p className="text-xs text-gray-400">{msg.email}</p>
                  </div>
                </div>

                <p className="text-gray-600 text-sm leading-relaxed line-clamp-4">
                  {msg.message}
                </p>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <span className="text-xs text-gray-400">
                  {new Date(msg.createdAt).toLocaleString()}
                </span>

                <span className="text-[10px] px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                  Message
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
