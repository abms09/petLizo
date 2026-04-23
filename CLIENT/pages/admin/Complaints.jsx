import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("http://localhost:5000/admin/complaints", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = Array.isArray(res.data)
        ? res.data
        : res.data.complaints || res.data.data || [];

      setComplaints(data);
    } catch (err) {
      console.error("Error fetching complaints:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }

      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || !user.roles?.includes("admin")) {
      navigate("/login");
      return;
    }

    fetchComplaints();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Complaints</h2>

      {loading ? (
        <p className="text-gray-500 text-center">Loading complaints...</p>
      ) : complaints.length === 0 ? (
        <p className="text-gray-400 text-center">No complaints found</p>
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => (
            <div
              key={c._id}
              className="bg-white p-4 rounded-xl shadow border-l-4 border-red-500"
            >
              <p className="font-semibold">{c.user?.name || "Unknown User"}</p>

              <p className="text-gray-600">{c.message}</p>

              <p className="text-sm text-gray-400">
                {c.createdAt
                  ? new Date(c.createdAt).toLocaleString()
                  : "No date"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
