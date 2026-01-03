import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function SuggestArticles() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const snapshot = await getDocs(collection(db, "writings"));
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setArticles(list);
      } catch (e) {
        console.error("Firestore fetch error:", e);
      }
    };

    fetchArticles();
  }, []);

  if (articles.length < 1) {
    return (
      <div className="w-full text-center py-20 text-gray-500">Loading…</div>
    );
  }

  // ⬅ Take the first 12 articles
  const feature = articles.slice(0, 8);

  return (
    <div className="max-w-7xl m-auto">
  
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {feature.map((item) => (
          <div
            key={item.id}
            onClick={() => {
              navigate(`/individual/${item.id}`);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="bg-white cursor-pointer border p-4 transition"
          >
            {item.image && (
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-48 object-cover  mb-3"
              />
            )}

            <h3 className="text-lg font-semibold leading-tight mb-1 line-clamp-2">
              {item.title?.length > 55
                ? item.title.slice(0, 55) + "..."
                : item.title}
            </h3>

            {item.author && (
              <p className="text-gray-600 text-sm">By {item.author}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
