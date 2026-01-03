import React, { useState } from "react";

export default function SubscriptionBox() {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full h-screen flex items-center justify-center bg-white text-black">
      {/* Subscribe Button */}
      <button
        onClick={() => setOpen(true)}
        className="bg-black text-white px-4 py-2 rounded"
      >
        Subscribe
      </button>

      {/* Popup */}
      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-white text-black p-6 w-80 rounded shadow-lg border border-black">
            
            <h2 className="text-xl font-bold mb-3">Subscribe to The Guide</h2>
            
            <p className="mb-3 text-sm leading-relaxed">
              Annual Subscription: <strong>₹150</strong>  
              <br />You will receive <strong>5 magazines</strong> per year.
            </p>

            <p className="text-sm mb-4">
              For more information or to subscribe, click the button below.
            </p>

            {/* WhatsApp Button */}
            <a
              href="https://wa.me/9747518960"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center bg-black text-white py-2 rounded mb-3"
            >
              Contact on WhatsApp
            </a>

            {/* Close Button */}
            <button
              onClick={() => setOpen(false)}
              className="w-full border border-black py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
