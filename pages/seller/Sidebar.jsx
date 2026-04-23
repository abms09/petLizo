import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  PawPrint,
  PlusCircle,
  CheckCircle,
  MessageSquare,
  ClipboardList,
  ShoppingCart,
  User,
} from "lucide-react";

import { useEffect, useState } from "react";
import axios from "axios";

export default function Sidebar({ mobile }) {
  const [requests, setRequests] = useState([]);
  const [open, setOpen] = useState(false);

  const linkClass =
    "flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200";

  const activeClass = "bg-slate-800 text-white";
  const inactiveClass = "text-slate-300 hover:bg-slate-800 hover:text-white";

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.get("http://localhost:5000/seller/requests", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRequests(res.data.requests || []);
    } catch (err) {
      console.log("Sidebar request error:", err.message);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  const requestCount = requests.filter(
    (r) => r.status?.toLowerCase() === "pending",
  ).length;

  const Menu = () => (
    <>
      <NavLink
        to="/seller"
        end
        className={({ isActive }) =>
          `${linkClass} ${isActive ? activeClass : inactiveClass}`
        }
        onClick={() => setOpen(false)}
      >
        <LayoutDashboard size={18} />
        Dashboard
      </NavLink>


      <NavLink
        to="/seller/mypets"
        className={({ isActive }) =>
          `${linkClass} ${isActive ? activeClass : inactiveClass}`
        }
        onClick={() => setOpen(false)}
      >
        <PawPrint size={18} />
        My Pets
      </NavLink>

      <NavLink
        to="/seller/addpet"
        className={({ isActive }) =>
          `${linkClass} ${isActive ? activeClass : inactiveClass}`
        }
        onClick={() => setOpen(false)}
      >
        <PlusCircle size={18} />
        Add Pet
      </NavLink>

      <NavLink
        to="/seller/requests"
        className={({ isActive }) =>
          `${linkClass} ${isActive ? activeClass : inactiveClass}`
        }
        onClick={() => setOpen(false)}
      >
        <div className="flex items-center gap-3 w-full">
          <ClipboardList size={18} />
          Requests
          {requestCount > 0 && (
            <span className="ml-auto bg-red-500 text-xs px-2 py-0.5 rounded-full">
              {requestCount > 99 ? "99+" : requestCount}
            </span>
          )}
        </div>
      </NavLink>

      <NavLink
        to="/seller/sold"
        className={({ isActive }) =>
          `${linkClass} ${isActive ? activeClass : inactiveClass}`
        }
        onClick={() => setOpen(false)}
      >
        <CheckCircle size={18} />
        Sold Pets
      </NavLink>

      <NavLink
        to="/seller/sellerFeedback"
        className={({ isActive }) =>
          `${linkClass} ${isActive ? activeClass : inactiveClass}`
        }
        onClick={() => setOpen(false)}
      >
        <MessageSquare size={18} />
        Feedbacks
      </NavLink>

      <div className="border-t border-slate-700 my-3" />
      <NavLink
        to="/"
        className={({ isActive }) =>
          `${linkClass} ${isActive ? activeClass : inactiveClass}`
        }
        onClick={() => setOpen(false)}
      >
        <ShoppingCart size={18} />
        Buy Pets
      </NavLink>
      <NavLink
        to="/seller/profile"
        className={({ isActive }) =>
          `${linkClass} ${isActive ? activeClass : inactiveClass}`
        }
        onClick={() => setOpen(false)}
      >
        <User size={18} />
        Profile
      </NavLink>
    </>
  );

  if (mobile) {
    return (
      <>
        <button onClick={() => setOpen(true)}>☰</button>

        <div className={`fixed inset-0 z-50 ${open ? "visible" : "invisible"}`}>
          <div
            onClick={() => setOpen(false)}
            className={`absolute inset-0 bg-black transition ${
              open ? "opacity-40" : "opacity-0"
            }`}
          />

          <div
            className={`absolute left-0 top-0 h-full w-64 bg-slate-900 text-white p-4 transform transition ${
              open ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <button
              onClick={() => setOpen(false)}
              className="mb-4 w-full text-right text-lg"
            >
              ✕
            </button>

            <Menu />
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="w-64 h-screen bg-slate-900 text-white flex flex-col shadow-lg">
      <div className="p-5 text-2xl font-semibold border-b border-slate-700">
        🐾 Seller Panel
      </div>

      <nav className="p-4 space-y-2 flex-1">
        <Menu />
      </nav>

      <div className="p-4 border-t border-slate-700 text-sm text-slate-400">
        © 2026 Pet Adoption
      </div>
    </div>
  );
}
