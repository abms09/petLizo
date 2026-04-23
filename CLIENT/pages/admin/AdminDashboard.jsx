import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSellers: 0,
    totalPets: 0,
    soldPets: 0,
    totalFeedbacks: 0,
    totalComplaints: 0,
  });

  const [activity, setActivity] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!userStr || !token) {
      navigate("/login");
      return;
    }

    let user;
    try {
      user = JSON.parse(userStr);
    } catch (err) {
      navigate("/login");
      return;
    }

    const roles = Array.isArray(user.roles) ? user.roles : [];

    if (!roles.includes("admin")) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await axios.get("http://localhost:5000/admin/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setStats(res.data);

        const activityRes = await axios.get(
          "http://localhost:5000/admin/recent-activity",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        setActivity(activityRes.data || []);

        setError(null);
      } catch (err) {
        console.error("Dashboard error:", err.response?.data || err.message);

        setError("Failed to load dashboard data");

        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const cards = [
    { title: "Users", value: stats.totalUsers },
    { title: "Sellers", value: stats.totalSellers },
    { title: "Pets", value: stats.totalPets },
    { title: "Sold Pets", value: stats.soldPets },
    { title: "Feedbacks", value: stats.totalFeedbacks },
    { title: "Complaints", value: stats.totalComplaints },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
          Admin Dashboard
        </h2>

        <span className="text-sm text-gray-500">
          Overview of platform activity
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <p className="text-gray-500 animate-pulse">Loading dashboard...</p>
        </div>
      ) : error ? (
        <div className="text-center py-20 text-red-500">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {cards.map((item, i) => (
              <div
                key={i}
                className="bg-white p-5 md:p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
              >
                <p className="text-sm text-gray-500 mb-2">{item.title}</p>

                <p className="text-2xl md:text-3xl font-bold text-gray-800">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Recent Activity</h3>

              <span className="text-xs text-gray-400">Live updates</span>
            </div>

            <div className="p-4 md:p-6">
              {activity.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">
                  No recent activity
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

                  <div className="space-y-6">
                    {activity.map((item, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="relative z-10 w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm">
                          {item.type === "user" && "👤"}
                          {item.type === "pet" && "🐶"}
                          {item.type === "sale" && "💰"}
                          {item.type === "complaint" && "🚨"}
                          {!item.type && "📌"}
                        </div>

                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">
                            {item.message}
                          </p>

                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(item.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
