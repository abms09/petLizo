import { Link, useNavigate } from "react-router-dom";
import { PawPrint, Heart, ShieldCheck } from "lucide-react";
import axios from "axios";
import { useRef, useEffect } from "react";
import { toast } from "react-toastify";
import HomeImg from "../../src/assets/Home.webp";

export default function Home() {
  const navigate = useNavigate();

  const hasFetched = useRef(false);
  const shownIds = useRef(new Set());
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get("http://localhost:5000/notification/my", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const unread = res.data.filter((n) => !n.isRead);

        unread.forEach((n) => {
          if (shownIds.current.has(n._id)) return;

          shownIds.current.add(n._id);

          if (n.status === "accepted") {
            toast.success(n.message);
          } else if (n.status === "rejected") {
            toast.error(n.message);
          }
        });

        if (unread.length > 0) {
          await axios.put(
            "http://localhost:5000/notification/read",
            {},
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
        }
      } catch (err) {
        console.log("Notification fetch error:", err.message);
      }
    };

    fetchNotifications();

    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  const sellerClick = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      await axios.get("http://localhost:5000/seller/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      navigate("/seller");
    } catch (err) {
      if (err.response?.status === 404) {
        navigate("/become-seller");
      } else if (err.response?.status === 403) {
        toast.error("You are blocked ❌");

        localStorage.clear();
        window.dispatchEvent(new Event("userChanged"));

        navigate("/");
      } else {
        navigate("/login");
      }
    }
  };

  return (
    <div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
        <div className="text-center md:text-left">
          <span className="inline-block px-4 py-1 text-xs sm:text-sm rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
            🐾 Adopt • Sell • Care
          </span>

          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold leading-tight">
            Find Your Perfect{" "}
            <span className="text-slate-500">Pet Companion</span>
          </h1>

          <p className="mt-5 text-slate-600 dark:text-slate-400 text-base sm:text-lg">
            Discover, adopt, and bring home happiness. Browse pets and connect
            with trusted sellers instantly.
          </p>

          <div className="mt-8 flex flex-wrap gap-3 justify-center md:justify-start">
            <Link
              to="/pets"
              className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-lg font-medium shadow hover:scale-105 transition"
            >
              Browse Pets
            </Link>

            <button
              onClick={sellerClick}
              className="bg-linear-to-r from-slate-800 to-slate-600 text-white px-6 py-3 rounded-lg font-medium shadow hover:scale-105 transition"
            >
              Sell a Pet
            </button>

            <Link
              to="/about"
              className="border border-slate-300 dark:border-slate-700 px-6 py-3 rounded-lg font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Learn More
            </Link>
          </div>
        </div>

        <div>
          <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-xl">
            <img
              src={HomeImg}
              alt="Pet"
              className="w-full h-full object-cover hover:scale-105 transition duration-500"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <section className="py-12 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            ["500+", "Pets Listed"],
            ["300+", "Happy Owners"],
            ["100+", "Verified Sellers"],
            ["24/7", "Support"],
          ].map(([num, label], i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow text-center"
            >
              <h3 className="text-2xl md:text-3xl font-bold">{num}</h3>
              <p className="text-slate-500 text-sm">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-3 gap-6">
          {[
            {
              icon: <PawPrint />,
              title: "Wide Variety",
              desc: "Explore pets from trusted sellers across breeds.",
            },
            {
              icon: <Heart />,
              title: "Trusted Adoption",
              desc: "Safe and secure process for every adoption.",
            },
            {
              icon: <ShieldCheck />,
              title: "Verified Sellers",
              desc: "Only trusted and verified sellers onboard.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl hover:shadow-lg transition"
            >
              <div className="mb-4">{item.icon}</div>
              <h3 className="font-semibold text-lg">{item.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 bg-slate-50 dark:bg-slate-900 text-center">
        <h2 className="text-2xl md:text-3xl font-bold">How It Works</h2>

        <div className="mt-10 grid md:grid-cols-3 gap-6 px-4">
          {[
            ["1. Browse Pets", "Explore pets easily"],
            ["2. Connect", "Chat with sellers"],
            ["3. Adopt", "Bring your pet home"],
          ].map(([title, desc], i) => (
            <div key={i}>
              <h3 className="font-semibold text-lg">{title}</h3>
              <p className="text-slate-500 mt-2">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold">What People Say</h2>

          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {[
              ["Found my puppy in 2 days!", "Rahul"],
              ["Very smooth and trusted.", "Anjali"],
              ["Best adoption platform!", "John"],
            ].map(([text, name], i) => (
              <div
                key={i}
                className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl shadow"
              >
                <p>"{text}"</p>
                <span className="block mt-4 font-semibold">- {name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 text-center px-4">
        <h2 className="text-3xl md:text-4xl font-bold">
          Ready to Find Your Pet?
        </h2>

        <p className="mt-4 text-slate-500">
          Join thousands of happy pet owners today.
        </p>

        <div className="flex justify-center gap-3 mt-8 flex-wrap">
          <Link
            to="/pets"
            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-lg font-medium shadow hover:scale-105 transition"
          >
            Get Started
          </Link>

          <button
            onClick={sellerClick}
            className="bg-linear-to-r from-slate-800 to-slate-600 text-white px-6 py-3 rounded-lg font-medium shadow hover:scale-105 transition"
          >
            Become a Seller
          </button>
        </div>
      </section>
    </div>
  );
}
