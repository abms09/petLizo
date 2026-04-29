import { useEffect, useState } from "react";
import axios from "axios";
import { Heart, MapPin, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Wishlist() {
  const [pets, setPets] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("wishlist")) || [];
    setWishlistIds(stored);
  }, []);

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const res = await axios.get("http://localhost:5000/pets");
        const data = res.data.pets || res.data;

        const filtered = data.filter((pet) => wishlistIds.includes(pet._id));

        setPets(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (wishlistIds.length > 0) fetchPets();
    else setLoading(false);
  }, [wishlistIds]);

  const removeFromWishlist = (petId) => {
    const updated = wishlistIds.filter((id) => id !== petId);

    setWishlistIds(updated);
    localStorage.setItem("wishlist", JSON.stringify(updated));

    setPets((prev) => prev.filter((p) => p._id !== petId));

    window.dispatchEvent(new Event("wishlistUpdated"));
  };

  if (loading) {
    return <p className="text-center py-20">Loading wishlist...</p>;
  }

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen px-4 py-8">
      <div className="max-w-7xl mx-auto mb-8 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          ❤️ My Wishlist
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Your favorite pets in one place
        </p>
      </div>

      {pets.length === 0 ? (
        <p className="text-center text-gray-500 py-20">
          No wishlist items yet 🐾
        </p>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {pets.map((pet) => {
            let imageUrl = "/no-image.png";

            if (pet.image?.length) {
              let img = pet.image[0].replace(/\\/g, "/");
              imageUrl = img.startsWith("http")
                ? img
                : `http://localhost:5000/uploads/${img}`;
            }

            return (
              <div
                key={pet._id}
                className="bg-slate-50 dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300"
              >
                <div className="aspect-4/3 overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={pet.name}
                    className="w-full h-full object-cover hover:scale-105 transition duration-500"
                  />
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="font-semibold text-lg truncate">{pet.name}</h3>

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <MapPin size={14} />
                    <span className="truncate">{pet.location}</span>
                  </div>

                  <p className="text-sm font-medium text-blue-600">
                    ₹{pet.price}
                  </p>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      onClick={() => removeFromWishlist(pet._id)}
                      className="p-2 rounded-full bg-red-500 text-white 
                                 hover:bg-red-600 transition shadow-sm"
                    >
                      <Heart size={16} fill="white" />
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
          })}
        </div>
      )}
    </div>
  );
}
