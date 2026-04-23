import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function BecomeSeller() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    shopName: "",
    phone: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:5000/seller/become-seller",
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.data?.alreadySeller) {
        alert("You are already a seller");
        navigate("/seller/dashboard");
        return;
      }

      const user = JSON.parse(localStorage.getItem("user"));

      if (user) {
        if (!user.roles) user.roles = ["user"];

        if (!user.roles.includes("seller")) {
          user.roles.push("seller");
        }

        localStorage.setItem("user", JSON.stringify(user));
      }

      alert("Seller account activated successfully");

      navigate("/seller");
    } catch (error) {
      const msg = error.response?.data?.message;

      if (msg === "Already a seller") {
        alert("Already a seller");
        navigate("/seller");
        return;
      }

      alert(msg || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white flex items-center justify-center px-4 py-8 md:py-12">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-10 md:gap-16 items-center">
        {/* LEFT: INFO */}
        <div className="space-y-6 text-center md:text-left">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
            Become a Seller 🐾
          </h2>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-md mx-auto md:mx-0">
            Start selling pets, connect with buyers, and grow your business
            easily on our platform.
          </p>

          <div className="space-y-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <span className="text-green-500">✔</span> Reach more buyers
              instantly
            </div>

            <div className="flex items-center gap-2 justify-center md:justify-start">
              <span className="text-green-500">✔</span> Easy pet listing &
              management
            </div>

            <div className="flex items-center gap-2 justify-center md:justify-start">
              <span className="text-green-500">✔</span> Secure and trusted
              platform
            </div>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900 p-5 sm:p-6 md:p-8 rounded-2xl shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-center md:text-left">
            Seller Registration
          </h3>

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="text"
              name="shopName"
              placeholder="Shop Name (Optional)"
              value={form.shopName}
              onChange={handleChange}
              className="w-full px-4 py-2.5 sm:py-3 text-sm rounded-lg border bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-slate-400"
            />

            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 sm:py-3 text-sm rounded-lg border bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-slate-400"
            />

            <textarea
              name="address"
              placeholder="Address"
              value={form.address}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-4 py-2.5 sm:py-3 text-sm rounded-lg border bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-slate-400"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 rounded-lg font-medium hover:opacity-80 transition active:scale-[0.98]"
            >
              {loading ? "Processing..." : "Create Seller Account"}
            </button>

            {status && (
              <p
                className={`text-center text-sm ${
                  status.toLowerCase().includes("success")
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {status}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
