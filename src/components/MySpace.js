import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function MySpace() {
  const [writings, setWritings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWritings = async () => {
      const q = query(
        collection(db, "myspace"),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setWritings(data);
    };

    fetchWritings();
  }, []);

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center mb-10">
        <h1 className="text-4xl font-bold">MySpace</h1>
        <p className="text-lg mt-2">
          Selected writings from our community
        </p>
      </div>

      {/* Cards */}
      <div className="max-w-4xl mx-auto grid gap-6">
        {writings.map((item) => (
          <div
            key={item.id}
            onClick={() => navigate(`/myspace/${item.id}`)}
            className="border border-black rounded-xl p-6 cursor-pointer hover:bg-gray-50"
          >
            <h2 className="text-2xl font-semibold mb-1">
              {item.title}
            </h2>

            <p className="text-sm mb-2">
              By <strong>{item.author}</strong> • {item.type}
            </p>

            <p className="text-gray-700 leading-relaxed">
              {item.short}
            </p>

            <span className="inline-block mt-4 text-sm font-semibold underline">
              Read more →
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
