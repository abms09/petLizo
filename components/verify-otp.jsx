import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || localStorage.getItem("verifyEmail");

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [message, setMessage] = useState("");

  const inputsRef = useRef([]);

  useEffect(() => {
    if (!email) {
      navigate("/signup");
    }
  }, [email, navigate]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();

    const finalOtp = otp.join("");

    try {
      await axios.post("http://localhost:5000/auth/verify-otp", {
        email,
        otp: finalOtp,
      });

      setMessage("Verification successful 🐾");

      setOtp(["", "", "", "", "", ""]);

      navigate("/login");
    } catch (err) {
      setMessage(err.response?.data?.message || "Invalid OTP");
    }
  };

  const handleResend = async () => {
    try {
      await axios.post("http://localhost:5000/auth/resend-otp", {
        email,
      });

      setMessage("OTP resent successfully 📩");

      setOtp(["", "", "", "", "", ""]);
      inputsRef.current[0]?.focus();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to resend OTP");
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-100 via-gray-50 to-slate-200">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-96 border border-gray-200">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-slate-700">🐾 PetMart</h1>
          <p className="text-gray-500 text-sm mt-1">
            Enter the OTP sent to your email
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-5">
          <div className="flex justify-between gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={digit}
                ref={(el) => (inputsRef.current[index] = el)}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-12 h-12 text-center text-xl border rounded-lg 
                         focus:ring-2 focus:ring-slate-400 
                         focus:border-slate-400 outline-none transition"
              />
            ))}
          </div>

          <button
            type="submit"
            className="w-full bg-slate-700 hover:bg-slate-800 text-white font-medium py-2.5 rounded-lg transition duration-300"
          >
            Verify OTP
          </button>
        </form>

        {message && (
          <p
            className={`text-center mt-4 text-sm ${
              message.toLowerCase().includes("success")
                ? "text-green-500"
                : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}

        <p className="text-center text-gray-500 text-sm mt-4">
          Didn’t receive OTP?{" "}
          <span
            onClick={handleResend}
            className="text-slate-700 cursor-pointer hover:underline font-medium"
          >
            Resend
          </span>
        </p>
      </div>
    </div>
  );
}
