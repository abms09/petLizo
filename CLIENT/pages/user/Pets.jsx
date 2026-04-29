import { useState, useEffect } from "react";
import axios from "axios";
import { Heart, MapPin, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Pets() {
  const [pets, setPets] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [wishlist, setWishlist] = useState(() => {
    return new Set(JSON.parse(localStorage.getItem("wishlist")) || []);
  });

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get("http://localhost:5000/pets", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data.pets || res.data;

        const availablePets = data.filter(
          (pet) => pet.status === "available" || pet.status === "pending",
        );

        setPets(availablePets);
        setFiltered(availablePets);
      } catch (err) {
        console.error(err);
        setError("Failed to load pets");
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, []);

  const toggleWishlist = (petId) => {
    const updated = new Set(wishlist);

    if (updated.has(petId)) {
      updated.delete(petId);
    } else {
      updated.add(petId);
    }

    const updatedArray = [...updated];

    setWishlist(new Set(updatedArray));
    localStorage.setItem("wishlist", JSON.stringify(updatedArray));

    window.dispatchEvent(new Event("wishlistUpdated"));
  };

  useEffect(() => {
    let data = [...pets];

    if (search) {
      data = data.filter((pet) =>
        pet.name?.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (categoryFilter !== "all") {
      data = data.filter((pet) => pet.category === categoryFilter);
    }

    setFiltered(data);
    setCurrentPage(1);
  }, [search, categoryFilter, pets]);

  const indexOfLast = currentPage * itemsPerPage;
  const currentPets = filtered.slice(indexOfLast - itemsPerPage, indexOfLast);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  if (loading) {
    return <div className="text-center py-20">Loading pets...</div>;
  }

  if (error) {
    return <div className="text-center py-20 text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white min-h-screen">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-2xl sm:text-3xl font-bold">Browse Pets</h1>
        <p className="text-gray-500 text-sm sm:text-base">
          Find your perfect companion
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-6 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search pet..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-4 py-2 rounded-lg w-full sm:w-64 dark:bg-slate-800 dark:text-white"
        />

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border px-4 py-2 rounded-lg w-full sm:w-48 dark:bg-slate-800 dark:text-white"
        >
          <option value="all">All Categories</option>
          <option value="dog">Dog</option>
          <option value="cat">Cat</option>
          <option value="bird">Bird</option>
          <option value="other">Other</option>
        </select>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {currentPets.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-20">
            No pets found 🐾
          </div>
        ) : (
          currentPets.map((pet) => {
            let imageUrl = "/no-image.png";

            if (Array.isArray(pet?.image) && pet.image.length > 0) {
              let img = pet.image[0].replace(/\\/g, "/");
              imageUrl = img.startsWith("http")
                ? img
                : `http://localhost:5000/uploads/${img}`;
            }

            const isWishlisted = wishlist.has(pet._id);

            return (
              <div
                key={pet._id}
                className="relative bg-slate-50 dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300"
              >
                {pet.status === "pending" && (
                  <span className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 text-xs rounded">
                    REQUESTED
                  </span>
                )}

                <div className="aspect-4/3 overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={pet.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="font-semibold text-lg truncate">{pet.name}</h3>

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <MapPin size={14} />
                    <span>{pet.location}</span>
                  </div>

                  <p className="text-sm text-gray-500">₹{pet.price}</p>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      onClick={() => toggleWishlist(pet._id)}
                      className={`p-2 rounded-full transition ${
                        isWishlisted
                          ? "bg-red-500 text-white"
                          : "hover:bg-gray-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      <Heart size={16} fill={isWishlisted ? "red" : "none"} />
                    </button>

                    <Link
                      to={`/pets/${pet._id}`}
                      className="flex items-center gap-1.5 text-xs font-medium 
             bg-slate-900 text-white 
             px-3 py-1.5 rounded-full
             hover:bg-slate-700 
             transition-all duration-200 
             shadow-sm hover:shadow-md group"
                    >
                      View Details
                      <ArrowRight
                        size={14}
                        className="transition-transform duration-200 group-hover:translate-x-1"
                      />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </section>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pb-10">
          <button
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 rounded"
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
            className="px-3 py-1 bg-gray-200 rounded"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
