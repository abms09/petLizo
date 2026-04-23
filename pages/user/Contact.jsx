import { Mail, Phone, MapPin } from "lucide-react";
import { useState } from "react";
import axios from "axios";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setStatus("");

      await axios.post("http://localhost:5000/contact", form);

      setStatus("Message sent successfully ✅");

      setForm({
        name: "",
        email: "",
        message: "",
      });
    } catch (err) {
      console.error(err);
      setStatus("Failed to send message ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
      {/* HERO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
          Contact Us
        </h1>

        <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Have questions or need help? We’d love to hear from you.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 grid md:grid-cols-2 gap-10">
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl shadow-sm hover:shadow-md transition">
            <Mail className="mt-1 text-slate-700 dark:text-white" />
            <div>
              <h3 className="font-semibold">Email</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                support@petstore.com
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl shadow-sm hover:shadow-md transition">
            <Phone className="mt-1 text-slate-700 dark:text-white" />
            <div>
              <h3 className="font-semibold">Phone</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                +91 98765 43210
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl shadow-sm hover:shadow-md transition">
            <MapPin className="mt-1 text-slate-700 dark:text-white" />
            <div>
              <h3 className="font-semibold">Location</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Calicut, Kerala, India
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl overflow-hidden h-48 sm:h-56 md:h-64 shadow">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7819.54842274708!2d75.80154414628552!3d11.496205388248802!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba6648140034443%3A0xaf0edf88c18ddf0a!2sKoottalida%2C%20Kerala%20673614%2C%20India!5e0!3m2!1sen!2sus!4v1776929952292!5m2!1sen!2sus"
              className="w-full h-full border-0"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              title="Location Map"
            />
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl shadow-sm"
        >
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-slate-400"
            required
          />

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email Address"
            className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-slate-400"
            required
          />

          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            rows="4"
            placeholder="Write your message..."
            className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-slate-400"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 rounded-lg font-medium hover:opacity-80 transition"
          >
            {loading ? "Sending..." : "Send Message"}
          </button>

          {status && (
            <p
              className={`text-center text-sm mt-2 ${
                status.toLowerCase().includes("success")
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {status}
            </p>
          )}
        </form>
      </section>
    </div>
  );
}
