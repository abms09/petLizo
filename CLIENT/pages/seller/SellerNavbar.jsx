import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, User, LogOut, Settings, ShoppingCart } from "lucide-react";

export default function SellerNavbar() {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  const loadUser = () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      setUser(storedUser);
    } catch (err) {
      setUser(null);
    }
  };

  useEffect(() => {
    loadUser();

    window.addEventListener("storage", loadUser);
    window.addEventListener("userChanged", loadUser);

    return () => {
      window.removeEventListener("storage", loadUser);
      window.removeEventListener("userChanged", loadUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);

    window.dispatchEvent(new Event("userChanged"));
    navigate("/");
  };

  return (
    <nav className="bg-gray-900 border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
        <Link
          to="/seller"
          className="text-xl md:text-2xl font-bold text-slate-100"
        >
          Seller Panel
        </Link>

        <button
          className="md:hidden text-2xl text-gray-700"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Menu />
        </button>

        <div className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition"
          >
            <ShoppingCart size={16} />
            Buy Pets
          </Link>

          <div className="relative">
            <div
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 px-2 py-1 rounded-lg"
            >
              <img
                src={
                  user?.image
                    ?  `${import.meta.env.VITE_API_URL}/uploads/${user.image}`
                    : "https://i.pravatar.cc/40"
                }
                className="w-9 h-9 rounded-full object-cover border"
                alt="profile"
                onError={(e) => {
                  e.target.src = "https://i.pravatar.cc/40";
                }}
              />

              <span className="text-sm text-gray-100">
                {user?.name || "Profile"}
              </span>
            </div>

            {open && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-md z-50 overflow-hidden">
                <Link
                  to="/seller/profile"
                  className="flex items-center gap-2 px-4 py-3 hover:bg-gray-100 text-sm"
                >
                  <User size={16} />
                  My Profile
                </Link>

                <Link
                  to="/settings"
                  className="flex items-center gap-2 px-4 py-3 hover:bg-gray-100 text-sm"
                >
                  <Settings size={16} />
                  Settings
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full text-left px-4 py-3 hover:bg-gray-100 text-sm"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t shadow-md px-4 py-4 space-y-4">
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 text-slate-700"
          >
            <ShoppingCart size={18} />
            Buy Pets
          </Link>

          <Link
            to="/seller/profile"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 text-slate-700"
          >
            <User size={18} />
            My Profile
          </Link>

          <Link
            to="/settings"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 text-slate-700"
          >
            <Settings size={18} />
            Settings
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-500"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
