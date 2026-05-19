import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ImageSlider from "../../components/ImageSlider";

export default function SoldPets() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);
  const [totalPets, setTotalPets] = useState(0);

  const itemsPerPage = 6;

  const navigate = useNavigate();

  const fetchPets = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const res = await axios.get("http://localhost:5000/admin/sold-pets", {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search,
        },

        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPets(res.data.pets || []);

      setTotalPages(res.data.totalPages || 1);

      setTotalPets(res.data.totalPets || 0);
    } catch (error) {
      console.error("Error fetching pets:", error);

      if (error.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
      }

      setPets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, [currentPage, search]);

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Sold Pets</h2>

          <p className="text-sm text-gray-500">
            List of pets that have been sold
          </p>
        </div>

        <div className="bg-white border rounded-xl px-4 py-3 shadow-sm">
          <p className="text-xs text-gray-500">Total Sold Pets</p>

          <h3 className="text-2xl font-bold text-red-600">{totalPets}</h3>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border mb-6">
        <input
          type="text"
          placeholder="Search by pet name or category..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
        />
      </div>

      {loading ? (
        <div className="text-center py-16">
          <p className="text-gray-500 animate-pulse">Loading sold pets...</p>
        </div>
      ) : pets.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border">
          <p className="text-gray-400 text-lg">🐾 No sold pets found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets.map((pet) => (
              <div
                key={pet._id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition overflow-hidden border"
              >
                <ImageSlider images={pet.image} height="h-52" />

                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {pet.name}
                      </h3>

                      <p className="text-sm text-gray-500">
                        {pet.category || "Unknown"}
                      </p>
                    </div>

                    <p className="font-bold text-slate-800">₹{pet.price}</p>
                  </div>

                  <div className="mt-3 space-y-1 text-sm text-gray-600">
                    <p>Gender: {pet.gender || "N/A"}</p>

                    <p>
                      Seller:{" "}
                      <span className="font-medium">
                        {pet.seller?.name || "Unknown"}
                      </span>
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-600 font-medium">
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

          {totalPages > 1 && (
            <div className="flex flex-wrap justify-center items-center gap-2 mt-10">
              <button
                onClick={() => setCurrentPage((prev) => prev - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              >
                Prev
              </button>

              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`px-4 py-2 rounded-lg text-sm transition ${
                    currentPage === index + 1
                      ? "bg-slate-800 text-white"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  {index + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
