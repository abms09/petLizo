import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Feedbacks() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const fetchFeedbacks = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("http://localhost:5000/admin/feedbacks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = Array.isArray(res.data)
        ? res.data
        : res.data.feedbacks || res.data.data || [];

      setFeedbacks(data);
    } catch (err) {
      console.error("Error fetching feedbacks:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }

      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        "http://localhost:5000/admin/feedbacks/read-all",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      window.dispatchEvent(new Event("countsUpdated"));
    } catch (err) {
      console.error("Mark read error:", err);
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!user || !user.roles?.includes("admin")) {
      navigate("/login");
      return;
    }

    fetchFeedbacks();
    markRead();
  }, [navigate]);

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Seller Feedbacks</h2>
        <p className="text-sm text-gray-500">
          Reviews sent by users to sellers
        </p>
      </div>

      {loading ? (
        <p className="text-gray-500 text-center">Loading feedbacks...</p>
      ) : feedbacks.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-400">No feedbacks found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((f) => (
            <div
              key={f._id}
              className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition"
            >
              <div className="mb-3">
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                  🐶 {f.pet?.name || "Unknown Pet"}
                </span>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    {f.user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>

                  <div>
                    <p className="font-semibold text-gray-800">
                      {f.user?.name || "Unknown User"}
                    </p>
                    <p className="text-xs text-gray-400">User</p>
                  </div>
                </div>

                <div className="text-gray-400 text-sm">➜</div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold">
                    {f.seller?.name?.charAt(0)?.toUpperCase() || "S"}
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-gray-800">
                      {f.seller?.name || "Unknown Seller"}
                    </p>
                    <p className="text-xs text-gray-400">Seller</p>
                  </div>
                </div>

                <div className="bg-yellow-50 text-yellow-600 px-3 py-1 rounded-full text-sm font-semibold">
                  ⭐ {f.rating || 0}/5
                </div>
              </div>

              <p className="text-gray-600 text-sm leading-relaxed border-t pt-3">
                {f.comment || "No message provided"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
