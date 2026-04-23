import { useEffect, useState } from "react";
import axios from "axios";

export default function Sellers() {
  const [sellers, setSellers] = useState([]);

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/admin/sellers", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setSellers(res.data.sellers || res.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const toggleBlock = async (userId) => {
    try {
      await axios.put(
        `http://localhost:5000/admin/users/${userId}/toggle-status`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      fetchSellers();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Sellers</h2>
        <p className="text-sm text-gray-500">Manage all registered sellers</p>
      </div>

      {sellers.length === 0 ? (
        <p className="text-center text-gray-400">No sellers found</p>
      ) : (
        <>
          <div className="hidden md:block bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-600 text-sm">
                <tr>
                  <th className="p-4">Seller</th>
                  <th className="p-4">Shop</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Address</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {sellers.map((s) => (
                  <tr
                    key={s._id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                          {s.user?.name?.charAt(0)?.toUpperCase() || "S"}
                        </div>

                        <div>
                          <p className="font-semibold text-gray-800">
                            {s.user?.name || "N/A"}
                          </p>
                          <p className="text-xs text-gray-400">
                            {s.user?.email || "N/A"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-gray-600">
                      {s.shopName ? `🏪 ${s.shopName}` : "—"}
                    </td>

                    <td className="p-4 text-gray-600">📞 {s.phone || "N/A"}</td>

                    <td className="p-4 text-gray-500 text-sm max-w-xs truncate">
                      {s.address || "N/A"}
                    </td>

                    <td className="p-4">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          s.user?.isBlocked
                            ? "bg-red-100 text-red-600"
                            : "bg-green-100 text-green-600"
                        }`}
                      >
                        {s.user?.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => toggleBlock(s.user?._id)}
                        className={`px-4 py-1.5 rounded-lg text-white text-sm ${
                          s.user?.isBlocked
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-red-500 hover:bg-red-600"
                        }`}
                      >
                        {s.user?.isBlocked ? "Unblock" : "Block"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-4">
            {sellers.map((s) => (
              <div
                key={s._id}
                className="bg-white rounded-xl shadow p-4 border border-gray-100"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                    {s.user?.name?.charAt(0)?.toUpperCase() || "S"}
                  </div>

                  <div>
                    <p className="font-semibold text-gray-800">
                      {s.user?.name || "N/A"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {s.user?.email || "N/A"}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-gray-600">
                  🏪 {s.shopName || "No shop"}
                </p>

                <p className="text-sm text-gray-600">📞 {s.phone || "N/A"}</p>

                <p className="text-sm text-gray-500 mb-3">
                  📍 {s.address || "N/A"}
                </p>

                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      s.user?.isBlocked
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {s.user?.isBlocked ? "Blocked" : "Active"}
                  </span>

                  <button
                    onClick={() => toggleBlock(s.user?._id)}
                    className={`px-3 py-1.5 rounded text-white text-sm ${
                      s.user?.isBlocked ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {s.user?.isBlocked ? "Unblock" : "Block"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
