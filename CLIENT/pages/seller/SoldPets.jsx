import { useEffect, useState } from "react";
import axios from "axios";

export default function SoldPets() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const itemsPerPage = 8;

  useEffect(() => {
    fetchSoldPets();
  }, [currentPage, search]);

  const fetchSoldPets = async () => {
    try {
      setLoading(true);

      const res = await axios.get("http://localhost:5000/seller/sold-pets", {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search,
        },

        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setPets(res.data.pets || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error(err.response?.data || err.message);

      setPets([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <p className="text-center mt-10 text-gray-500">Loading sold pets...</p>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center">
            Sold Pets
          </h2>
        </div>

        <div className="flex justify-center mb-8">
          <input
            type="text"
            placeholder="Search sold pets..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="
              w-full sm:w-72
              border border-gray-300
              rounded-lg px-4 py-2
              outline-none
              focus:ring-2 focus:ring-slate-400
            "
          />
        </div>

        {pets.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No sold pets found 🐾</p>
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {pets.map((pet) => {
                let imageUrl = "/no-image.png";

                if (Array.isArray(pet.image) && pet.image.length > 0) {
                  imageUrl = `http://localhost:5000/uploads/${pet.image[0]}`;
                } else if (pet.image) {
                  imageUrl = `http://localhost:5000/uploads/${pet.image}`;
                }

                return (
                  <div
                    key={pet._id}
                    className="
                      bg-white rounded-2xl
                      overflow-hidden
                      shadow-sm hover:shadow-xl
                      transition duration-300
                      hover:-translate-y-1
                    "
                  >
                    <div className="h-44 overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={pet.name}
                        className="
                          w-full h-full object-cover
                          hover:scale-105 transition duration-500
                        "
                        onError={(e) => {
                          e.target.src = "/no-image.png";
                        }}
                      />
                    </div>

                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-lg truncate">
                          {pet.name || "Unnamed Pet"}
                        </h3>

                        <span
                          className="
                            text-xs bg-red-100
                            text-red-600
                            px-2 py-1 rounded-full
                          "
                        >
                          SOLD
                        </span>
                      </div>

                      <p className="text-sm text-gray-600">
                        Breed: {pet.breed || "N/A"}
                      </p>

                      <p className="text-sm text-gray-600">
                        Age: {pet.age || "N/A"}
                      </p>

                      <p className="text-sm text-gray-600">
                        Category: {pet.category || "N/A"}
                      </p>

                      <p className="text-sm text-gray-600">
                        📍 {pet.location || "Unknown"}
                      </p>

                      <p className="font-semibold text-green-600 mt-3 text-lg">
                        ₹{pet.price || 0}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10 flex-wrap">
                <button
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  disabled={currentPage === 1}
                  className="
                    px-4 py-2 rounded-lg
                    bg-gray-200 hover:bg-gray-300
                    disabled:opacity-50
                  "
                >
                  Prev
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`
                      px-4 py-2 rounded-lg transition
                      ${
                        currentPage === i + 1
                          ? "bg-slate-900 text-white"
                          : "bg-gray-200 hover:bg-gray-300"
                      }
                    `}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={currentPage === totalPages}
                  className="
                    px-4 py-2 rounded-lg
                    bg-gray-200 hover:bg-gray-300
                    disabled:opacity-50
                  "
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
