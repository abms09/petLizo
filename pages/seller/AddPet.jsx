import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AddPet() {
  const [form, setForm] = useState({
    name: "",
    breed: "",
    age: "",
    price: "",
    category: "",
    description: "",
    gender: "male",
    location: "",
  });

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.roles?.includes("seller")) {
      navigate("/become-seller");
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);

    if (files.length > 4) {
      setMessage("Max 4 images allowed");
      return;
    }

    setImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (images.length === 0) {
      setMessage("Upload at least one image");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const token = localStorage.getItem("token");

      const formData = new FormData();

      for (let key in form) {
        formData.append(key, form[key]);
      }

      images.forEach((img) => {
        formData.append("images", img);
      });

      await axios.post("http://localhost:5000/seller/addpet", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage("Pet added successfully ✅");

      setForm({
        name: "",
        breed: "",
        age: "",
        price: "",
        category: "",
        description: "",
        gender: "male",
        location: "",
      });

      setImages([]);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Failed to add pet");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-start py-8 px-3 sm:px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-md p-5 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 text-center mb-5 sm:mb-6">
          Add New Pet
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Pet Name"
            className="input"
            required
          />

          <input
            name="breed"
            value={form.breed}
            onChange={handleChange}
            placeholder="Breed"
            className="input"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              name="age"
              type="number"
              min="0"
              value={form.age}
              onChange={handleChange}
              placeholder="Age"
              className="input"
              required
            />

            <input
              name="price"
              type="number"
              min="0"
              value={form.price}
              onChange={handleChange}
              placeholder="Price"
              className="input"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="input"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="input"
              required
            >
              <option value="">Category</option>
              <option value="dog">Dog</option>
              <option value="cat">Cat</option>
              <option value="bird">Bird</option>
              <option value="other">Other</option>
            </select>
          </div>

          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Location"
            className="input"
            required
          />

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
            rows="3"
            className="input resize-none"
          />

          <div className="border border-dashed border-gray-300 rounded-lg p-3 text-center bg-gray-50">
            <p className="text-xs text-gray-500 mb-2">
              Upload up to 4 images (JPG/PNG)
            </p>

            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => {
                const files = Array.from(e.target.files);

                if (files.length > 4) {
                  alert("You can upload maximum 4 images");
                  return;
                }

                const valid = files.filter(
                  (file) => file.size < 2 * 1024 * 1024,
                );

                if (valid.length !== files.length) {
                  alert("Each image must be less than 2MB");
                }

                setImages(valid);
              }}
              className="text-xs"
              required
            />

            {images.length > 0 && (
              <div className="flex gap-2 mt-3 justify-center flex-wrap">
                {images.map((img, i) => (
                  <div key={i} className="relative">
                    <img
                      src={URL.createObjectURL(img)}
                      className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-md border"
                      alt="preview"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setImages((prev) =>
                          prev.filter((_, index) => index !== i),
                        )
                      }
                      className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-2 rounded-lg hover:bg-slate-700 transition text-sm font-medium"
          >
            {loading ? "Adding..." : "Add Pet"}
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
      </div>

      <style>
        {`
        .input {
          width: 100%;
          padding: 8px 10px;
          font-size: 14px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          background: #f9fafb;
          outline: none;
          transition: 0.2s;
        }

        .input:focus {
          border-color: #111827;
          background: white;
        }
      `}
      </style>
    </div>
  );
}
