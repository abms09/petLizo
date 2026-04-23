import { useEffect, useState } from "react";
import axios from "axios";

export default function SoldPets() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get("http://localhost:5000/admin/sold-pets", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = Array.isArray(res.data)
          ? res.data
          : res.data.pets || res.data.data || [];

        setPets(data);
      } catch (error) {
        console.error("Error fetching pets:", error);
        setPets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, []);

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Sold Pets</h2>
        <p className="text-sm text-gray-500">
          List of pets that have been sold
        </p>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading pets...</p>
      ) : pets.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-400">No sold pets found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map((pet) => (
            <div
              key={pet._id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden"
            >
              <img
                src={
                  Array.isArray(pet.image) && pet.image.length > 0
                    ? `http://localhost:5000/uploads/${pet.image[0]}`
                    : "https://via.placeholder.com/300x200?text=No+Image"
                }
                alt={pet.name}
                className="h-44 w-full object-cover"
              />

              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {pet.name}
                </h3>

                <p className="text-sm text-gray-500">
                  {pet.category || "Unknown Category"}
                </p>

                <p className="text-sm text-gray-500">
                  Gender: {pet.gender || "N/A"}
                </p>

                <p className="font-bold text-slate-800 mt-1">₹{pet.price}</p>

                <div className="mt-3 flex justify-between items-center">
                  <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-600">
                    Sold
                  </span>

                  <span className="text-xs text-gray-400">
                    {new Date(pet.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
