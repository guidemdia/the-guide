import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function Interface() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const snapshot = await getDocs(collection(db, "writings"));

        // ✅ Sort by YOUR numeric article id (64, 63, 9...)
        const list = snapshot.docs
          .map((doc) => ({
            docId: doc.id,   // Firestore document ID
            ...doc.data()    // contains numeric id (example: id: 64)
          }))
          .sort((a, b) => Number(b.id) - Number(a.id)); // 🔥 highest first

        setArticles(list);
      } catch (e) {
        console.error("Firestore fetch error:", e);
      }
    };

    fetchArticles();
  }, []);

  if (!articles.length) {
    return (
      <div className="w-full text-center py-20 font-serif text-gray-500">
        Loading…
      </div>
    );
  }

  // 🔥 id = 64 (highest) will ALWAYS be here
  const feature = articles[0];
  const leftArticles = articles.slice(1, 3);
  const rightArticles = articles.slice(3, 8);

  const goToBlog = (docId) => {
    navigate(`/individual/${docId}`);
  };

  // Helper: strip HTML and limit words
  function getFirstNWords(htmlString, wordLimit) {
    if (!htmlString) return "";
    const text = htmlString.replace(/<[^>]+>/g, "");
    const words = text.split(/\s+/);
    return words.length > wordLimit
      ? words.slice(0, wordLimit).join(" ") + "..."
      : text;
  }

  return (
    <div className="w-full lg:h-[980px] bg-white pt-3 lg:pt-[80px]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 px-6 pt-20">

        {/* CENTER FEATURED ARTICLE */}
        <div
          className="order-1 md:order-2 col-span-1 md:col-span-2 flex flex-col items-center cursor-pointer"
          onClick={() => goToBlog(feature.docId)}
        >
          <img
            src={feature.image}
            alt={feature.title}
            className="w-full md:w-[550px] h-[420px] object-cover"
          />

          <h1 className="text-3xl md:text-4xl font-bold mt-6 text-center">
            {feature.title}
          </h1>

          <p className="text-gray-600 max-w-xl text-center mt-2">
            {feature.author}
          </p>

          <div className="text-gray-800 pt-5 text-[17px] text-center">
            {getFirstNWords(feature.full, 60)}
          </div>
        </div>

        {/* RIGHT SIDE ARTICLES */}
        <div className="order-2 md:order-3 col-span-1 flex flex-col gap-6 lg:gap-20">
          {rightArticles.map((item) => (
            <div
              key={item.docId}
              onClick={() => goToBlog(item.docId)}
              className="flex gap-3 cursor-pointer items-center"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-md leading-tight">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {item.author}
                </p>
              </div>

              <div className="w-[70px] h-[70px] overflow-hidden rounded">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ))}
        </div>

        {/* LEFT SIDE ARTICLES */}
        <div className="order-3 md:order-1 col-span-1 flex flex-col gap-6 lg:gap-40">
          {leftArticles.map((item) => (
            <div
              key={item.docId}
              className="cursor-pointer"
              onClick={() => goToBlog(item.docId)}
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-48 object-cover"
              />

              <h2 className="text-lg font-semibold mt-3">
                {item.title}
              </h2>

              <p className="text-sm text-gray-600">
                {item.author}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
