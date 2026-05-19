import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function SellerDashboard() {
  const [stats, setStats] = useState({
    totalPets: 0,
    soldPets: 0,
    activePets: 0,

    totalEarnings: 0,
    pendingPayments: 0,
    completedPayments: 0,
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(res.data);

      setStats({
        totalPets: res.data.totalPets || 0,
        soldPets: res.data.soldPets || 0,
        activePets:
          res.data.activePets ||
          (res.data.totalPets || 0) - (res.data.soldPets || 0),

        totalEarnings: res.data.totalEarnings || 0,
        pendingPayments: res.data.pendingPayments || 0,
        completedPayments: res.data.completedPayments || 0,
      });
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
        <h2 className="text-2xl md:text-3xl font-bold text-gray-100">
          Seller Overview
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Track pets, sales, and payment performance
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <p className="text-gray-500 animate-pulse">Loading dashboard...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
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
                {stats.activePets}
              </h3>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition">
              <p className="text-xs text-gray-400 mb-1">Total Earnings</p>

              <h3 className="text-2xl font-bold text-yellow-600">
                ₹{stats.totalEarnings}
              </h3>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition">
              <p className="text-xs text-gray-400 mb-1">Pending Payments</p>

              <h3 className="text-2xl font-bold text-orange-500">
                ₹{stats.pendingPayments}
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
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              Performance Summary
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 text-sm">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-500 mb-1">Pets Listed</p>

                <p className="text-xl font-bold text-gray-800">
                  {stats.totalPets}
                </p>
              </div>

              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-green-600 mb-1">Pets Sold</p>

                <p className="text-xl font-bold text-green-700">
                  {stats.soldPets}
                </p>
              </div>

              <div className="bg-yellow-50 rounded-xl p-4">
                <p className="text-yellow-600 mb-1">Earnings</p>

                <p className="text-xl font-bold text-yellow-700">
                  ₹{stats.totalEarnings}
                </p>
              </div>

              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-blue-600 mb-1">Completed Payments</p>

                <p className="text-xl font-bold text-blue-700">
                  {stats.completedPayments}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Sales Conversion</span>

                <span className="font-semibold text-gray-800">
                  {successRate}%
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-linear-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${successRate}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <button
              onClick={() => navigate("/seller/addpet")}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl p-5 text-left transition shadow-sm"
            >
              <h3 className="font-semibold text-lg">Add New Pet</h3>

              <p className="text-sm text-blue-100 mt-1">
                Create a new pet listing
              </p>
            </button>

            <button
              onClick={() => navigate("/seller/payments")}
              className="bg-green-600 hover:bg-green-700 text-white rounded-2xl p-5 text-left transition shadow-sm"
            >
              <h3 className="font-semibold text-lg">View Payments</h3>

              <p className="text-sm text-green-100 mt-1">
                Check payment history & earnings
              </p>
            </button>

            <button
              onClick={() => navigate("/seller/mypets")}
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-2xl p-5 text-left transition shadow-sm"
            >
              <h3 className="font-semibold text-lg">Manage Pets</h3>

              <p className="text-sm text-purple-100 mt-1">
                Edit and manage listings
              </p>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
