import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function SellerRequests() {
  const [requests, setRequests] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [approvalFilter, setApprovalFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const navigate = useNavigate();

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("http://localhost:5000/seller/requests", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const valid = res.data.requests.filter((r) => r.pet && r.buyer);

      setRequests(valid);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprove = async (id) => {
    try {
      setLoadingId(id);

      await axios.put(
        `http://localhost:5000/seller/approve/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      setRequests((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: "approved" } : r)),
      );

      setLoadingId(null);
    } catch (err) {
      console.error(err);
      setLoadingId(null);
    }
  };

  const handleReject = async (id) => {
    try {
      setLoadingId(id);

      await axios.delete(`http://localhost:5000/seller/reject/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setRequests((prev) => prev.filter((r) => r._id !== id));

      setLoadingId(null);
    } catch (err) {
      console.error(err);
      setLoadingId(null);
    }
  };

  const openChat = (req) => {
    localStorage.setItem("chatSellerId", req.buyer._id);

    navigate("/chat", {
      state: {
        sellerId: req.buyer._id,
      },
    });
  };

  useEffect(() => {
    let data = [...requests];

    if (search) {
      data = data.filter(
        (r) =>
          r.pet?.name?.toLowerCase().includes(search.toLowerCase()) ||
          r.buyer?.name?.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (statusFilter !== "all") {
      data = data.filter((r) => r.status === statusFilter);
    }

    if (approvalFilter !== "all") {
      data = data.filter((r) => r.pet?.approved === approvalFilter);
    }

    setFiltered(data);
    setCurrentPage(1);
  }, [search, statusFilter, approvalFilter, requests]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const currentRequests = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">
        Pet Requests
      </h1>

      <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center mb-8">
        <input
          className="px-4 py-2 border rounded-lg w-full sm:w-64"
          placeholder="Search pet or buyer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="px-3 py-2 border rounded-lg w-full sm:w-auto"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Requests</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {currentRequests.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">No requests found</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {currentRequests.map((req) => {
            const imageUrl =
              req.pet?.image?.length > 0
                ? `http://localhost:5000/uploads/${req.pet.image[0]}`
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

                  {status === "pending" && (
                    <div className="flex flex-col sm:flex-row gap-2 mt-3">
                      <button
                        onClick={() => handleApprove(req._id)}
                        className="flex-1 bg-green-500 text-white py-2 rounded text-sm"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() => handleReject(req._id)}
                        className="flex-1 bg-red-500 text-white py-2 rounded text-sm"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {status === "approved" && (
                    <button
                      onClick={() => openChat(req)}
                      className="w-full mt-3 bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700"
                    >
                      💬 Chat with Buyer
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex flex-wrap justify-center items-center mt-8 gap-3">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-4 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>

          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-4 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
