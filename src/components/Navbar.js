import React, { useState, useEffect, useRef } from "react";
import { Menu, X, Search, Moon, Sun, ChevronDown } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [openMenu, setOpenMenu] = useState(false);
  const [openSubscribe, setOpenSubscribe] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);
  const profileRef = useRef(null);
  const searchInputRef = useRef(null);

  // Check if user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("John Doe");
  const [userAvatar, setUserAvatar] = useState(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [darkMode]);

  // Focus search input when search opens
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const goToCategory = (name) => {
    navigate(`/category/${name.toLowerCase()}`);
    setOpenMenu(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setSearchOpen(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setProfileOpen(false);
  };

  // Navigation items
  const navItems = [
    { name: "Home", path: "/" },
    { name: "My Space", path: "/myspace" },
    { name: "About", path: "/about" },
  ];

  // Section categories
  const sections = [
    { name: "Story" },
    { name: "Poem" },
    { name: "Article" },
    { name: "Essay" },
    { name: "Story Review" },
  ];

  return (
    <div 
      className="w-full h-16 md:h-20 border-b border-gray-200 shadow-sm fixed top-0 left-0 z-50 bg-white"
      style={{ fontFamily: 'Graphik,-apple-system,blinkmacsystemfont,roboto,helvetica neue,segoe ui,arial,sans-serif' }}
    >
      {/* TOP NAVBAR */}
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-6 py-3 h-full">
        {/* LEFT */}
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={() => setOpenMenu(!openMenu)}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {openMenu ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Search Bar - Desktop */}
          <div className="hidden md:block relative" ref={searchRef}>
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
            
            <AnimatePresence>
              {searchOpen && (
                <div
                  onSubmit={handleSearch}
                  className="absolute top-12 left-0 w-64 p-2 rounded-lg shadow-lg border border-gray-200 bg-white"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                 
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Search Bar - Mobile */}
          <div className="md:hidden">
            <button
              onClick={() => {
                navigate("/search");
                // Focus search input after navigation
                setTimeout(() => {
                  const searchInput = document.getElementById("mobile-search-input");
                  if (searchInput) searchInput.focus();
                }, 100);
              }}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
          </div>
        </div>

        {/* LOGO */}
        <h1
          className="font-serif text-2xl md:text-3xl tracking-wide cursor-pointer"
          onClick={() => {
            navigate("/");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          The Guide
        </h1>

        {/* RIGHT */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  navigate(item.path);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? "text-red-600 border-b-2 border-red-600"
                    : "hover:text-gray-600"
                }`}
                style={{ fontFamily: 'Graphik,-apple-system,blinkmacsystemfont,roboto,helvetica neue,segoe ui,arial,sans-serif' }}
              >
                {item.name}
              </button>
            ))}
          </div>

         

          {/* User Profile */}
          {isLoggedIn ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="User profile"
              >
                {userAvatar ? (
                  <img src={userAvatar} alt="User avatar" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                )}
                <ChevronDown size={16} />
              </button>
              
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    className="absolute top-12 right-0 w-48 p-2 rounded-lg shadow-lg border border-gray-200 bg-white"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-3 py-2 border-b border-gray-200">
                      <p className="font-semibold" style={{ fontFamily: 'Graphik,-apple-system,blinkmacsystemfont,roboto,helvetica neue,segoe ui,arial,sans-serif' }}>{userName}</p>
                      <p className="text-xs text-gray-500" style={{ fontFamily: 'Graphik,-apple-system,blinkmacsystemfont,roboto,helvetica neue,segoe ui,arial,sans-serif' }}>Premium Member</p>
                    </div>
                    <button
                      onClick={() => {
                        navigate("/profile");
                        setProfileOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-100"
                      style={{ fontFamily: 'Graphik,-apple-system,blinkmacsystemfont,roboto,helvetica neue,segoe ui,arial,sans-serif' }}
                    >
                      My Profile
                    </button>
                    <button
                      onClick={() => {
                        navigate("/settings");
                        setProfileOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-100"
                      style={{ fontFamily: 'Graphik,-apple-system,blinkmacsystemfont,roboto,helvetica neue,segoe ui,arial,sans-serif' }}
                    >
                      Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-100"
                      style={{ fontFamily: 'Graphik,-apple-system,blinkmacsystemfont,roboto,helvetica neue,segoe ui,arial,sans-serif' }}
                    >
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={() => setOpenSubscribe(true)}
              className="bg-red-600 hover:bg-red-700 transition text-white px-3 py-1.5 md:px-4 md:py-2 rounded text-sm"
              style={{ fontFamily: 'Graphik,-apple-system,blinkmacsystemfont,roboto,helvetica neue,segoe ui,arial,sans-serif' }}
            >
              Subscribe
            </button>
          )}
        </div>
      </div>

      {/* DROPDOWN MENU */}
      <AnimatePresence>
        {openMenu && (
          <motion.div
            className="w-full border-t border-gray-200 bg-white shadow-inner"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 px-6 py-8">
              {/* Mobile Navigation */}
              <div className="md:hidden">
                <h2 className="text-sm font-bold mb-4" style={{ fontFamily: 'Graphik,-apple-system,blinkmacsystemfont,roboto,helvetica neue,segoe ui,arial,sans-serif' }}>NAVIGATION</h2>
                <ul className="space-y-2">
                  {navItems.map((item) => (
                    <li
                      key={item.name}
                      className={`cursor-pointer ${location.pathname === item.path ? "text-red-600 font-semibold" : ""}`}
                      style={{ fontFamily: 'Graphik,-apple-system,blinkmacsystemfont,roboto,helvetica neue,segoe ui,arial,sans-serif' }}
                      onClick={() => {
                        navigate(item.path);
                        setOpenMenu(false);
                      }}
                    >
                      {item.name}
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Sections */}
              <div>
                <h2 className="text-sm font-bold mb-4" style={{ fontFamily: 'Graphik,-apple-system,blinkmacsystemfont,roboto,helvetica neue,segoe ui,arial,sans-serif' }}>SECTIONS</h2>
                <ul className="space-y-2">
                  {sections.map((section) => (
                    <li
                      key={section.name}
                      className="cursor-pointer hover:underline text-gray-700"
                      style={{ fontFamily: 'Graphik,-apple-system,blinkmacsystemfont,roboto,helvetica neue,segoe ui,arial,sans-serif' }}
                      onClick={() => goToCategory(section.name)}
                    >
                      {section.name}
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Additional Links */}
              <div>
                <h2 className="text-sm font-bold mb-4" style={{ fontFamily: 'Graphik,-apple-system,blinkmacsystemfont,roboto,helvetica neue,segoe ui,arial,sans-serif' }}>MORE</h2>
                <ul className="space-y-2">
                  <li 
                    className="cursor-pointer hover:underline" 
                    style={{ fontFamily: 'Graphik,-apple-system,blinkmacsystemfont,roboto,helvetica neue,segoe ui,arial,sans-serif' }}
                    onClick={() => { navigate("/about"); setOpenMenu(false); }}
                  >
                    About Us
                  </li>
                  <li 
                    className="cursor-pointer hover:underline" 
                    style={{ fontFamily: 'Graphik,-apple-system,blinkmacsystemfont,roboto,helvetica neue,segoe ui,arial,sans-serif' }}
                    onClick={() => { navigate("/contact"); setOpenMenu(false); }}
                  >
                    Contact
                  </li>
                  <li 
                    className="cursor-pointer hover:underline" 
                    style={{ fontFamily: 'Graphik,-apple-system,blinkmacsystemfont,roboto,helvetica neue,segoe ui,arial,sans-serif' }}
                    onClick={() => { navigate("/privacy"); setOpenMenu(false); }}
                  >
                    Privacy Policy
                  </li>
                  <li 
                    className="cursor-pointer hover:underline" 
                    style={{ fontFamily: 'Graphik,-apple-system,blinkmacsystemfont,roboto,helvetica neue,segoe ui,arial,sans-serif' }}
                    onClick={() => { navigate("/terms"); setOpenMenu(false); }}
                  >
                    Terms of Service
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SUBSCRIBE MODAL */}
      <AnimatePresence>
        {openSubscribe && (
          <motion.div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-[999] p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpenSubscribe(false)}
          >
            <motion.div
              className="bg-white text-black p-6 w-full max-w-md rounded-2xl shadow-2xl"
              initial={{ scale: 0.8, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 40 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 
                className="text-2xl font-serif font-bold text-center mb-3"
                style={{ fontFamily: 'Graphik,-apple-system,blinkmacsystemfont,roboto,helvetica neue,segoe ui,arial,sans-serif' }}
              >
                Subscribe to <span className="italic">The Guide</span>
              </h2>

              <p 
                className="text-sm text-center mb-4"
                style={{ fontFamily: 'Graphik,-apple-system,blinkmacsystemfont,roboto,helvetica neue,segoe ui,arial,sans-serif' }}
              >
                Experience thoughtful writing, ideas, and culture.
              </p>

              <div className="border border-gray-200 rounded-lg p-4 mb-4 text-center">
                <p 
                  className="text-lg font-semibold"
                  style={{ fontFamily: 'Graphik,-apple-system,blinkmacsystemfont,roboto,helvetica neue,segoe ui,arial,sans-serif' }}
                >
                  ₹150 / Year
                </p>
                <p 
                  className="text-sm text-gray-500"
                  style={{ fontFamily: 'Graphik,-apple-system,blinkmacsystemfont,roboto,helvetica neue,segoe ui,arial,sans-serif' }}
                >
                  5 Magazines Included
                </p>
              </div>

              <a
                href="https://wa.me/9747518960"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-green-600 hover:bg-green-700 transition text-white py-2 rounded-lg mb-3"
                style={{ fontFamily: 'Graphik,-apple-system,blinkmacsystemfont,roboto,helvetica neue,segoe ui,arial,sans-serif' }}
              >
                Subscribe via WhatsApp
              </a>

              <button
                onClick={() => setOpenSubscribe(false)}
                className="w-full border border-black hover:bg-black hover:text-white transition py-2 rounded-lg"
                style={{ fontFamily: 'Graphik,-apple-system,blinkmacsystemfont,roboto,helvetica neue,segoe ui,arial,sans-serif' }}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}