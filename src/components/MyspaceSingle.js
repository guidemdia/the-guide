import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function MySpaceSingle() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchOne = async () => {
      const snap = await getDoc(doc(db, "myspace", id));
      if (snap.exists()) {
        setData(snap.data());
      }
    };

    fetchOne();
  }, [id]);

  if (!data) return <p className="p-6">Loading...</p>;

  return (
    <div className="max-h-screen mb-[120px] bg-white  mt-[140px]">
      <div className="max-w-3xl mx-auto">

        {/* Image */}
        {data.image && (
          <img
            src={data.image}
            alt={data.title}
            className="w-full h-64 object-cover rounded-xl mb-6"
          />
        )}

        {/* Title */}
        <h1 className="text-4xl font-bold mb-4">
          {data.title}
        </h1>

        {/* Meta */}
        <p className="text-sm">
          By <strong>{data.author}</strong> • {data.type}
        </p>
  {data.aboutauthor && (
          <div className="border-t ">
                        <p className="text-sm text-gray-700">
              {data.aboutauthor}
            </p>
          </div>
        )}
        {/* Full Content */}
        <div className="leading-relaxed whitespace-pre-line text-lg mt-8">
          {data.full}
        </div>

        {/* About Author */}
      
      </div>
    </div>
  );
}
