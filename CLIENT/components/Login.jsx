import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [forgotMode, setForgotMode] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/auth/login", form);

      const user = res.data.user;

      const roles = Array.isArray(user?.roles)
        ? user.roles
        : user?.role
          ? [user.role]
          : [];

      console.log("FINAL ROLES:", roles);

      const fixedUser = {
        ...user,
        roles,
      };

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(fixedUser));

      window.dispatchEvent(new Event("userChanged"));

      setMessage("Login successful");

      if (roles.includes("admin")) {
        navigate("/admin/dashboard", { replace: true });
        return;
      }

      navigate("/", { replace: true });
    } catch (err) {
      console.log(err);
      setMessage(err.response?.data?.message || "Login failed");
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:5000/auth/forgot-password", {
        email: form.email,
      });

      navigate("/reset-password", {
        state: { email: form.email },
      });
    } catch (err) {
      setMessage(err.response?.data?.message || "Error sending OTP");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-100 via-gray-50 to-slate-200">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-96 border border-gray-200">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Pet<span className="text-slate-400">Lizo</span>
          </h1>

          <p className="text-sm text-slate-500 mt-2">
            {forgotMode ? "Reset your password" : "Welcome back!"}
          </p>
        </div>

        <form
          onSubmit={forgotMode ? handleForgotPassword : handleLogin}
          className="space-y-4"
        >
          <input
            type="email"
            name="email"
            placeholder="Enter email"
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-slate-400 outline-none transition"
          />
          {!forgotMode && (
            <input
              type="password"
              name="password"
              placeholder="Enter password"
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-slate-400 outline-none transition"
            />
          )}

          <button
            type="submit"
            className="w-full bg-slate-700 hover:bg-slate-800 text-white font-medium py-2.5 rounded-lg transition duration-300"
          >
            {forgotMode ? "Send Reset Link" : "Login"}
          </button>
        </form>

        <div className="text-center mt-4">
          {!forgotMode ? (
            <span
              onClick={() => setForgotMode(true)}
              className="text-slate-600 cursor-pointer hover:underline text-sm"
            >
              Forgot Password?
            </span>
          ) : (
            <span
              onClick={() => {
                setForgotMode(false);
                setMessage("");
              }}
              className="text-slate-600 cursor-pointer hover:underline text-sm"
            >
              Back to Login
            </span>
          )}
        </div>

        {message && (
          <p className="text-center text-red-500 mt-3 text-sm">{message}</p>
        )}

        {!forgotMode && (
          <p className="text-center text-gray-500 text-sm mt-5">
            Don’t have an account?{" "}
            <span
              onClick={() => navigate("/signup")}
              className="text-slate-700 cursor-pointer hover:underline font-medium"
            >
              Sign up
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
