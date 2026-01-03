import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function ArticleGrid() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        const snapshot = await getDocs(collection(db, "writings"));
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setArticles(list);
      } catch (e) {
        console.error("Firestore fetch error:", e);
      }
    };

    loadArticles();
  }, []);

  if (articles.length === 0) {
    return (
      <div className="w-full text-center py-20 text-gray-500">Loading…</div>
    );
  }

  const groupedArticles = articles.reduce((acc, article) => {
    if (!acc[article.type]) acc[article.type] = [];
    acc[article.type].push(article);
    return acc;
  }, {});

  const goToArticle = (id) => {
    navigate(`/individual/${id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 p-6 mx-auto max-w-7xl">
      {Object.keys(groupedArticles).map((type) => (
        <div key={type}>

          <h2 className="text-xl font-bold border-b pb-1 mb-4">
            {type.toUpperCase()}
          </h2>

          <ul>
            {groupedArticles[type]
              .slice(0, 2) // ⭐ LIMIT TO 2
              .map((article) => (
                <li
                  key={article.id}
                  className="cursor-pointer text-[13px] py-2 hover:text-blue-900 transition border-b border-gray-300/40"
                  onClick={() => goToArticle(article.id)}
                >
                  {article.title}
                </li>
              ))}
          </ul>

        </div>
      ))}
    </div>
  );
}
