import { useEffect, useState } from "react";
import axios from "axios";

export default function SellerPayments() {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);

  const [summary, setSummary] = useState({
    totalEarnings: 0,
    pending: 0,
    released: 0,
  });

  const fetchPayments = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await axios.get("http://localhost:5000/seller/payments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPayments(res.data.payments || []);
      setSummary(res.data.summary || summary);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("useEffect RUNNING");

    fetchPayments();
  }, []);

  if (loading) {
    return (
      <p className="text-center py-20 text-gray-500">
        Loading seller payments...
      </p>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen px-4 sm:px-6 py-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-slate-900 dark:text-white">
        Seller Payment Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-6xl mx-auto mb-8">
        <div className="bg-green-50 dark:bg-slate-900 border border-green-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">Total Earnings</p>
          <h2 className="text-2xl font-bold text-green-700">
            ₹{summary.totalEarnings}
          </h2>
        </div>

        <div className="bg-yellow-50 dark:bg-slate-900 border border-yellow-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">Pending Payout</p>
          <h2 className="text-2xl font-bold text-yellow-600">
            ₹{summary.pending}
          </h2>
        </div>

        <div className="bg-blue-50 dark:bg-slate-900 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">Released</p>
          <h2 className="text-2xl font-bold text-blue-600">
            ₹{summary.released}
          </h2>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {payments.length === 0 ? (
          <p className="text-center col-span-full text-gray-500 py-10">
            No payment records found
          </p>
        ) : (
          payments.map((p) => (
            <div
              key={p._id}
              className="bg-slate-50 dark:bg-slate-900 rounded-2xl shadow-sm hover:shadow-xl transition p-4"
            >
              <div className="flex items-center gap-3">
                <img
                  src={
                    p.pet?.image?.[0]
                      ? `http://localhost:5000/uploads/${p.pet.image[0]}`
                      : "/no-image.png"
                  }
                  className="w-16 h-16 rounded-lg object-cover"
                  alt="pet"
                />

                <div>
                  <h2 className="font-semibold text-slate-900 dark:text-white">
                    {p.pet?.name}
                  </h2>

                  <p className="text-sm text-gray-500">
                    Buyer: {p.buyer?.name}
                  </p>
                </div>
              </div>

              <div className="mt-3 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                {p.saleStatus === "sold" ? (
                  <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                    <p>
                      💰 Sold Amount: <b>₹{p.totalAmount}</b>
                    </p>
                    <p className="text-green-600 font-medium">✅ Fully Paid</p>
                  </div>
                ) : (
                  <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                    <p>
                      💰 Total Price: <b>₹{p.totalAmount}</b>
                    </p>
                    <p>
                      💳 Advance Paid: <b>₹{p.advanceAmount}</b>
                    </p>
                    <p>
                      🧾 Remaining: <b>₹{p.remainingAmount}</b>
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-3">
                <span
                  className={`px-3 py-1 text-xs rounded-full font-medium ${
                    p.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : p.status === "partial"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {p.status === "completed"
                    ? "Sold / Completed"
                    : p.status === "partial"
                      ? "Advance Paid"
                      : "Pending"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
