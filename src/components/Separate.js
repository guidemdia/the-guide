import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate, useParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Separate() {
  const [articles, setArticles] = useState([]);
  const navigate = useNavigate();
  const { type } = useParams();   // this is category from URL

  // Function to get first N words from HTML string
function getFirstNWords(htmlString, wordLimit) {
  // Remove HTML tags
  const text = htmlString.replace(/<[^>]+>/g, "");
  // Split into words and take first N
  const words = text.split(/\s+/).slice(0, wordLimit).join(" ");
  return words + (text.split(/\s+/).length > wordLimit ? "..." : "");
}


  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(
          collection(db, "writings"),
          orderBy("time", "desc")
        );

        const snap = await getDocs(q);

        const data = snap.docs.map((doc) => ({
          docId: doc.id,
          ...doc.data(),
        }));

        // 🔥 Filter by CATEGORY instead of type
        const filtered = data.filter(
          (item) => (item.category || "").toLowerCase() === type.toLowerCase()
        );

        setArticles(filtered);
      } catch (err) {
        console.error("Error fetching writings:", err);
      }
    };

    fetchData();
  }, [type]);

  return (
    <div className="w-full bg-white min-h-screen">
      <Navbar />

      <div className="w-full min-h-screen max-w-7xl mx-auto px-5 py-24 font-serif">
        <h1 className="text-3xl font-bold tracking-wide mb-6">
          {type.toUpperCase()}
        </h1>
        <hr className="mb-10" />

       <div className="flex flex-col gap-14">
  {articles.map((item, index) => (
    <div key={item.docId}>
      <div className="flex flex-col md:flex-row justify-between gap-5 pb-10">
        <div className="flex-1">
          <h2
            className="text-3xl font-bold cursor-pointer hover:underline"
            onClick={() => navigate(`/individual/${item.id}`)}
          >
            {item.title}
          </h2>

          
          <p className="mt-4 text-md font-semibold">{item.author}</p>
          <p className="text-xs text-gray-500">{item.time}</p>

          <div className="text-gray-800 pt-5 text-[17px]">
  {getFirstNWords(item.full, 60)} {/* show first 50 words */}
</div>

        </div>

        {item.image && (
          <div className="md:w-72 w-full">
            <img
              src={item.image}
              alt="thumbnail"
              className="w-full h-48 object-cover "
            />
          </div>
        )}
      </div>

      {/* Grey line between articles, except after last one */}
      {index !== articles.length - 1 && (
        <hr className="border-black opacity-20 my-8 w-full" />
      )}
    </div>
  ))}
</div>

      </div>

      <Footer />
    </div>
  );
}
