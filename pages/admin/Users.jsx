import { useEffect, useState } from "react";
import axios from "axios";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/admin/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setUsers(res.data);
      console.log("API RESPONSE:", res.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const toggleBlock = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/admin/users/${id}/toggle-status`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Users</h2>
        <p className="text-sm text-gray-500">Manage all registered users</p>
      </div>

      {loading ? (
        <p className="text-gray-500 text-center">Loading...</p>
      ) : users.length === 0 ? (
        <p className="text-gray-400 text-center">No users found</p>
      ) : (
        <>
          <div className="hidden md:block bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-600 text-sm">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {users.map((u) => (
                  <tr
                    key={u._id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                        {u.name?.charAt(0).toUpperCase()}
                      </div>

                      <span className="font-medium text-gray-800">
                        {u.name}
                      </span>
                    </td>

                    <td className="p-4 text-gray-600">{u.email}</td>
                    <td className="p-4 text-gray-600">{u.phone}</td>

                    <td className="p-4">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          u.isBlocked
                            ? "bg-red-100 text-red-600"
                            : "bg-green-100 text-green-600"
                        }`}
                      >
                        {u.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => toggleBlock(u._id)}
                        className={`px-4 py-1.5 rounded-lg text-white text-sm ${
                          u.isBlocked
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-red-500 hover:bg-red-600"
                        }`}
                      >
                        {u.isBlocked ? "Unblock" : "Block"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-4">
            {users.map((u) => (
              <div
                key={u._id}
                className="bg-white rounded-xl shadow p-4 border border-gray-100"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    {u.name?.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <p className="font-semibold text-gray-800">{u.name}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-2">📞 {u.phone}</p>

                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      u.isBlocked
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {u.isBlocked ? "Blocked" : "Active"}
                  </span>

                  <button
                    onClick={() => toggleBlock(u._id)}
                    className={`px-3 py-1.5 rounded text-white text-sm ${
                      u.isBlocked ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {u.isBlocked ? "Unblock" : "Block"}
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
