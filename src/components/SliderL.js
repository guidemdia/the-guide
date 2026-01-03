import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function SliderL() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const snapshot = await getDocs(collection(db, "writings"));

        // sort by numeric article id (highest first)
        const list = snapshot.docs
          .map((doc) => ({
            docId: doc.id,
            ...doc.data(),
          }))
          .sort((a, b) => Number(b.id) - Number(a.id));

        setArticles(list);
      } catch (e) {
        console.error("Firestore fetch error:", e);
      }
    };

    fetchArticles();
  }, []);

  if (!articles.length) {
    return (
      <div className="w-full text-center py-20 text-gray-500">
        Loading…
      </div>
    );
  }

  const feature = articles[9];
  const rightArticles = articles.slice(10, 17);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">

      {/* FEATURED */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-14 cursor-pointer"
        onClick={() => navigate(`/individual/${feature.docId}`)}
      >
        <img
          src={feature.image}
          alt={feature.title}
          className="w-full h-96 object-cover shadow"
        />

        <div className="flex flex-col justify-center">
          <p className="text-red-500 font-medium mb-2">
            {feature.type?.charAt(0).toUpperCase() + feature.type?.slice(1)}
          </p>

          <h1 className="text-2xl md:text-3xl font-bold mb-4">
            {feature.title}
          </h1>

          <p className="font-semibold mb-1">
            By {feature.author}
          </p>

          {feature.time && (
            <p className="text-xs text-gray-500">
              {feature.time}
            </p>
          )}
        </div>
      </div>

      {/* ✅ LOW OPACITY FULL LINE */}
      <div className="w-full h-px bg-black/10 my-12" />

      {/* SLIDER */}
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={20}
        pagination={{ clickable: true }}
        navigation
        autoplay={{ delay: 3000 }}
        breakpoints={{
          320: { slidesPerView: 1 },
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 4 },
        }}
      >
        {rightArticles.map((article) => (
          <SwiperSlide key={article.docId}>
            <div
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

              <p className="text-gray-600 text-sm line-clamp-3">
                {article.description}
              </p>

              <p className="text-xs font-semibold text-gray-900">
                By {article.author}
              </p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
