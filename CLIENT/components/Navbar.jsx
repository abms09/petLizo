import { useState, useEffect } from "react";
import { Menu, X, User, LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  useEffect(() => {
    const handleUserChange = () => {
      const updatedUser = JSON.parse(localStorage.getItem("user"));
      setUser(updatedUser);
    };

    window.addEventListener("userChanged", handleUserChange);

    return () => {
      window.removeEventListener("userChanged", handleUserChange);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.dispatchEvent(new Event("userChanged"));

    navigate("/login");
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Pets", path: "/pets" },
    { name: "Orders", path: "/orders" },
    { name: "About Us", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const linkClasses = ({ isActive }) =>
    `font-medium transition ${
      isActive
        ? "text-slate-900 border-b-2 border-slate-900 pb-1"
        : "text-slate-600 hover:text-slate-900"
    }`;

  return (
    <nav className="bg-white shadow-md border-b border-slate-200 fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <NavLink
            to="/"
            className="text-xl font-bold text-slate-800 tracking-wide"
          >
            PetStore
          </NavLink>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <NavLink key={link.name} to={link.path} className={linkClasses}>
                {link.name}
              </NavLink>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {user?.roles?.includes("seller") && (
                  <NavLink to="/seller/dashboard" className={linkClasses}>
                    Seller Dashboard
                  </NavLink>
                )}

                {user?.roles?.includes("admin") && (
                  <NavLink to="/admin/dashboard" className={linkClasses}>
                    Admin
                  </NavLink>
                )}

                <NavLink to="/profile" className={linkClasses}>
                  <span className="flex items-center gap-2">
                    <User size={18} /> Profile
                  </span>
                </NavLink>

                <button
                  onClick={logout}
                  className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-xl hover:bg-slate-700 transition"
                >
                  <LogOut size={18} /> Logout
                </button>
              </>
            ) : (
              <NavLink
                to="/login"
                className="bg-slate-800 text-white px-5 py-2 rounded-xl hover:bg-slate-700 transition"
              >
                Login
              </NavLink>
            )}
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 pb-4 space-y-3">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={linkClasses}
            >
              {link.name}
            </NavLink>
          ))}

          <div className="pt-3 border-t border-slate-200">
            {user ? (
              <>
                {user?.roles?.includes("seller") && (
                  <NavLink
                    to="/seller/dashboard"
                    onClick={() => setIsOpen(false)}
                    className={linkClasses}
                  >
                    Seller Dashboard
                  </NavLink>
                )}

                {user?.roles?.includes("admin") && (
                  <NavLink
                    to="/admin/dashboard"
                    onClick={() => setIsOpen(false)}
                    className={linkClasses}
                  >
                    Admin
                  </NavLink>
                )}

                <NavLink
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className={linkClasses}
                >
                  Profile
                </NavLink>

                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="w-full mt-2 bg-slate-800 text-white py-2 rounded-xl flex items-center justify-center gap-2"
                >
                  <LogOut size={18} /> Logout
                </button>
              </>
            ) : (
              <NavLink
                to="/login"
                onClick={() => setIsOpen(false)}
                className="w-full block text-center bg-slate-800 text-white py-2 rounded-xl"
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
