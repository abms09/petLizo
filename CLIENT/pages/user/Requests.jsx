import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function UserRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [paymentLoading, setPaymentLoading] = useState(null);

  const navigate = useNavigate();

  const fetchRequests = async (page) => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await axios.get(
         `${import.meta.env.VITE_API_URL}/user/requests?page=${page}&limit=4`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = res.data;

      setRequests(data.requests || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(currentPage);
  }, [currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const filtered = requests.filter((r) => {
    const matchSearch =
      r.pet?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.seller?.name?.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === "all" || r.status === statusFilter;

    return matchSearch && matchStatus;
  });

  const isFiltering = search.trim() !== "" || statusFilter !== "all";

  const openFeedbackModal = (req) => setSelectedRequest(req);

  const closeModal = () => {
    setSelectedRequest(null);
    setRating(0);
    setComment("");
  };

  const submitFeedback = async () => {
    try {
      const token = localStorage.getItem("token");

      const petId = selectedRequest?.pet?._id || selectedRequest?.pet;

      const sellerId = selectedRequest?.seller?._id || selectedRequest?.seller;

      console.log("PET ID:", petId);
      console.log("SELLER ID:", sellerId);

      await axios.post(
         `${import.meta.env.VITE_API_URL}/user/feedback`,
        {
          petId,
          sellerId,
          rating,
          comment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
    const currentUser = JSON.parse(localStorage.getItem("user"));

    const currentUserId = currentUser?._id || currentUser?.id;
    const sellerId = req?.seller?._id || req?.seller;
    const buyerId = req?.buyer?._id || req?.buyer;

    const otherUserId = sellerId === currentUserId ? buyerId : sellerId;

    if (!otherUserId) return alert("Chat user not found");

    navigate(`/chat/${otherUserId}`);
  };

  const handlePayment = async (req) => {
    try {
      setPaymentLoading(req._id);

      const token = localStorage.getItem("token");

      const res = await axios.post(
         `${import.meta.env.VITE_API_URL}/payment/create-order`,
        { requestId: req._id },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const { order, key } = res.data;

      const options = {
        key,
        amount: order.amount,
        currency: order.currency,
        name: "PetMart",
        description: `Advance payment for ${req.pet?.name}`,
        order_id: order.id,

        handler: async function (response) {
          try {
            await axios.post(
               `${import.meta.env.VITE_API_URL}/payment/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                requestId: req._id,
              },
              { headers: { Authorization: `Bearer ${token}` } },
            );

            alert("Payment successful 🎉");
            fetchRequests(currentPage);
          } catch (err) {
            console.error(err);
            alert("Payment verification failed");
          }
        },

        prefill: {
          name: JSON.parse(localStorage.getItem("user"))?.name || "",
          email: JSON.parse(localStorage.getItem("user"))?.email || "",
        },

        theme: { color: "#16a34a" },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Payment failed");
    } finally {
      setPaymentLoading(null);
    }
  };

  if (loading) return <p className="text-center py-20">Loading...</p>;

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen px-4 sm:px-6 py-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-slate-900 dark:text-white">
        My Requests
      </h1>

      <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
        <input
          type="text"
          placeholder="Search..."
          className="border px-4 py-2 rounded-lg w-full sm:w-64 dark:bg-slate-800 dark:text-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border px-4 py-2 rounded-lg w-full sm:w-48 dark:bg-slate-800 dark:text-white"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Requests</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-20">
            No requests found 🐾
          </div>
        ) : (
          filtered.map((req) => {
            const isSold = req.pet?.status === "sold";

            const isBooked =
              req.pet?.status === "booked" || req.paymentStatus === "partial";

            const isAdvancePaid = req.paymentStatus === "partial" && !isSold;

            let imageUrl = "/no-image.png";

            if (req.pet?.image?.length > 0) {
              let img = req.pet.image[0]?.replace(/\\/g, "/");

              imageUrl = img?.startsWith("http")
                ? img
                :  `${import.meta.env.VITE_API_URL}/uploads/${img}`;
            }

            return (
              <div
                key={req._id}
                className="bg-slate-50 dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition"
              >
                <div className="aspect-4/3 overflow-hidden">
                  <img
                    src={imageUrl}
                    alt="pet"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "/no-image.png";
                    }}
                  />
                </div>

                <div className="p-4 space-y-2">
                  <h2 className="font-semibold text-lg truncate text-white">
                    {req.pet?.name}
                  </h2>

                  <p className="text-sm text-gray-500">₹{req.pet?.price}</p>

                  <p className="text-xs text-gray-500">
                    Seller: {req.seller?.name}
                  </p>

                  <span className="px-3 py-1 text-xs rounded-full font-medium bg-gray-200">
                    {req.status}
                  </span>

                  <div className="pt-3 space-y-2">
                    {isSold ? (
                      <>
                        <button
                          onClick={() => openFeedbackModal(req)}
                          className="w-full bg-slate-900 text-white py-2.5 rounded-xl"
                        >
                          ⭐ Rate Experience
                        </button>

                        <button
                          onClick={() => openChat(req)}
                          className="w-full bg-blue-600 text-white py-2.5 rounded-xl"
                        >
                          💬 Contact Seller
                        </button>
                      </>
                    ) : isBooked ? (
                      <button
                        disabled
                        className="w-full bg-green-500 text-white py-2.5 rounded-xl"
                      >
                        💰 Advance Paid (Waiting Final Payment)
                      </button>
                    ) : req.status === "pending" ? (
                      <button
                        disabled
                        className="w-full bg-yellow-400 text-white py-2.5 rounded-xl"
                      >
                        ⏳ Waiting Approval
                      </button>
                    ) : req.status === "rejected" ? (
                      <button
                        disabled
                        className="w-full bg-red-400 text-white py-2.5 rounded-xl"
                      >
                        ❌ Rejected
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePayment(req)}
                        className="w-full bg-green-600 text-white py-2.5 rounded-xl"
                      >
                        💳 Pay Advance
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {!isFiltering && totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
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
        </div>
      )}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                Rate Your Experience
              </h2>

              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-red-500 text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Pet</p>

                <h3 className="font-semibold text-lg text-slate-800 dark:text-white">
                  {selectedRequest.pet?.name}
                </h3>
              </div>

              <div>
                <p className="text-sm text-gray-500">Seller</p>

                <h3 className="font-semibold text-slate-800 dark:text-white">
                  {selectedRequest.seller?.name}
                </h3>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Rating</p>

                <div className="flex gap-2 text-3xl">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`transition ${
                        rating >= star
                          ? "text-yellow-400 scale-110"
                          : "text-gray-300"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Comment</p>

                <textarea
                  rows="4"
                  placeholder="Write your feedback..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full border rounded-xl p-3 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={closeModal}
                  className="flex-1 border border-gray-300 py-2.5 rounded-xl"
                >
                  Cancel
                </button>

                <button
                  onClick={submitFeedback}
                  disabled={rating === 0}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-2.5 rounded-xl"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
