import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function SearchPage() {
  const [allWritings, setAllWritings] = useState([]);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      const q = query(collection(db, "writings"), orderBy("time", "desc"));
      const snap = await getDocs(q);

      const data = snap.docs.map((doc) => ({
        docId: doc.id,
        ...doc.data(),
      }));

      setAllWritings(data);
    };

    fetch();
  }, []);

  // 🔥 Filter writings on search
  const filtered = allWritings.filter((item) => {
    const s = searchText.toLowerCase();
    return (
      item.title?.toLowerCase().includes(s) ||
      item.subtitle?.toLowerCase().includes(s) ||
      item.author?.toLowerCase().includes(s) ||
      item.type?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-4xl mx-auto pt-32 px-6 pb-20">
        <h1 className="text-3xl font-bold mb-6">Search</h1>

        {/* SEARCH INPUT */}
        <input
          type="text"
          placeholder="Search writings..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full border p-3 rounded mb-10"
        />

        
        {/* RESULTS */}
        <div className="space-y-10">
          {filtered.map((item) => (
            <div
              key={item.docId}
              className="border-b pb-6 cursor-pointer"
              onClick={() => navigate(`/individual/${item.id}`)}
            >
              <h2 className="text-xl font-bold">{item.title}</h2>

              {item.subtitle && (
                <p className="text-gray-600 mt-2">{item.subtitle}</p>
              )}

              <p className="text-sm mt-2 text-gray-500">
                {item.author} • {item.type}
              </p>
            </div>
          ))}

          {filtered.length === 0 && (
            <p className="text-gray-500 text-center mt-10">
              No matching writings found.
            </p>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
