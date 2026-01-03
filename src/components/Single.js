import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function Single() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const snapshot = await getDocs(collection(db, "writings"));

        const list = snapshot.docs.map((doc) => ({
          docId: doc.id,      // Firestore document ID
          ...doc.data(),
        }));

        setArticles(list);
      } catch (e) {
        console.error("Firestore fetch error:", e);
      }
    };

    fetchArticles();
  }, []);

  // ✅ FILTER BY CATEGORY + TAKE ONLY 7
  const filteredArticles = articles
    .filter((item) => item.category === "article") // 🔥 change if needed
    .slice(0, 7);

  const goToBlog = (docId) => {
    navigate(`/individual/${docId}`);
  };

  return (
    <div className="max-w-7xl m-auto px-6 py-16 space-y-10">
      {filteredArticles.map((item) => (
        <div
          key={item.docId}
          className="cursor-pointer flex gap-6 items-start"
          onClick={() => goToBlog(item.docId)}
        >
          {/* LEFT IMAGE */}
          <img
            src={item.image}
            alt={item.title}
            className="w-[120px] h-20 md:w-[240px] md:h-40 object-cover"
          />

          {/* RIGHT CONTENT */}
          <div className="md:flex-1 relative">
            <h2 className="text-[13px] md:text-2xl font-medium">
              {item.title}
            </h2>

            <p className="absolute top-[18px] md:top-[30px] text-gray-700 font-medium text-[15px]">
              {item.author}
            </p>

            <p className="absolute top-[60px] md:top-[90px] text-[10px] text-black">
              {item.time}
            </p>

            <div
              className="hidden md:absolute md:top-[120px] text-gray-800 text-[12px] line-clamp-3"
              dangerouslySetInnerHTML={{ __html: item.full }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
