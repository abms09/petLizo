import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const [form, setForm] = useState({
    otp: "",
    newPassword: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      navigate("/login");
    }
  }, [email, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setMessage("Invalid request. Please try again.");
      return;
    }

    setLoading(true);

    try {
      await axios.post("http://localhost:5000/auth/reset-password", {
        email,
        otp: form.otp,
        newPassword: form.newPassword,
      });

      setMessage("Password reset successful 🎉");

      setForm({ otp: "", newPassword: "" });

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-100 via-gray-50 to-slate-200">
      <div className="bg-white shadow-2xl rounded-3xl p-8 w-96 border border-gray-200">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-slate-700">
            🔐 Reset Password
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Enter OTP and set a new password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="otp"
            placeholder="Enter OTP"
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-slate-400 outline-none transition"
          />

          <input
            type="password"
            name="newPassword"
            placeholder="New Password"
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-slate-400 outline-none transition"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 rounded-xl text-white font-medium transition ${
              loading ? "bg-gray-400" : "bg-slate-700 hover:bg-slate-800"
            }`}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        {message && (
          <p
            className={`text-center mt-4 text-sm ${
              message.includes("successful") ? "text-green-500" : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}

        <p className="text-center text-gray-500 text-sm mt-5">
          Back to{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-slate-700 font-medium cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
