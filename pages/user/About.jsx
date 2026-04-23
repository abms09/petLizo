import { Users, HeartHandshake, ShieldCheck } from "lucide-react";
import AboutImg from "../../src/assets/About.webp";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function About() {
  const navigate = useNavigate();

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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
          About <span className="text-slate-500">PetStore</span>
        </h1>

        <p className="mt-4 sm:mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          We connect loving homes with adorable pets. Our mission is to make pet
          adoption simple, safe, and joyful.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 grid md:grid-cols-2 gap-10 items-center">
        <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-lg">
          <img
            src={AboutImg}
            alt="About"
            className="w-full h-full object-cover hover:scale-105 transition duration-500"
            loading="lazy"
          />
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold">Our Mission</h2>

          <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed text-sm sm:text-base">
            We aim to build a trusted platform where users can discover pets,
            connect with verified sellers, and ensure every pet finds a caring
            home. Pets are family—and they deserve the best life possible.
          </p>
        </div>
      </section>

      <section className="bg-slate-50 dark:bg-slate-900 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition duration-300">
            <Users className="mb-4" />
            <h3 className="font-semibold text-lg">Community</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Building a strong network of pet lovers and responsible owners.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition duration-300">
            <HeartHandshake className="mb-4" />
            <h3 className="font-semibold text-lg">Care & Love</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Every pet deserves love, care, and a safe environment.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition duration-300">
            <ShieldCheck className="mb-4" />
            <h3 className="font-semibold text-lg">Trust & Safety</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Verified sellers and secure processes for a reliable experience.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 text-center">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold">500+</h3>
            <p className="text-slate-500 text-sm">Pets Listed</p>
          </div>

          <div>
            <h3 className="text-2xl sm:text-3xl font-bold">300+</h3>
            <p className="text-slate-500 text-sm">Happy Owners</p>
          </div>

          <div>
            <h3 className="text-2xl sm:text-3xl font-bold">100+</h3>
            <p className="text-slate-500 text-sm">Verified Sellers</p>
          </div>

          <div>
            <h3 className="text-2xl sm:text-3xl font-bold">24/7</h3>
            <p className="text-slate-500 text-sm">Support</p>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 text-center bg-slate-50 dark:bg-slate-900">
        <h2 className="text-2xl sm:text-3xl font-bold">Join Our Community</h2>

        <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Whether you're looking to adopt or sell, PetStore is here to help.
        </p>

        <div className="mt-6 flex justify-center gap-4 flex-wrap">
          <a
            href="/pets"
            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-lg font-medium hover:opacity-80 transition"
          >
            Explore Pets
          </a>

          <button
            onClick={sellerClick}
            className="bg-linear-to-r from-slate-800 to-slate-600 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition"
          >
            Become Seller
          </button>
        </div>
      </section>
    </div>
  );
}
