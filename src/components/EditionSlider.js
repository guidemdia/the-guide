import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y } from "swiper/modules";

import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function EditionSlider() {
  const [alertOpen, setAlertOpen] = useState(false);
  const [editions, setEditions] = useState([]);

  const openAlert = () => setAlertOpen(true);
  const closeAlert = () => setAlertOpen(false);

  const WHATSAPP_LINK =
    "https://wa.me/9747518960?text=Hello!%20I%20want%20to%20purchase%20The%20Guide%20Edition.";

  // 🔥 Fetch Editions from Firebase
  useEffect(() => {
    const fetchEditions = async () => {
      try {
        const snap = await getDocs(collection(db, "editions"));
        const list = snap.docs.map(doc => ({
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
    <>
      <div className="w-full max-w-7xl mx-auto px-4 py-10 overflow-hidden">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          The Guide Editions
        </h1>

        <Swiper
          modules={[Navigation, Pagination, A11y]}
          navigation
          pagination={{ clickable: true }}
          spaceBetween={25}
          breakpoints={{
            0: { slidesPerView: 1 },
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="rounded-2xl p-6"
        >
          {editions.map((slide) => (
            <SwiperSlide key={slide.id}>
              <div className="flex flex-col h-[560px] rounded-xl shadow-md bg-white">
                
                {/* Clickable Image */}
                <div
                  className="w-full h-[420px] cursor-pointer"
                  onClick={openAlert}
                >
                  <img
                    src={slide.cover}
                    alt={slide.name}
                    className="w-full h-full object-cover rounded-t-xl"
                  />
                </div>

                <div className="p-4 flex flex-col items-center justify-center flex-1">
                  <h2 className="text-xl font-bold text-gray-800 text-center">
                    {slide.name}
                  </h2>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Alert Modal */}
      {alertOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-auto text-center border-t-4 border-green-600">
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Premium Edition Access
            </h3>

            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-6 flex items-start space-x-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-green-600 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6.253v13m0-13C10.832 5.404 9.382 5 8 5c-4 0-4 4-4 8 0 2.222.84 4.29 2.2 5.82 1.487 1.69 3.42 2.5 5.8 2.5 2.22 0 4.29-.84 5.82-2.2C19.596 17.168 20 15.618 20 14c0-4-4-8-8-8z"
                />
              </svg>
              <p className="text-gray-700 text-base font-medium text-left">
                This exclusive edition is not free. If you are ready to pay Rs 30,
                contact us directly via WhatsApp to purchase.
              </p>
            </div>

            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 text-white py-3 px-6 rounded-full font-bold inline-flex items-center justify-center space-x-2 hover:bg-green-700 transition transform hover:scale-105 shadow-md w-full"
            >
              <span>Chat on WhatsApp</span>
            </a>

            <button
              onClick={closeAlert}
              className="mt-4 text-gray-500 hover:text-gray-700 text-sm font-medium"
            >
              I understand, close this.
            </button>
          </div>
        </div>
      )}
    </>
  );
}
