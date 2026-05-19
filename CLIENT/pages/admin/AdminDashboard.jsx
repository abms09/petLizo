import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import {
  Users,
  Store,
  PawPrint,
  BadgeDollarSign,
  MessageSquare,
  ShieldAlert,
  TrendingUp,
  Activity,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

export default function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSellers: 0,
    totalPets: 0,
    soldPets: 0,
    totalFeedbacks: 0,
    totalComplaints: 0,

    totalRevenue: 0,
    monthlyRevenue: [],
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
    } catch {
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

        const res = await axios.get( `${import.meta.env.VITE_API_URL}/admin/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setStats(res.data);

        const activityRes = await axios.get(
           `${import.meta.env.VITE_API_URL}/admin/recent-activity`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setActivity(activityRes.data || []);

        setError(null);
      } catch (err) {
        console.error(err);

        setError("Failed to load dashboard");

        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.clear();
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const cards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: <Users size={22} />,
      color: "from-blue-500 to-cyan-500",
    },

    {
      title: "Total Sellers",
      value: stats.totalSellers,
      icon: <Store size={22} />,
      color: "from-purple-500 to-pink-500",
    },

    {
      title: "Total Pets",
      value: stats.totalPets,
      icon: <PawPrint size={22} />,
      color: "from-orange-500 to-yellow-500",
    },

    {
      title: "Sold Pets",
      value: stats.soldPets,
      icon: <BadgeDollarSign size={22} />,
      color: "from-green-500 to-emerald-500",
    },

    {
      title: "Feedbacks",
      value: stats.totalFeedbacks,
      icon: <MessageSquare size={22} />,
      color: "from-indigo-500 to-blue-500",
    },

    {
      title: "Complaints",
      value: stats.totalComplaints,
      icon: <ShieldAlert size={22} />,
      color: "from-red-500 to-rose-500",
    },
    {
      title: "Seller Revenue",
      value: `₹${stats.sellerRevenue}`,
      icon: <TrendingUp size={22} />,
      color: "from-emerald-500 to-green-500",
    },

    {
      title: "Commission",
      value: `₹${stats.commissionRevenue}`,
      icon: <BadgeDollarSign size={22} />,
      color: "from-yellow-500 to-orange-500",
    },

    {
      title: "Payments",
      value: stats.successfulPayments,
      icon: <Activity size={22} />,
      color: "from-cyan-500 to-blue-500",
    },
  ];

  const pieData = [
    {
      name: "Sold",
      value: stats.soldPets,
    },
    {
      name: "Available",
      value: stats.totalPets - stats.soldPets,
    },
  ];

  const COLORS = ["#22c55e", "#3b82f6"];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500 text-lg animate-pulse">
          Loading Dashboard...
        </p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-20 text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>

          <p className="text-gray-500 mt-1">
            Monitor users, pets, sales and payments
          </p>
        </div>

        <div className="bg-white rounded-2xl px-5 py-3 shadow-sm border">
          <p className="text-sm text-gray-500">Total Revenue</p>

          <h2 className="text-2xl font-bold text-green-600">
            ₹{stats.totalRevenue || 0}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-5">
        {cards.map((item, i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-3xl bg-white p-5 shadow-sm hover:shadow-xl transition"
          >
            <div
              className={`absolute top-0 right-0 w-28 h-28 bg-linear-to-br ${item.color} opacity-10 rounded-full translate-x-10 -translate-y-10`}
            />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{item.title}</p>

                <h2 className="text-3xl font-bold text-slate-800 mt-2">
                  {item.value}
                </h2>
              </div>

              <div
                className={`bg-linear-to-r ${item.color} text-white p-3 rounded-2xl shadow`}
              >
                {item.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-3xl shadow-sm border p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-lg text-slate-800">
                Revenue Analytics
              </h3>

              <p className="text-sm text-gray-500">Monthly payment overview</p>
            </div>

            <TrendingUp className="text-green-500" />
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.monthlyRevenue || []}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />

                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="month" />

                <YAxis />

                <Tooltip />

                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-lg text-slate-800">
                Pet Status
              </h3>

              <p className="text-sm text-gray-500">Sold vs Available</p>
            </div>

            <Activity className="text-blue-500" />
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>

                <Tooltip />

                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border p-5">
        <div className="mb-5">
          <h3 className="font-semibold text-lg text-slate-800">
            Platform Statistics
          </h3>

          <p className="text-sm text-gray-500">
            Users, pets and complaints overview
          </p>
        </div>

        <div className="h-87.5">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[
                {
                  name: "Users",
                  value: stats.totalUsers,
                },

                {
                  name: "Sellers",
                  value: stats.totalSellers,
                },

                {
                  name: "Pets",
                  value: stats.totalPets,
                },

                {
                  name: "Sold",
                  value: stats.soldPets,
                },

                {
                  name: "Complaints",
                  value: stats.totalComplaints,
                },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="name" />

              <YAxis />

              <Tooltip />

              <Bar dataKey="value" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border">
        <div className="px-6 py-5 border-b flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg text-slate-800">
              Recent Activity
            </h3>

            <p className="text-sm text-gray-500">Latest platform updates</p>
          </div>
        </div>

        <div className="p-6">
          {activity.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              No recent activity
            </div>
          ) : (
            <div className="space-y-5">
              {activity.map((item, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center text-lg">
                    {item.type === "user" && "👤"}

                    {item.type === "pet" && "🐶"}

                    {item.type === "sale" && "💰"}

                    {item.type === "complaint" && "🚨"}

                    {!item.type && "📌"}
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700">
                      {item.message}
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
