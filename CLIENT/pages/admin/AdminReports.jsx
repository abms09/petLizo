import { useState } from "react";
import axios from "axios";
import { CalendarDays, Download, FileText, ShieldCheck } from "lucide-react";

export default function AdminReports() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const downloadReport = async () => {
    try {
      if (!fromDate || !toDate) {
        return alert("Please select both dates");
      }

      if (fromDate > toDate) {
        return alert("From date cannot be greater than To date");
      }

      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await axios.get(
        `http://localhost:5000/admin/report?from=${fromDate}&to=${toDate}`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      link.download = `pet-adoption-report-${Date.now()}.pdf`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.log(err);

      alert("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg">
              <FileText size={28} />
            </div>

            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800">
                Reports Center
              </h1>

              <p className="text-slate-500 mt-1">
                Generate detailed PDF reports for your platform
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-linear-to-r from-blue-600 to-indigo-600 px-8 py-8 text-white">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div>
                <h2 className="text-2xl font-bold">Pet Adoption Analytics</h2>

                <p className="text-blue-100 mt-2">
                  Export users, pets, payments, commissions and revenue insights
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck size={22} />

                  <div>
                    <p className="text-sm text-blue-100">Secure Report</p>

                    <p className="font-semibold">PDF Download Enabled</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                  <CalendarDays size={18} />
                  From Date
                </label>

                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  max={today}
                  className="w-full border border-slate-300 rounded-2xl px-4 py-4 text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                  <CalendarDays size={18} />
                  To Date
                </label>

                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  min={fromDate}
                  max={today}
                  className="w-full border border-slate-300 rounded-2xl px-4 py-4 text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                <h3 className="font-semibold text-slate-800">Revenue Data</h3>

                <p className="text-sm text-slate-500 mt-2">
                  Includes total revenue, seller earnings and admin commission
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                <h3 className="font-semibold text-slate-800">
                  Payment Analytics
                </h3>

                <p className="text-sm text-slate-500 mt-2">
                  Detailed payment transactions with buyer and seller data
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                <h3 className="font-semibold text-slate-800">
                  Platform Summary
                </h3>

                <p className="text-sm text-slate-500 mt-2">
                  Users, sellers, pets, complaints and feedback statistics
                </p>
              </div>
            </div>

            <button
              onClick={downloadReport}
              disabled={loading}
              className="mt-10 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating PDF Report...
                </>
              ) : (
                <>
                  <Download size={22} />
                  Download PDF Report
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
