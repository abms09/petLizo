import { useEffect, useState } from "react";
import axios from "axios";

export default function SoldPets() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSoldPets();
  }, []);

  const fetchSoldPets = async () => {
    try {
      const res = await axios.get("http://localhost:5000/seller/sold-pets", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = Array.isArray(res.data)
        ? res.data
        : res.data.pets || res.data.data || [];

      setPets(data);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setPets([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p className="text-center mt-6">Loading sold pets...</p>;
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center">
        Sold Pets
      </h2>

      {pets.length === 0 ? (
        <p className="text-gray-500 text-center mt-10">No pets sold yet</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {pets.map((pet) => {
            const imageUrl =
              Array.isArray(pet.image) && pet.image.length > 0
                ? `http://localhost:5000/${pet.image[0]}`
                : pet.image
                  ? `http://localhost:5000/${pet.image}`
                  : "https://via.placeholder.com/300";

            return (
              <div
                key={pet._id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition"
              >
                <img
                  src={imageUrl}
                  alt={pet.name}
                  className="h-40 sm:h-44 w-full object-cover"
                />

                <div className="p-4">
                  <h3 className="font-semibold text-base sm:text-lg">
                    {pet.name || "Unnamed Pet"}
                  </h3>

                  <p className="text-sm text-gray-600">
                    Breed: {pet.breed || "N/A"}
                  </p>

                  <p className="text-sm text-gray-600">
                    Age: {pet.age || "N/A"}
                  </p>

                  <p className="font-semibold text-green-600 mt-2">
                    ₹{pet.price || "0"}
                  </p>

                  <span className="inline-block mt-2 text-xs bg-red-100 text-red-600 px-3 py-1 rounded-full">
                    Sold
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
