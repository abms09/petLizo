import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function UserRequests() {
  const [requests, setRequests] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const navigate = useNavigate();

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("http://localhost:5000/user/requests", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const valid = res.data.requests.filter((r) => r.pet);

      setRequests(valid);
      setFiltered(valid);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    let data = [...requests];

    if (search) {
      data = data.filter(
        (r) =>
          r.pet?.name.toLowerCase().includes(search.toLowerCase()) ||
          r.seller?.name?.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (statusFilter !== "all") {
      data = data.filter((r) => r.status === statusFilter);
    }

    setFiltered(data);
    setCurrentPage(1);
  }, [search, statusFilter, requests]);

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentRequests = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const openFeedbackModal = (req) => {
    setSelectedRequest(req);
  };

  const closeModal = () => {
    setSelectedRequest(null);
    setRating(0);
    setComment("");
  };

  const submitFeedback = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/user/feedback",
        {
          petId: selectedRequest.pet._id,
          sellerId: selectedRequest.seller._id,
          rating,
          comment,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      alert("Feedback submitted ✅");
      closeModal();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to submit feedback");
    }
  };

  const openChat = (req) => {
    navigate("/chat", {
      state: {
        userId: req.user || req.userId,
        sellerId: req.seller._id,
        petId: req.pet._id,
      },
    });
  };

  if (loading) {
    return <p className="text-center py-20">Loading...</p>;
  }

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen px-4 sm:px-6 py-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">
        My Requests
      </h1>

      <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
        <input
          type="text"
          placeholder="Search..."
          className="border px-4 py-2 rounded-lg w-full sm:w-64 
                   dark:bg-slate-800 dark:text-white outline-none
                   focus:ring-2 focus:ring-slate-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border px-4 py-2 rounded-lg w-full sm:w-48
                   dark:bg-slate-800 dark:text-white outline-none
                   focus:ring-2 focus:ring-slate-400"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Requests</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* GRID */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {currentRequests.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-20">
            No requests found 🐾
          </div>
        ) : (
          currentRequests.map((req) => {
            let imageUrl = "/no-image.png";

            if (req.pet?.image?.length) {
              let img = req.pet.image[0].replace(/\\/g, "/");
              imageUrl = img.startsWith("http")
                ? img
                : `http://localhost:5000/uploads/${img}`;
            }

            return (
              <div
                key={req._id}
                className="bg-slate-50 dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300"
              >
                <div className="aspect-4/3 overflow-hidden">
                  <img
                    src={imageUrl}
                    alt="pet"
                    className="w-full h-full object-cover hover:scale-105 transition duration-500"
                  />
                </div>

                <div className="p-4 space-y-2">
                  <h2 className="font-semibold text-lg truncate">
                    {req.pet?.name}
                  </h2>

                  <p className="text-sm text-gray-500">₹{req.pet?.price}</p>

                  <p className="text-xs text-gray-500">
                    Seller: {req.seller?.name}
                  </p>

                  <span
                    className={`inline-block px-3 py-1 text-xs rounded-full font-medium
                  ${
                    req.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : req.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                  }`}
                  >
                    {req.status}
                  </span>

                  <div className="pt-3 space-y-2">
                    {req.pet?.status === "sold" ? (
                      <button
                        onClick={() => openFeedbackModal(req)}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                      >
                        ⭐ Give Feedback
                      </button>
                    ) : req.status === "pending" ? (
                      <button
                        disabled
                        className="w-full bg-yellow-400 py-2 rounded-lg text-sm"
                      >
                        Waiting
                      </button>
                    ) : req.status === "rejected" ? (
                      <button
                        disabled
                        className="w-full bg-red-400 py-2 rounded-lg text-sm"
                      >
                        Rejected
                      </button>
                    ) : (
                      <>
                        <button
                          disabled
                          className="w-full bg-green-400 py-2 rounded-lg text-sm"
                        >
                          Approved
                        </button>

                        <button
                          onClick={() => openChat(req)}
                          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                        >
                          💬 Chat with Seller
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-400 text-lg"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold text-center mb-4">
              ⭐ Rate Your Experience
            </h2>

            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => setRating(star)}
                  className={`cursor-pointer text-2xl ${
                    rating >= star ? "text-yellow-400" : "text-gray-300"
                  }`}
                >
                  ★
                </span>
              ))}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border rounded-lg p-3 mb-4 dark:bg-slate-800"
              rows={3}
              placeholder="Write your feedback..."
            />

            <button
              onClick={submitFeedback}
              disabled={!rating}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Submit Feedback
            </button>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center flex-wrap gap-2 mt-8">
          <button
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded bg-gray-200 dark:bg-slate-800 disabled:opacity-50"
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === i + 1
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 dark:bg-slate-800"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded bg-gray-200 dark:bg-slate-800 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
