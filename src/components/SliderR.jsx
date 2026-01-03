import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function SliderR() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);

  // Load Firestore Data
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const snapshot = await getDocs(collection(db, "writings"));

        // ✅ Sort by numeric article id (highest first)
        const list = snapshot.docs
          .map((doc) => ({
            docId: doc.id,   // Firestore ID
            ...doc.data()    // contains numeric id (e.g. 64)
          }))
          .sort((a, b) => Number(b.id) - Number(a.id));

        setArticles(list);
      } catch (e) {
        console.error("Firestore fetch error:", e);
      }
    };

    fetchArticles();
  }, []);

  // Wait until enough articles
  if (articles.length < 9) {
    return (
      <div className="w-full py-20 text-center text-gray-500">
        Loading…
      </div>
    );
  }

  // 🔥 BASED ON SORTED NUMERIC ID
  const others = articles.slice(18,26); // next 8 articles

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">

     

      {/* OTHERS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-10">
        {others.map((article) => (
          <div
            key={article.docId}
            className="bg-white shadow-md p-4 hover:shadow-lg transition cursor-pointer"
            onClick={() => navigate(`/individual/${article.docId}`)}
          >
            <div className="w-full h-52 overflow-hidden mb-4">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>

            <h2 className="text-lg font-semibold mb-2 line-clamp-2">
              {article.title}
            </h2>

            <p className="text-gray-600 text-sm mb-2 line-clamp-3">
              {article.description}
            </p>

            <p className="text-xs font-semibold text-gray-900">
              By {article.author}
            </p>
          </div>
        ))}
      </div>

      {/* READ MORE */}
      <div className="flex justify-center">
        <button
          onClick={() => {
            navigate("/category/article");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="px-6 py-3 bg-black text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition"
        >
          Read More →
        </button>
      </div>

    </div>
  );
}
