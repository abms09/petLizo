import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ImageSlider from "../../components/ImageSlider";

export default function Pets() {
  const [pets, setPets] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [approvalFilter, setApprovalFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const navigate = useNavigate();

  const fetchPets = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("http://localhost:5000/admin/pets", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = Array.isArray(res.data) ? res.data : res.data.pets || [];

      setPets(data);
      setFiltered(data);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);

      if (err.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
      }

      setPets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || !user.roles?.includes("admin")) {
      navigate("/login");
      return;
    }

    fetchPets();
  }, []);

  useEffect(() => {
    let data = [...pets];

    if (search) {
      data = data.filter(
        (p) =>
          p.name?.toLowerCase().includes(search.toLowerCase()) ||
          p.category?.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (statusFilter !== "all") {
      data = data.filter((p) =>
        statusFilter === "sold" ? p.isSold : !p.isSold,
      );
    }

    if (approvalFilter !== "all") {
      data = data.filter((p) => {
        if (approvalFilter === "pending") {
          return !p.approved || p.approved === "pending";
        }
        return p.approved === approvalFilter;
      });
    }

    setFiltered(data);
    setCurrentPage(1);
  }, [search, statusFilter, approvalFilter, pets]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const indexOfLast = currentPage * itemsPerPage;
  const currentPets = filtered.slice(indexOfLast - itemsPerPage, indexOfLast);

  const handleApprove = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/admin/pets/${id}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      fetchPets();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/admin/pets/${id}/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      fetchPets();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Pet Management</h2>
          <p className="text-sm text-gray-500">
            Manage listings, approvals and sales
          </p>
        </div>
      </div>

      {/* 🔍 FILTERS */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border rounded-lg w-full focus:ring-2 focus:ring-slate-300"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg w-full"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="sold">Sold</option>
          </select>

          <select
            value={approvalFilter}
            onChange={(e) => setApprovalFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg w-full"
          >
            <option value="all">All Approval</option>
            <option value="approved">Approved</option>
            <option value="pending">Unapproved</option>
            <option value="rejected">Rejected</option>
          </select>

          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
              setApprovalFilter("all");
            }}
            className="bg-gray-100 hover:bg-gray-200 text-sm rounded-lg px-3 py-2"
          >
            Reset
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading pets...</p>
      ) : currentPets.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg">🐾 No pets found</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentPets.map((pet) => (
            <div
              key={pet._id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition overflow-hidden"
            >
              <ImageSlider images={pet.image} height="h-44" />

              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-gray-800">{pet.name}</h3>

                  <span className="font-bold text-slate-700">₹{pet.price}</span>
                </div>

                <p className="text-xs text-gray-400">{pet.category}</p>

                <div className="text-sm text-gray-600 mt-2 space-y-1">
                  <p>Gender: {pet.gender || "N/A"}</p>

                  <p className="text-xs text-gray-500">
                    Seller: {pet.seller?.name || "Unknown"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 mt-3 text-xs">
                  <span
                    className={`px-2 py-1 rounded-full ${
                      pet.isSold
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {pet.isSold ? "Sold" : "Available"}
                  </span>

                  <span
                    className={`px-2 py-1 rounded-full ${
                      pet.approved === "approved"
                        ? "bg-green-100 text-green-600"
                        : pet.approved === "rejected"
                          ? "bg-red-100 text-red-600"
                          : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    {pet.approved === "approved"
                      ? "Approved"
                      : pet.approved === "rejected"
                        ? "Rejected"
                        : "Pending"}
                  </span>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleApprove(pet._id)}
                    disabled={pet.approved === "approved"}
                    className="flex-1 text-sm bg-green-500 text-white py-1.5 rounded-lg hover:bg-green-600 disabled:opacity-50"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => handleReject(pet._id)}
                    disabled={pet.approved === "rejected"}
                    className="flex-1 text-sm bg-yellow-500 text-white py-1.5 rounded-lg hover:bg-yellow-600 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex flex-wrap justify-center items-center mt-10 gap-2">
          <button
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 1}
            className="px-4 py-1.5 bg-gray-200 rounded-lg disabled:opacity-50"
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-4 py-1.5 rounded-lg text-sm ${
                currentPage === i + 1
                  ? "bg-slate-800 text-white"
                  : "bg-gray-200"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-1.5 bg-gray-200 rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
