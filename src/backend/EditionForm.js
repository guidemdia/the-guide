import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

export default function EditionForm() {
  const navigate = useNavigate();

  const [data, setData] = useState({
    name: "",
    date: "",
    imageURL: "",
    pdfURL: "",
  });

  // Cloudinary image upload
  const handleCloudinaryUpload = () => {
    window.cloudinary.openUploadWidget(
      {
        cloudName: "dkevvbzvn",
        uploadPreset: "",
        multiple: false,
        resourceType: "image",
      },
      (err, result) => {
        if (err) {
          console.error("Cloudinary upload error:", err);
        } else if (result.event === "success") {
          setData((prev) => ({
            ...prev,
            imageURL: result.info.secure_url,
          }));
        }
      }
    );
  };

  // Save to Firestore
  const handleSubmit = async () => {
    if (!data.name || !data.date || !data.imageURL) {
      return alert("Please provide slide name, date, and image.");
    }

    try {
      await addDoc(collection(db, "editions"), data);
      alert("Slide added successfully!");
      setData({ name: "", date: "", imageURL: "", pdfURL: "" });
    } catch (error) {
      console.error("Firestore error:", error);
      alert("Failed to save slide. Check console for details.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start pt-16 relative px-4">

      {/* ❌ Absolute Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full shadow hover:bg-red-600 transition"
      >
        <X size={20} />
      </button>

      <div className="bg-white w-full max-w-lg p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">Add New Slide</h2>

        <div className="space-y-4">

          <input
            className="border p-3 w-full rounded"
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            placeholder="Slide Name"
          />

          <input
            className="border p-3 w-full rounded"
            type="date"
            value={data.date}
            onChange={(e) => setData({ ...data, date: e.target.value })}
          />

          <button
            className="bg-blue-600 text-white p-3 w-full rounded hover:bg-blue-700"
            onClick={handleCloudinaryUpload}
          >
            Upload Image
          </button>

          {/* FIXED: Saves correct key pdfURL */}
          <input
            className="border p-3 w-full rounded"
            value={data.pdfURL}
            onChange={(e) => setData({ ...data, pdfURL: e.target.value })}
            placeholder="PDF Link (optional)"
          />

          <button
            className="bg-black text-white p-3 w-full rounded hover:bg-gray-800"
            onClick={handleSubmit}
          >
            Save Slide
          </button>

        </div>

        {data.imageURL && (
          <div className="mt-5">
            <p className="font-medium">Image Preview:</p>
            <img
              src={data.imageURL}
              alt="uploaded"
              className="mt-2 rounded-xl shadow"
            />
          </div>
        )}
      </div>
    </div>
  );
}
