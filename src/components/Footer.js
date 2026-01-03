import { Mail, MapPin, Phone, Facebook, Instagram, Youtube } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="mt-20">
      <div 
        className="w-full rounded-t-3xl bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-100 pt-20 pb-12"
        style={{ fontFamily: 'Graphik,-apple-system,blinkmacsystemfont,roboto,helvetica neue,segoe ui,arial,sans-serif' }}
      >

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12">

          {/* BRAND */}
          <div>
            <h2 
              className="text-2xl font-bold text-gray-900 mb-4"
              style={{ fontFamily: 'Graphik,-apple-system,blinkmacsystemfont,roboto,helvetica neue,segoe ui,arial,sans-serif' }}
            >
              The Guide
            </h2>
            <p 
              className="text-gray-600 text-sm leading-relaxed"
              style={{ fontFamily: 'Graphik,-apple-system,blinkmacsystemfont,roboto,helvetica neue,segoe ui,arial,sans-serif' }}
            >
              Spreading knowledge, inspiration and spiritual growth through
              meaningful content, stories and reflections.
            </p>
            <div className="flex gap-5 mt-6">
              <Link className="hover:opacity-70 transition"><Facebook size={20} /></Link>
              <Link className="hover:opacity-70 transition"><Instagram size={20} /></Link>
              <Link className="hover:opacity-70 transition"><Youtube size={20} /></Link>
            </div>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h3 
              className="text-lg font-semibold text-gray-900 mb-4"
              style={{ fontFamily: 'Graphik,-apple-system,blinkmacsystemfont,roboto,helvetica neue,segoe ui,arial,sans-serif' }}
            >
              Quick Links
            </h3>
            <ul className="space-y-3 text-sm text-gray-700">

              {/* HOME → scroll to top */}
              <li>
                <Link
                  to="/"
                  className="hover:text-gray-900"
                  style={{ fontFamily: 'Graphik,-apple-system,blinkmacsystemfont,roboto,helvetica neue,segoe ui,arial,sans-serif' }}
                  onClick={() =>
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }, 100)
                  }
                >
                  Home
                </Link>
              </li>

              {/* ARTICLES → go to /articles and scroll top */}
              <li>
                <Link
                  to="/category/article"
                  className="hover:text-gray-900"
                  style={{ fontFamily: 'Graphik,-apple-system,blinkmacsystemfont,roboto,helvetica neue,segoe ui,arial,sans-serif' }}
                  onClick={() =>
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }, 100)
                  }
                >
                  Articles
                </Link>
              </li>

              {/* EDITIONS → scroll to 500px */}
              <li>
                <Link
                  to="/editions"
                  className="hover:text-gray-900"
                  style={{ fontFamily: 'Graphik,-apple-system,blinkmacsystemfont,roboto,helvetica neue,segoe ui,arial,sans-serif' }}
                  onClick={() =>
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }, 150)
                  }
                >
                  Editions
                </Link>
              </li>

              <li>
                <Link 
                  to="/about" 
                  className="hover:text-gray-900"
                  style={{ fontFamily: 'Graphik,-apple-system,blinkmacsystemfont,roboto,helvetica neue,segoe ui,arial,sans-serif' }}
                  onClick={() =>
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }, 100)
                  }
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/login" 
                  className="hover:text-gray-900"
                  style={{ fontFamily: 'Graphik,-apple-system,blinkmacsystemfont,roboto,helvetica neue,segoe ui,arial,sans-serif' }}
                >
                  Admin Login
                </Link>
              </li>

            </ul>
          </div>

          {/* CONTACT */}
          <div>
            <h3 
              className="text-lg font-semibold text-gray-900 mb-4"
              style={{ fontFamily: 'Graphik,-apple-system,blinkmacsystemfont,roboto,helvetica neue,segoe ui,arial,sans-serif' }}
            >
              Contact Info
            </h3>
            <ul className="space-y-4 text-sm text-gray-700">

              <li className="flex gap-3 items-start">
                <MapPin size={18} className="text-gray-700" />
                <span style={{ fontFamily: 'Graphik,-apple-system,blinkmacsystemfont,roboto,helvetica neue,segoe ui,arial,sans-serif' }}>
                  Malik Deenar Islamic Academy <br/>Thalangara, Kasaragod, Kerala 
                </span>
              </li>

              <li className="flex gap-3 items-center">
                <Phone size={18} className="text-gray-700" />
                <span style={{ fontFamily: 'Graphik,-apple-system,blinkmacsystemfont,roboto,helvetica neue,segoe ui,arial,sans-serif' }}>
                  +91 97475 18960
                </span>
              </li>

              <li className="flex gap-3 items-center">
                <Mail size={18} className="text-gray-700" />
                <span style={{ fontFamily: 'Graphik,-apple-system,blinkmacsystemfont,roboto,helvetica neue,segoe ui,arial,sans-serif' }}>
                  guidemdia@gmail.com
                </span>
              </li>

            </ul>
          </div>

          {/* NEWSLETTER */}
          <div>
            <h3 
              className="text-lg font-semibold text-gray-900 mb-4"
              style={{ fontFamily: 'Graphik,-apple-system,blinkmacsystemfont,roboto,helvetica neue,segoe ui,arial,sans-serif' }}
            >
              Subscribe
            </h3>
            <p 
              className="text-gray-600 text-sm mb-4"
              style={{ fontFamily: 'Graphik,-apple-system,blinkmacsystemfont,roboto,helvetica neue,segoe ui,arial,sans-serif' }}
            >
              Get new articles and updates directly to your inbox.
            </p>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Enter your email"
                className="px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 w-full focus:ring focus:ring-gray-300"
                style={{ fontFamily: 'Graphik,-apple-system,blinkmacsystemfont,roboto,helvetica neue,segoe ui,arial,sans-serif' }}
              />
              <button 
                className="bg-gray-900 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-800 transition"
                style={{ fontFamily: 'Graphik,-apple-system,blinkmacsystemfont,roboto,helvetica neue,segoe ui,arial,sans-serif' }}
              >
                Go
              </button>
            </div>
          </div>

        </div>

        {/* COPYRIGHT */}
        <div 
          className="max-w-7xl mx-auto px-6 border-t border-gray-300 mt-16 pt-6 text-center text-sm text-gray-700"
          style={{ fontFamily: 'Graphik,-apple-system,blinkmacsystemfont,roboto,helvetica neue,segoe ui,arial,sans-serif' }}
        >
          © {new Date().getFullYear()} The Guide. All Rights Reserved.
        </div>

      </div>
    </footer>
  );
}