import React from "react";

export default function About() {
  return (
    <div className="w-full bg-white">
      {/* HEADER SECTION */}
      <div className="w-full bg-gray-100 py-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            About Us
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Welcome to our platform — a space dedicated to thoughtful writings,
            deep reflections, and curated knowledge from around the world.
          </p>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-5xl mx-auto px-6 py-16 space-y-16">

        {/* WHO WE ARE */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">Who We Are</h2>
          <p className="text-gray-600 leading-relaxed">
            We are a group of writers, researchers, and designers passionate
            about building a meaningful digital archive. Our mission is to
            preserve authentic scholarship, highlight important voices, and
            inspire readers through quality content.
          </p>
        </section>

        {/* OUR PURPOSE */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">Our Purpose</h2>
          <p className="text-gray-600 leading-relaxed">
            Our goal is to bring forward valuable articles, editions,
            translations, and research work that contribute to knowledge and
            understanding — whether historical, spiritual, cultural, or
            academic.
          </p>
        </section>

        {/* WHAT WE OFFER */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">What We Offer</h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Handpicked articles from diverse fields</li>
            <li>Exclusive editions and curated publications</li>
            <li>High-quality research summaries and insights</li>
            <li>A platform for meaningful knowledge exchange</li>
          </ul>
        </section>

        {/* CONTACT */}
        <section className="space-y-4 border-t pt-10">
          <h2 className="text-2xl font-semibold text-gray-800">Contact Us</h2>
          <p className="text-gray-600 leading-relaxed">
            Have a suggestion, collaboration idea, or feedback?  
            Feel free to reach out anytime:
          </p>
          <p className="text-gray-800 font-medium">📩 contact@example.com</p>
        </section>

      </div>
    </div>
  );
}
