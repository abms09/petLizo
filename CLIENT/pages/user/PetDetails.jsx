import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import ImageSlider from "../../components/ImageSlider";

export default function PetDetails() {
  const { id } = useParams();

  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);

  const [alreadyRequested, setAlreadyRequested] = useState(false);

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const res = await axios.get( `${import.meta.env.VITE_API_URL}/pets/${id}`);

        setPet(res.data.pet);

        const user = JSON.parse(localStorage.getItem("user"));

        const userId = user?._id || user?.id;

        if (res.data.pet?.requests?.includes(userId)) {
          setAlreadyRequested(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPet();
  }, [id]);

  const requestPet = async (petId) => {
    const token = localStorage.getItem("token");

    try {
      await axios.post(
         `${import.meta.env.VITE_API_URL}/user/request-pet/${petId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      alert("Request sent successfully");

      setAlreadyRequested(true);
    } catch (err) {
      alert(err.response?.data?.message || "Request failed");
    }
  };

  if (loading) {
    return <p className="text-center py-20">Loading...</p>;
  }

  if (!pet) {
    return <p className="text-center py-20">Pet not found</p>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-10 grid md:grid-cols-2 gap-8 md:gap-10">
      <div className="w-full">
        <ImageSlider images={pet.image} />
      </div>

      <div className="space-y-4">
        <h1 className="text-2xl md:text-3xl font-bold">{pet.name}</h1>

        <div className="flex flex-wrap gap-2">
          {pet.status === "sold" && (
            <span className="bg-red-100 text-red-700 px-3 py-1 text-xs md:text-sm rounded-full">
              ❌ Sold
            </span>
          )}

          {alreadyRequested && pet.status !== "sold" && (
            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 text-xs md:text-sm rounded-full">
              ⏳ Requested
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm md:text-base text-gray-600">
          <p>
            <span className="font-medium">Breed:</span> {pet.breed || "N/A"}
          </p>

          <p>
            <span className="font-medium">Age:</span> {pet.age || "N/A"}
          </p>

          <p>
            <span className="font-medium">Gender:</span> {pet.gender || "N/A"}
          </p>

          <p>
            <span className="font-medium">Category:</span>{" "}
            {pet.category || "N/A"}
          </p>

          <p className="col-span-2">
            <span className="font-medium">Location:</span>{" "}
            {pet.location || "N/A"}
          </p>
        </div>

        <div className="text-sm md:text-base text-gray-600 leading-relaxed">
          {pet.description || "No description available"}
        </div>

        <div className="text-2xl font-bold text-blue-600">₹{pet.price}</div>

        <div className="text-sm text-gray-500">
          Seller: <span className="font-medium">{pet.seller?.name}</span>
        </div>

        <div className="pt-2">
          {pet.status === "sold" ? (
            <button
              disabled
              className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold cursor-not-allowed"
            >
              SOLD
            </button>
          ) : alreadyRequested ? (
            <button
              disabled
              className="w-full bg-yellow-500 text-white py-3 rounded-lg font-semibold cursor-not-allowed"
            >
              REQUESTED ⏳
            </button>
          ) : (
            <button
              onClick={() => requestPet(pet._id)}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Request Pet
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
