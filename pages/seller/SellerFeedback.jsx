import { useEffect, useState } from "react";
import axios from "axios";

export default function SellerFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/seller/feedbacks", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setFeedbacks(res.data);
    } catch (err) {
      console.error(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p className="text-center mt-10">Loading feedback...</p>;
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 sm:mb-8 text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Customer Feedback
        </h2>
        <p className="text-gray-500 text-sm">
          See what users are saying about your service
        </p>
      </div>

      {feedbacks.length === 0 ? (
        <div className="text-center py-16 sm:py-20 border rounded-xl bg-white">
          <p className="text-gray-500 text-lg">No feedback available yet</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {feedbacks.map((fb) => {
            const userImage = fb.user?.image
              ? `http://localhost:5000/uploads/${fb.user.image}`
              : null;

            return (
              <div
                key={fb._id}
                className="bg-white p-5 rounded-2xl border shadow-sm hover:shadow-lg transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    {userImage ? (
                      <img
                        src={userImage}
                        className="w-10 h-10 rounded-full object-cover"
                        alt="user"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                        {fb.user?.name?.charAt(0) || "U"}
                      </div>
                    )}

                    <div>
                      <p className="font-semibold text-gray-800">
                        {fb.user?.name || "Unknown"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {fb.user?.email || ""}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-blue-600 font-medium mb-2">
                    🐾 {fb.pet?.name || "Unknown Pet"}
                  </p>

                  <div className="flex items-center justify-between mb-3">
                    <div>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`text-lg ${
                            star <= (fb.rating || 0)
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 font-medium">
                      {fb.rating || 0}/5
                    </span>
                  </div>

                  <p className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-4">
                    {fb.comment || "No comment provided"}
                  </p>
                </div>

                <p className="text-xs text-gray-400 border-t pt-3">
                  {new Date(fb.createdAt).toLocaleDateString()} •{" "}
                  {new Date(fb.createdAt).toLocaleTimeString()}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
