import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function SellerDashboard() {
  const [stats, setStats] = useState({
    totalPets: 0,
    soldPets: 0,
    activePets: 0,
  });

  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const res = await axios.get("http://localhost:5000/seller/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStats(
        res.data || {
          totalPets: 0,
          soldPets: 0,
          activePets: 0,
        },
      );
    } catch (error) {
      console.error(error);

      if (error.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || !user.roles?.includes("seller")) {
      navigate("/become-seller");
      return;
    }

    fetchStats();
  }, []);

  const successRate =
    stats.totalPets > 0
      ? Math.round((stats.soldPets / stats.totalPets) * 100)
      : 0;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
          Seller Overview
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Track your pets and performance in real-time
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <p className="text-gray-500 animate-pulse">Loading dashboard...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition">
              <p className="text-xs text-gray-400 mb-1">Total Pets</p>
              <h3 className="text-2xl font-bold text-gray-800">
                {stats.totalPets}
              </h3>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition">
              <p className="text-xs text-gray-400 mb-1">Sold Pets</p>
              <h3 className="text-2xl font-bold text-green-600">
                {stats.soldPets}
              </h3>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition">
              <p className="text-xs text-gray-400 mb-1">Active Listings</p>
              <h3 className="text-2xl font-bold text-blue-600">
                {stats.totalPets - stats.soldPets}
              </h3>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition">
              <p className="text-xs text-gray-400 mb-1">Success Rate</p>
              <h3 className="text-2xl font-bold text-purple-600">
                {successRate}%
              </h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Performance Summary
            </h3>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-gray-600">
              <p>
                You have{" "}
                <span className="font-semibold text-gray-800">
                  {stats.totalPets}
                </span>{" "}
                pets listed.
              </p>

              <p>
                <span className="font-semibold text-green-600">
                  {stats.soldPets}
                </span>{" "}
                successfully sold.
              </p>

              <p>
                Conversion rate is{" "}
                <span className="font-semibold text-blue-600">
                  {successRate}%
                </span>
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
