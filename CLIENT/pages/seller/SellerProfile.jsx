import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function SellerProfile() {
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
      const res = await axios.get("http://localhost:5000/seller/profile", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const user = res.data;

      setForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });

      setPreview(user.image ? `http://localhost:5000/${user.image}` : "");
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

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
    Object.keys(form).forEach((key) => {
      formData.append(key, form[key]);
    });

    if (image) formData.append("image", image);

    try {
      setSaving(true);

      await axios.put("http://localhost:5000/seller/updateprofile", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      alert("Profile updated ✅");
      setImage(null);
      fileRef.current.value = "";
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("All password fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      setChangingPass(true);

      await axios.put(
        "http://localhost:5000/auth/change-password",
        {
          currentPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      alert("Password updated ✅");

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/login");
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Password update failed");
    } finally {
      setChangingPass(false);
    }
  };

  if (loading) return <p>Loading profile...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Seller Profile</h2>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Profile Details
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col items-center relative">
              {preview ? (
                <div className="relative">
                  <img
                    src={preview}
                    alt="profile"
                    className="w-28 h-28 rounded-full object-cover border-4 border-gray-200 shadow"
                  />
                  <label className="absolute bottom-0 right-0 bg-slate-700 text-white p-1 rounded-full cursor-pointer text-xs">
                    ✏️
                    <input
                      type="file"
                      ref={fileRef}
                      onChange={handleImage}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <input type="file" ref={fileRef} onChange={handleImage} />
              )}
            </div>

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Name"
              className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-slate-400 outline-none"
            />

            <input
              name="email"
              value={form.email}
              readOnly
              className="w-full p-2.5 border rounded-lg bg-gray-100 cursor-not-allowed"
            />

            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone"
              className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-slate-400 outline-none"
            />

            <button
              type="submit"
              disabled={saving}
              className={`w-full py-2.5 rounded-lg text-white font-medium transition ${
                saving ? "bg-gray-400" : "bg-slate-700 hover:bg-slate-800"
              }`}
            >
              {saving ? "Saving..." : "Update Profile"}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Change Password
          </h3>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <input
              type="password"
              name="currentPassword"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              placeholder="Current Password"
              className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-red-400 outline-none"
            />

            <input
              type="password"
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              placeholder="New Password"
              className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-red-400 outline-none"
            />

            <input
              type="password"
              name="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              placeholder="Confirm Password"
              className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-red-400 outline-none"
            />

            <button
              type="submit"
              disabled={changingPass}
              className={`w-full py-2.5 rounded-lg text-white font-medium transition ${
                changingPass ? "bg-gray-400" : "bg-red-500 hover:bg-red-600"
              }`}
            >
              {changingPass ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
