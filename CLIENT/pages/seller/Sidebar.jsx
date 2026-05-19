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
  Menu,
  X,
  Wallet,
} from "lucide-react";

import { useEffect, useState } from "react";
import axios from "axios";

export default function Sidebar({ mobile }) {
  const [requests, setRequests] = useState([]);
  const [open, setOpen] = useState(false);

  const linkClass =
    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200";

  const activeClass = "bg-slate-800 text-white";
  const inactiveClass = "text-slate-300 hover:bg-slate-800 hover:text-white";

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.get("http://localhost:5000/seller/requests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

  const MenuItems = () => (
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
        to="/seller/sold-pet"
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

      <NavLink
        to="/seller/payments"
        className={({ isActive }) =>
          `${linkClass} ${isActive ? activeClass : inactiveClass}`
        }
        onClick={() => setOpen(false)}
      >
        <Wallet size={18} />
        Payments
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
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg bg-slate-900 text-white"
        >
          <Menu size={20} />
        </button>

        <div
          className={`fixed inset-0 z-50 transition ${
            open ? "visible" : "invisible"
          }`}
        >
          <div
            onClick={() => setOpen(false)}
            className={`absolute inset-0 bg-black/50 transition-opacity ${
              open ? "opacity-100" : "opacity-0"
            }`}
          />

          <div
            className={`absolute left-0 top-0 h-full w-72 bg-slate-900 text-white transform transition-transform duration-300 flex flex-col ${
              open ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-700">
              <h2 className="text-xl font-semibold">Seller Panel</h2>
              <button onClick={() => setOpen(false)}>
                <X size={22} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
              <MenuItems />
            </nav>
          </div>
        </div>
      </>
    );
  }

  return (
    <aside className="w-64 min-h-screen sticky top-0 bg-slate-900 text-white flex flex-col shadow-xl">
      <div className="p-5 text-2xl font-semibold border-b border-slate-700">
        🐾 Seller Panel
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        <MenuItems />
      </nav>

      <div className="p-4 border-t border-slate-700 text-sm text-slate-400">
        © 2026 Pet Adoption
      </div>
    </aside>
  );
}
