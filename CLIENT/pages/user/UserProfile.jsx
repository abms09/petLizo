import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function UserProfile() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [preview, setPreview] = useState("");
  const [image, setImage] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPass, setChangingPass] = useState(false);

  const fileRef = useRef();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get("http://localhost:5000/user/profile", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const user = res.data;

      setForm({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
      });

      setPreview(
        user?.image ? `http://localhost:5000/uploads/${user.image}` : "",
      );

      localStorage.setItem("user", JSON.stringify(user));
      window.dispatchEvent(new Event("storage"));
    } catch (err) {
      console.log("PROFILE ERROR:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handlePasswordChange = (e) =>
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });

  const handleImage = (e) => {
    const file = e.target.files[0];
    setImage(file);

    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("phone", form.phone);

    if (image) {
      formData.append("image", image);
    }

    try {
      setSaving(true);

      await axios.put("http://localhost:5000/user/updateprofile", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      alert("Profile updated ✅");

      setImage(null);
      fileRef.current.value = "";

      await fetchProfile();
    } catch (err) {
      console.log(err.response?.data || err.message);
      alert("Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (newPassword !== confirmPassword) {
      return alert("Passwords do not match");
    }

    try {
      setChangingPass(true);

      await axios.put(
        "http://localhost:5000/auth/change-password",
        { currentPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      alert("Password updated ✅");

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      navigate("/login");
    } catch (err) {
      console.log(err.response?.data || err.message);
      alert("Password update failed");
    } finally {
      setChangingPass(false);
    }
  };

  if (loading) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  return (
    <div className="min-h-screen bg-slate-100 py-6 md:py-10 px-3 sm:px-6">
      <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
        {/* LEFT - PROFILE CARD */}
        <div className="bg-white p-5 md:p-6 rounded-3xl shadow text-center">
          <div className="relative w-fit mx-auto">
            <img
              src={preview || "https://via.placeholder.com/120"}
              alt="profile"
              className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover border"
            />

            <label className="absolute bottom-0 right-0 bg-slate-800 text-white p-1.5 rounded-full cursor-pointer text-xs">
              ✎
              <input type="file" hidden ref={fileRef} onChange={handleImage} />
            </label>
          </div>

          <h2 className="mt-3 font-semibold text-base md:text-lg">
            {form.name}
          </h2>

          <p className="text-gray-500 text-xs md:text-sm break-all">
            {form.email}
          </p>

          <p className="text-gray-400 text-xs mt-1">Tap icon to update photo</p>
        </div>

        <div className="md:col-span-2 space-y-6">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-5 md:p-6 rounded-3xl shadow space-y-4"
          >
            <h3 className="font-semibold text-lg">Profile Details</h3>

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-slate-300 outline-none"
              placeholder="Name"
            />

            <input
              value={form.email}
              readOnly
              className="w-full border p-2.5 rounded-lg bg-gray-100 text-sm"
            />

            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full border p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-slate-300 outline-none"
              placeholder="Phone"
            />

            <button className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-lg text-sm transition">
              {saving ? "Saving..." : "Update Profile"}
            </button>
          </form>

          <form
            onSubmit={handlePasswordSubmit}
            className="bg-white p-5 md:p-6 rounded-3xl shadow space-y-4"
          >
            <h3 className="font-semibold text-lg">Change Password</h3>

            <input
              type="password"
              name="currentPassword"
              onChange={handlePasswordChange}
              placeholder="Current Password"
              className="w-full border p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-red-300 outline-none"
            />

            <input
              type="password"
              name="newPassword"
              onChange={handlePasswordChange}
              placeholder="New Password"
              className="w-full border p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-red-300 outline-none"
            />

            <input
              type="password"
              name="confirmPassword"
              onChange={handlePasswordChange}
              placeholder="Confirm Password"
              className="w-full border p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-red-300 outline-none"
            />

            <button className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-lg text-sm transition">
              {changingPass ? "Updating..." : "Change Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
