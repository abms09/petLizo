import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function SellerRequests() {
  const [requests, setRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const itemsPerPage = 6;

  const navigate = useNavigate();

  const fetchRequests = async (
    page = currentPage,
    searchValue = search,
    statusValue = statusFilter,
  ) => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/seller/requests`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },

          params: {
            page,
            limit: itemsPerPage,
            search: searchValue,
            status: statusValue,
          },
        },
      );

      setRequests(res.data.requests || []);

      setCurrentPage(res.data.currentPage || 1);

      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(1);
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchRequests(1);
    }, 400);

    return () => clearTimeout(delay);
  }, [search, statusFilter]);

  const handleApprove = async (id) => {
    try {
      setLoadingId(id);
      console.log("APPROVE ID:", id);
      await axios.put(
        `${import.meta.env.VITE_API_URL}/seller/approve/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      fetchRequests(currentPage);
    } catch (err) {
      console.log("BACKEND ERROR:", err.response?.data);
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (id) => {
    try {
      setLoadingId(id);

      await axios.delete(
        `${import.meta.env.VITE_API_URL}/seller/reject/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      fetchRequests(currentPage);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };
  const handleMarkSold = async (petId, requestId) => {
    try {
      setLoadingId(requestId);

      await axios.put(
        `${import.meta.env.VITE_API_URL}/pets/sold/${petId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      await fetchRequests(1);

      alert("Pet marked as sold ✅");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to mark as sold");
    } finally {
      setLoadingId(null);
    }
  };

  const openChat = (req) => {
    const currentUser = JSON.parse(localStorage.getItem("user"));

    const currentUserId = currentUser?._id || currentUser?.id;

    const sellerId = req?.seller?._id || req?.seller;

    const buyerId = req?.buyer?._id || req?.buyer;

    let otherUserId;

    if (sellerId === currentUserId) {
      otherUserId = buyerId;
    } else {
      otherUserId = sellerId;
    }

    if (!otherUserId) {
      alert("Chat user not found");

      return;
    }

    navigate(`/chat/${otherUserId}`);
  };

  if (loading) {
    return <p className="text-center py-20">Loading...</p>;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">
        Pet Requests
      </h1>

      <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center mb-8">
        <input
          className="px-4 py-2 border rounded-lg w-full sm:w-64 outline-none focus:ring-2 focus:ring-slate-400"
          placeholder="Search pet or buyer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="px-3 py-2 border rounded-lg w-full sm:w-auto outline-none focus:ring-2 focus:ring-slate-400"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Requests</option>

          <option value="pending">Pending</option>

          <option value="approved">Approved</option>

          <option value="rejected">Rejected</option>
        </select>
      </div>

      {requests.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">No requests found</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {requests.map((req) => {
            const imageUrl =
              req.pet?.image?.length > 0
                ? `${import.meta.env.VITE_API_URL}/uploads/${req.pet.image[0].replace(/\\/g, "/")}`
                : "https://via.placeholder.com/300";
            const status = req.status?.toLowerCase();

            return (
              <div
                key={req._id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition overflow-hidden"
              >
                <img
                  src={imageUrl}
                  className="w-full h-40 sm:h-48 object-cover"
                  alt="pet"
                />

                <div className="p-4">
                  <h2 className="font-semibold text-base sm:text-lg">
                    🐶 {req.pet?.name || "Unknown Pet"}
                  </h2>

                  <p className="text-sm text-gray-600">
                    👤 {req.buyer?.name || "Unknown Buyer"}
                  </p>

                  <span
                    className={`inline-block mt-2 text-xs px-3 py-1 rounded-full
    ${
      status === "approved"
        ? "bg-green-100 text-green-700"
        : status === "pending"
          ? "bg-yellow-100 text-yellow-700"
          : "bg-red-100 text-red-700"
    }`}
                  >
                    {status}
                  </span>

                  {req.pet?.status === "sold" ? (
                    <div
                      className="
      mt-3
      bg-gray-100
      border
      border-gray-300
      rounded-xl
      p-3
    "
                    >
                      <p className="text-sm font-semibold text-gray-700">
                        🏁 Deal Completed
                      </p>

                      <p className="text-xs text-gray-600 mt-1">
                        This pet has been sold successfully and the transaction
                        is completed.
                      </p>
                    </div>
                  ) : req.paymentStatus === "partial" ? (
                    <div
                      className="
      mt-3
      bg-emerald-50
      border
      border-emerald-200
      rounded-xl
      p-3
    "
                    >
                      <p className="text-sm font-semibold text-emerald-700">
                        ✅ Advance Payment Received
                      </p>

                      <p className="text-xs text-gray-600 mt-1">
                        Buyer paid the advance amount. Pet is reserved.
                      </p>
                    </div>
                  ) : null}

                  {status === "pending" && (
                    <div className="flex flex-col sm:flex-row gap-2 mt-3">
                      <button
                        disabled={loadingId === req._id}
                        onClick={() => handleApprove(req._id)}
                        className="flex-1 bg-green-500 text-white py-2 rounded text-sm hover:bg-green-600 disabled:opacity-50"
                      >
                        {loadingId === req._id ? "Loading..." : "Approve"}
                      </button>

                      <button
                        disabled={loadingId === req._id}
                        onClick={() => handleReject(req._id)}
                        className="flex-1 bg-red-500 text-white py-2 rounded text-sm hover:bg-red-600 disabled:opacity-50"
                      >
                        {loadingId === req._id ? "Loading..." : "Reject"}
                      </button>
                    </div>
                  )}

                  {status === "approved" && (
                    <>
                      <button
                        onClick={() => openChat(req)}
                        className="w-full mt-3 bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700"
                      >
                        💬 Chat with Buyer
                      </button>

                      {req.pet?.status === "sold" ? (
                        <div className="w-full mt-3 bg-green-100 text-green-700 py-2 rounded text-sm text-center font-semibold">
                          ✅ This Pet is Sold
                        </div>
                      ) : req.paymentStatus === "partial" ? (
                        <button
                          onClick={() => handleMarkSold(req.pet._id, req._id)}
                          disabled={loadingId === req._id}
                          className="w-full mt-3 bg-green-600 text-white py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                        >
                          {loadingId === req._id
                            ? "Processing..."
                            : "✅ Mark as Sold"}
                        </button>
                      ) : null}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-10 flex-wrap">
          <button
            disabled={currentPage === 1}
            onClick={() => fetchRequests(currentPage - 1)}
            className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => fetchRequests(i + 1)}
              className={`px-4 py-2 rounded-lg ${
                currentPage === i + 1
                  ? "bg-slate-900 text-white"
                  : "bg-gray-200"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => fetchRequests(currentPage + 1)}
            className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
