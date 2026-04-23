import { useState, useEffect } from "react";
import { Menu, X, User, LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);

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

    return () => {
      window.removeEventListener("storage", loadUser);
    };
  }, []);

  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    window.dispatchEvent(new Event("storage"));
    navigate("/");
  };

  const sellerClick = () => {
    if (!token) {
      navigate("/login");
    } else {
      navigate("/seller");
    }
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Pets", path: "/pets" },
    { name: "My Requests", path: "/requests" },
    { name: "About Us", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const linkClasses = ({ isActive }) =>
    `relative px-1 py-2 text-sm font-medium transition-all duration-300 ${
      isActive ? "text-slate-900" : "text-slate-500 hover:text-slate-900"
    }`;

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <NavLink
            to="/"
            className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 hover:opacity-80 transition"
          >
            Pet<span className="text-slate-400">Lizo</span>
          </NavLink>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <NavLink key={link.name} to={link.path} className={linkClasses}>
                {({ isActive }) => (
                  <span className="relative">
                    {link.name}
                    {isActive && (
                      <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-slate-900 rounded-full" />
                    )}
                  </span>
                )}
              </NavLink>
            ))}
            {isLoggedIn && (
              <button
                onClick={sellerClick}
                className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold 
               text-white rounded-lg 
               bg-linear-to-r from-slate-800 to-slate-600 
               hover:opacity-90 transition-all duration-200 shadow-sm"
              >
                Sell
              </button>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-3">
            {isLoggedIn ? (
              <>
                <NavLink
                  to="/userProfile"
                  className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition"
                >
                  {user?.image ? (
                    <img
                      src={`http://localhost:5000/uploads/${user.image}`}
                      alt="profile"
                      className="w-8 h-8 rounded-full object-cover border"
                      onError={(e) => {
                        e.target.src = "/default-avatar.png";
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                      <User size={16} />
                    </div>
                  )}

                  <span className="text-sm font-medium">
                    {user?.name || "Profile"}
                  </span>
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition shadow-sm"
                >
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <NavLink
                to="/login"
                className="bg-slate-900 text-white px-5 py-2 rounded-lg hover:bg-slate-700 transition shadow-sm text-sm font-medium"
              >
                Login
              </NavLink>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md hover:bg-slate-100 transition"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 pb-5 space-y-4 shadow-sm">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `block text-base font-medium ${
                  isActive ? "text-slate-900" : "text-slate-600"
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}

          <div className="pt-4 border-t border-slate-200 space-y-2">
            {isLoggedIn && (
              <button
                onClick={() => {
                  sellerClick();
                  setIsOpen(false);
                }}
                className="w-full bg-slate-800 text-white py-2 rounded-lg text-sm"
              >
                Sell
              </button>
            )}

            {isLoggedIn ? (
              <>
                <NavLink
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 text-slate-700 py-2"
                >
                  <User size={18} /> {user?.name || "Profile"}
                </NavLink>

                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="w-full bg-slate-900 text-white py-2 rounded-lg flex items-center justify-center gap-2"
                >
                  <LogOut size={18} /> Logout
                </button>
              </>
            ) : (
              <NavLink
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block w-full text-center bg-slate-900 text-white py-2 rounded-lg"
              >
                Login
              </NavLink>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
