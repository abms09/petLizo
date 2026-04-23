import { useState, useEffect } from "react";
import axios from "axios";

export default function EditPet({ pet, onUpdated }) {
  const [form, setForm] = useState({
    name: "",
    breed: "",
    age: "",
    price: "",
    category: "",
    description: "",
    gender: "",
    location: "",
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (pet) {
      setForm({
        name: pet.name || "",
        breed: pet.breed || "",
        age: pet.age || "",
        price: pet.price || "",
        category: pet.category || "",
        description: pet.description || "",
        gender: pet.gender || "",
        location: pet.location || "",
      });

      setPreview(
        pet.image
          ? `http://localhost:5000/${pet.image}`
          : "https://via.placeholder.com/300",
      );
    }
  }, [pet]);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleImage = (e) => {
    const file = e.target.files[0];
    setImage(file);

    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!user?.roles?.includes("seller")) {
      setError("You are not authorized to edit pets");
      return;
    }

    if (!form.name || !form.breed || !form.age || !form.price) {
      setError("All fields are required");
      return;
    }

    if (form.age <= 0 || form.price <= 0) {
      setError("Age and price must be positive");
      return;
    }

    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      formData.append(key, form[key]);
    });

    if (image) formData.append("image", image);

    try {
      setLoading(true);

      await axios.put(
        `http://localhost:5000/seller/editpet/${pet._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      onUpdated();
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError("Update failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border relative max-w-lg mx-auto">
      <button
        type="button"
        onClick={onUpdated}
        className="absolute top-3 right-4 text-gray-500 hover:text-red-500 text-xl"
      >
        ✕
      </button>

      <h3 className="text-2xl font-bold text-center text-gray-700 mb-4">
        Edit {pet?.name}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {preview && (
          <img
            src={preview}
            alt="preview"
            className="w-full h-40 object-cover rounded-lg border"
          />
        )}

        <div className="space-y-3">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Pet Name"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
          />

          <input
            name="breed"
            value={form.breed}
            onChange={handleChange}
            placeholder="Breed"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
          />

          <input
            name="age"
            type="number"
            value={form.age}
            onChange={handleChange}
            placeholder="Age"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
          />

          <input
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            placeholder="Price"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
          />
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select Category</option>
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
          placeholder="Location (e.g. Kochi, Kerala)"
          className="w-full px-3 py-2 text-sm rounded bg-orange-100"
          required
        />
        <textarea
          name="description"
          placeholder="Enter pet description"
          value={form.description}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          type="file"
          onChange={handleImage}
          className="w-full p-2 border rounded-lg bg-gray-50 cursor-pointer"
        />

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className={`flex-1 py-2 rounded-lg text-white font-semibold transition ${
              loading
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {loading ? "Updating..." : "Update Pet"}
          </button>

          <button
            type="button"
            onClick={onUpdated}
            className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-2 rounded-lg transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
