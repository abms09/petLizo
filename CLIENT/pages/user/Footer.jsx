import { Mail, Phone, MapPin } from "lucide-react";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-white">
            PetStore
          </h2>

          <p className="mt-3 text-sm text-slate-400 leading-relaxed">
            Your trusted platform to find, adopt, and care for pets. We connect
            loving homes with adorable companions.
          </p>
        </div>

        <div>
          <h3 className="text-white font-medium mb-4">Quick Links</h3>

          <ul className="space-y-2 text-sm">
            <li>
              <a href="/" className="hover:text-white transition">
                Home
              </a>
            </li>
            <li>
              <a href="/pets" className="hover:text-white transition">
                Pets
              </a>
            </li>
            <li>
              <a href="/requests" className="hover:text-white transition">
                My Requests
              </a>
            </li>
            <li>
              <a href="/about" className="hover:text-white transition">
                About
              </a>
            </li>
            <li>
              <a href="/contact" className="hover:text-white transition">
                Contact
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-medium mb-4">Contact</h3>

          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <MapPin size={16} />
              <span>Calicut, Kerala</span>
            </li>

            <li className="flex items-center gap-2">
              <Phone size={16} />
              <span>+91 98765 43210</span>
            </li>

            <li className="flex items-center gap-2 break-all">
              <Mail size={16} />
              <span>support@petstore.com</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-medium mb-4">Follow Us</h3>

          <div className="flex gap-3">
            <a
              href="#"
              className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition"
            >
              <FaFacebookF size={16} />
            </a>

            <a
              href="#"
              className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition"
            >
              <FaInstagram size={16} />
            </a>

            <a
              href="#"
              className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition"
            >
              <FaTwitter size={16} />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800"></div>

      <div className="text-center px-4 py-4 text-xs sm:text-sm text-slate-500">
        © {new Date().getFullYear()} PetStore. All rights reserved.
      </div>
    </footer>
  );
}
