import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const menu = [
  { name: "Dashboard", path: "/admin" },
  { name: "Users", path: "/admin/users" },
  { name: "Sellers", path: "/admin/sellers" },
  { name: "Pets", path: "/admin/pets", key: "pets" },
  { name: "Sold Pets", path: "/admin/sold" },
  { name: "Feedbacks", path: "/admin/feedbacks", key: "feedbacks" },
  { name: "Messages", path: "/admin/messages", key: "messages" },
];

export default function Sidebar({ mobile = false }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const [counts, setCounts] = useState({
    pets: 0,
    feedbacks: 0,
    messages: 0,
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.roles?.includes("admin")) {
      navigate("/login");
    }
  }, [navigate]);

  const fetchCounts = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("http://localhost:5000/admin/counts", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCounts({
        pets: res.data.pets || 0,
        feedbacks: res.data.feedbacks || 0,
        messages: res.data.messages || 0,
      });
    } catch (err) {
      console.error("Count error:", err);
    }
  };

  useEffect(() => {
    fetchCounts();
    const interval = setInterval(fetchCounts, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (mobile) {
    return (
      <div className="relative">
        <button onClick={() => setOpen(!open)} className="text-xl">
          ☰
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-56 bg-white text-black rounded-xl shadow-lg z-50">
            {menu.map((item, i) => {
              const count = counts[item.key] || 0;

              return (
                <NavLink
                  key={i}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className="flex justify-between px-4 py-2 hover:bg-gray-100 text-sm"
                >
                  <span>{item.name}</span>

                  {count > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 rounded-full">
                      {count}
                    </span>
                  )}
                </NavLink>
              );
            })}

            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-900 text-white flex flex-col">
      <div className="p-4 text-xl font-bold border-b border-slate-700">
        🐾 Admin Panel
      </div>

      <nav className="p-4 space-y-2">
        {menu.map((item, i) => {
          const count = counts[item.key] || 0;

          return (
            <NavLink
              key={i}
              to={item.path}
              className={({ isActive }) =>
                `flex justify-between items-center px-4 py-2 rounded-lg ${
                  isActive ? "bg-slate-700" : "hover:bg-slate-800"
                }`
              }
            >
              <span>{item.name}</span>

              {count > 0 && (
                <span className="bg-red-500 text-xs px-2 py-0.5 rounded-full">
                  {count}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700 mt-auto">
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
