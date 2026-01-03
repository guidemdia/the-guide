import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export default function Editions() {
  const [editions, setEditions] = useState([]);

  useEffect(() => {
    const fetchEditions = async () => {
      try {
        const snap = await getDocs(collection(db, "editions"));
        const list = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEditions(list);
      } catch (err) {
        console.error("Firestore Error:", err);
      }
    };

    fetchEditions();
  }, []);

  if (editions.length === 0) {
    return (
      <div className="w-full text-center py-20 text-gray-500">Loading…</div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 mt-10">
      <h1 className="text-4xl font-bold mb-12">Editions</h1>

      <div className="space-y-24">
        {editions.map((slide, index) => (
          <div
            key={slide.id}
            className={`grid grid-cols-1 md:grid-cols-2 gap-12 items-center`}
          >
            {/* IMAGE — alternate left/right */}
            <div
              className={`flex justify-center ${
                index % 2 === 1 ? "md:order-2" : "md:order-1"
              }`}
            >
              <img
                src={slide.cover}
                alt={slide.title}
                className="w-72 md:w-[450px] "
              />
            </div>

            {/* TEXT */}
            <div
              className={`${
                index % 2 === 1 ? "md:order-1" : "md:order-2"
              } text-center md:text-left`}
            >
              <p className="text-red-500 font-semibold  mb-2">
                The Guide
              </p>
               <p className="text-  mb-2">
{slide.about}
              </p>
             
              <h2 className="text-2xl font-bold mb-4 leading-tight">
                {slide.title}
              </h2>

             <p className="text-red-500 font-semibold  mb-2">
                Published on 
              </p>
              <h2 className="text-black text-sm">{slide.date}</h2>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
