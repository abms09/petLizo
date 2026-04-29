import { useState, useEffect } from "react";
import { Menu, X, User, LogOut, Heart } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [wishlistCount, setWishlistCount] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        setUser(storedUser);
      } catch {
        setUser(null);
      }
    };

    loadUser();
    window.addEventListener("storage", loadUser);

    return () => window.removeEventListener("storage", loadUser);
  }, []);

  useEffect(() => {
    const updateWishlist = () => {
      const stored = JSON.parse(localStorage.getItem("wishlist")) || [];
      setWishlistCount(stored.length);
    };

    updateWishlist();
    window.addEventListener("wishlistUpdated", updateWishlist);

    return () => window.removeEventListener("wishlistUpdated", updateWishlist);
  }, []);

  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  const handleLogout = () => {
    localStorage.clear();
    window.dispatchEvent(new Event("storage"));
    navigate("/");
  };

  const sellerClick = () => {
    if (!token) navigate("/login");
    else navigate("/seller");
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Pets", path: "/pets" },
    { name: "My Requests", path: "/requests" },
    { name: "About Us", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const linkClasses = ({ isActive }) =>
    `px-1 py-2 text-sm font-medium transition ${
      isActive ? "text-slate-900" : "text-slate-500 hover:text-slate-900"
    }`;

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <NavLink to="/" className="text-3xl font-extrabold">
            Pet<span className="text-slate-400">Lizo</span>
          </NavLink>

          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <NavLink key={link.name} to={link.path} className={linkClasses}>
                {link.name}
              </NavLink>
            ))}

            <NavLink to="/wishlist" className="relative group">
              <Heart className="text-slate-600 group-hover:text-red-500 transition" />

              <span
                className="absolute top-8 left-1/2 -translate-x-1/2 
                               text-xs bg-black text-white px-2 py-1 rounded 
                               opacity-0 group-hover:opacity-100 transition"
              >
                Wishlist
              </span>

              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] px-1.5 rounded-full">
                  {wishlistCount}
                </span>
              )}
            </NavLink>

            {isLoggedIn && (
              <button
                onClick={sellerClick}
                className="px-4 py-1.5 text-white rounded-lg bg-slate-800 hover:bg-slate-700"
              >
                Sell
              </button>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <NavLink to="/userProfile" className="flex items-center gap-2">
                  {user?.image ? (
                    <img
                      src={`http://localhost:5000/uploads/${user.image}`}
                      className="w-8 h-8 rounded-full object-cover"
                      onError={(e) => (e.target.src = "/default-avatar.png")}
                    />
                  ) : (
                    <User size={18} />
                  )}
                  <span>{user?.name}</span>
                </NavLink>

                <button
                  onClick={handleLogout}
                  className="bg-slate-900 text-white px-3 py-2 rounded hover:bg-slate-700"
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <NavLink
                to="/login"
                className="bg-slate-900 text-white px-4 py-2 rounded hover:bg-slate-700"
              >
                Login
              </NavLink>
            )}
          </div>

          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white p-4 space-y-4 border-t shadow">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className="block text-slate-700"
            >
              {link.name}
            </NavLink>
          ))}

          <NavLink
            to="/wishlist"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 text-slate-700"
          >
            <Heart /> Wishlist ({wishlistCount})
          </NavLink>

          {isLoggedIn && (
            <button
              onClick={() => {
                sellerClick();
                setIsOpen(false);
              }}
              className="w-full bg-slate-800 text-white py-2 rounded"
            >
              Sell
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
