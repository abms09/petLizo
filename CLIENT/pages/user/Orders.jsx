import { useEffect, useState } from "react";
import axios from "axios";
import { Package, Clock, CheckCircle } from "lucide-react";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:5000/user/orders", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = Array.isArray(res.data) ? res.data : res.data.orders || [];

      setOrders(data);
    } catch (err) {
      console.error(
        "Error fetching orders:",
        err.response?.data || err.message,
      );
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const statusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "text-green-600 bg-green-100 dark:bg-green-900/30";
      case "pending":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30";
      case "processing":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900/30";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const statusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return <CheckCircle size={16} />;
      case "pending":
        return <Clock size={16} />;
      default:
        return <Package size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-20 text-gray-500">Loading orders...</div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white min-h-screen">
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h1 className="text-3xl md:text-4xl font-bold">My Orders</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Track and manage your pet orders easily.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-20">
        {orders.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-500">No orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id || order.id}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl shadow-sm hover:shadow-md transition"
              >
                <div>
                  <h3 className="font-semibold text-lg">
                    {order.pet?.name || order.petName || "Pet"}
                  </h3>

                  <p className="text-sm text-slate-500">
                    Order ID: {order._id || order.id}
                  </p>

                  <p className="text-sm text-slate-500">
                    Date:{" "}
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>

                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${statusStyle(
                    order.status,
                  )}`}
                >
                  {statusIcon(order.status)} {order.status || "Unknown"}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
