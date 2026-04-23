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
    <nav className="bg-white border-b shadow-sm px-4 md:px-8 py-3 flex items-center justify-between">
      <h1 className="text-lg md:text-xl font-semibold text-gray-800"></h1>

      <button
        className="md:hidden text-2xl text-gray-700"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <Menu />
      </button>

      <div className="hidden md:flex items-center gap-6">
        <Link
          to="/"
          className="flex items-center gap-2 text-sm px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 transition"
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
                  ? `http://localhost:5000/uploads/${user.image}`
                  : "https://i.pravatar.cc/40"
              }
              className="w-8 h-8 rounded-full object-cover border"
              alt="profile"
              onError={(e) => {
                e.target.src = "https://i.pravatar.cc/40";
              }}
            />

            <span className="text-sm text-gray-700">
              {user?.name || "Profile"}
            </span>
          </div>

          {open && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-md z-50">
              <Link
                to="/seller/profile"
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm"
              >
                <User size={16} />
                My Profile
              </Link>

              <Link
                to="/settings"
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm"
              >
                <Settings size={16} />
                Settings
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {menuOpen && (
        <div className="absolute top-16 left-0 w-full bg-white border-t shadow-md flex flex-col p-4 gap-3 md:hidden z-50">
          <Link to="/" onClick={() => setMenuOpen(false)}>
            Buy Pets
          </Link>

          <Link to="/sellerprofile" onClick={() => setMenuOpen(false)}>
            My Profile
          </Link>

          <Link to="/settings" onClick={() => setMenuOpen(false)}>
            Settings
          </Link>

          <button onClick={handleLogout} className="text-left">
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
