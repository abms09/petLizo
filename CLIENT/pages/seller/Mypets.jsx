import { useEffect, useState } from "react";
import axios from "axios";
import EditPet from "./EditPet";
import ImageSlider from "../../components/ImageSlider";

export default function MyPets() {
  const [pets, setPets] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPet, setEditingPet] = useState(null);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("available");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchPets();
  }, []);

  useEffect(() => {
    document.body.style.overflow = editingPet ? "hidden" : "auto";
  }, [editingPet]);

  const fetchPets = async () => {
    try {
      setLoading(true);
      setError("");

      if (!user?.roles?.includes("seller")) {
        setError("You are not authorized");
        return;
      }

      const res = await axios.get("http://localhost:5000/seller/mypets", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = Array.isArray(res.data) ? res.data : res.data.pets || [];

      setPets(data);
      setFiltered(data);
      setCurrentPage(1);
    } catch (err) {
      setError("Failed to load pets");
      setPets([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsSold = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/pets/sold/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      fetchPets();
    } catch (err) {
      console.log(err);
      alert("Failed to mark as sold");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this pet?")) return;

    try {
      await axios.delete(`http://localhost:5000/seller/deletepet/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setPets((prev) => prev.filter((p) => p._id !== id));
    } catch {
      alert("Delete failed");
    }
  };

  const handleEditClick = (pet) => {
    setEditingPet(pet);
  };

  useEffect(() => {
    let data = [...pets];

    if (statusFilter !== "all") {
      data = data.filter((p) => p.status?.toLowerCase() === statusFilter);
    }

    if (search) {
      data = data.filter((p) =>
        p.name?.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (categoryFilter !== "all") {
      data = data.filter((p) => p.category?.toLowerCase() === categoryFilter);
    }

    setFiltered(data);
    setCurrentPage(1);
  }, [search, categoryFilter, statusFilter, pets]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const currentPets = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [filtered]);

  if (loading) return <p className="text-center py-20">Loading...</p>;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center">
        My Pets
      </h2>

      <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 mb-6">
        <input
          type="text"
          placeholder="Search pets..."
          className="border px-3 py-2 rounded w-full sm:w-60"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border px-3 py-2 rounded w-full sm:w-auto"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">All Categories</option>
          <option value="dog">Dog</option>
          <option value="cat">Cat</option>
          <option value="bird">Bird</option>
        </select>

        <select
          className="border px-3 py-2 rounded w-full sm:w-auto"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="available">Available</option>
          <option value="sold">Sold</option>
          <option value="all">All</option>
        </select>
      </div>

      {editingPet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-2">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setEditingPet(null)}
          ></div>

          <div className="relative z-10 w-full max-w-lg">
            <EditPet
              pet={editingPet}
              onUpdated={() => {
                setEditingPet(null);
                fetchPets();
              }}
            />
          </div>
        </div>
      )}

      {currentPets.length === 0 ? (
        <p className="text-center text-gray-500">No pets found</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {currentPets.map((pet) => (
            <div
              key={pet._id}
              className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition relative ${
                pet.status === "sold" ? "opacity-70" : ""
              }`}
            >
              {pet.status?.toLowerCase() === "sold" && (
                <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs rounded z-10">
                  SOLD
                </span>
              )}

              <div className="h-40 sm:h-48 overflow-hidden">
                <ImageSlider images={pet.image} />
              </div>

              <div className="p-4">
                <h3 className="font-bold text-base sm:text-lg">{pet.name}</h3>

                <p className="text-sm text-gray-600">
                  {pet.breed} • {pet.gender}
                </p>

                <p className="text-sm text-gray-600">📍 {pet.location}</p>

                <p className="text-sm text-gray-600 line-clamp-2">
                  {pet.description || "No description"}
                </p>

                <p className="font-semibold text-blue-600 mt-2">₹{pet.price}</p>

                <div className="flex flex-col sm:flex-row gap-2 mt-4">
                  <button
                    onClick={() => handleEditClick(pet)}
                    disabled={pet.status === "sold"}
                    className="flex-1 bg-slate-800 text-white py-2 rounded-lg text-sm disabled:opacity-50"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(pet._id)}
                    className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm"
                  >
                    Delete
                  </button>

                  {pet.status?.toLowerCase() !== "sold" && (
                    <button
                      onClick={() => markAsSold(pet._id)}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm"
                    >
                      Sold
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex flex-wrap justify-center mt-8 gap-2">
          <button
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === i + 1 ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
