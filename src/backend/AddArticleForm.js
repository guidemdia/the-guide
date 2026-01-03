import { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import DOMPurify from 'dompurify';

export default function AddArticleForm({ initialData, onSubmit }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    id: "",
    title: "",
    author: "",
    aboutauthor: "",
    full: "",
    short: "",
    type: "",
    category: "",
    time: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Populate form with initial data if editing
  useEffect(() => {
    if (initialData) {
      setForm({
        id: initialData.id || "",
        title: initialData.title || "",
        author: initialData.author || "",
        aboutauthor: initialData.aboutauthor || "",
        full: initialData.full || "",
        short: initialData.short || "",
        type: initialData.type || "",
        category: initialData.category || "",
        time: initialData.time || "",
      });
      setImagePreview(initialData.image || "");
    }
  }, [initialData]);

  // Cleanup object URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validate ID to only contain URL-safe characters
    if (name === 'id') {
      const validId = value.replace(/[^a-zA-Z0-9_-]/g, '');
      setForm({ ...form, [name]: validId });
      return;
    }
    
    setForm({ ...form, [name]: value });
  };

  const uploadImage = () => {
    if (!imageFile) return Promise.resolve(initialData?.image || "");

    return new Promise((resolve, reject) => {
      const data = new FormData();
      data.append("file", imageFile);
      data.append("upload_preset", "guideimages");
      data.append("cloud_name", "dkevvbzvn");

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "https://api.cloudinary.com/v1_1/dkevvbzvn/image/upload");
      xhr.timeout = 30000; // 30-second timeout

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setUploadProgress(Math.round((e.loaded * 100) / e.total));
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const res = JSON.parse(xhr.responseText);
          resolve(res.secure_url);
        } else {
          reject(new Error("Image upload failed"));
        }
      };

      xhr.onerror = () => reject(new Error("Network error during upload"));
      xhr.ontimeout = () => reject(new Error("Image upload timed out"));
      xhr.send(data);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);

    if (!form.id || !form.title || !form.author || !form.full || !form.type) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);

    try {
      const imageUrl = await uploadImage();

      // Sanitize user input before saving
      const sanitizedForm = {
        id: form.id,
        title: DOMPurify.sanitize(form.title),
        author: DOMPurify.sanitize(form.author),
        aboutauthor: DOMPurify.sanitize(form.aboutauthor),
        full: DOMPurify.sanitize(form.full),
        short: DOMPurify.sanitize(form.short),
        type: DOMPurify.sanitize(form.type),
        category: DOMPurify.sanitize(form.category),
        time: DOMPurify.sanitize(form.time),
      };

      await setDoc(doc(db, "writings", form.id), {
        ...sanitizedForm,
        image: imageUrl || null,
        createdAt: initialData?.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setSuccess(true);
      if (onSubmit) onSubmit();
    } catch (error) {
      console.error("Submission failed:", error);
      alert(error.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-10">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        {initialData ? "Edit Article" : "Add Article"}
      </h2>

      {success && (
        <div className="bg-green-100 text-green-800 p-3 rounded-lg mb-4">
          ✅ Your article has been successfully {initialData ? "updated" : "added"}.
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          name="id"
          value={form.id}
          placeholder="ARTICLE ID (unique)"
          onChange={handleChange}
          className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          required
          disabled={!!initialData} // Disable ID editing for existing items
        />

        <input
          name="title"
          value={form.title}
          placeholder="TITLE"
          onChange={handleChange}
          className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        />

        <input
          name="author"
          value={form.author}
          placeholder="AUTHOR"
          onChange={handleChange}
          className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        />

        <textarea
          name="aboutauthor"
          value={form.aboutauthor}
          placeholder="ABOUT AUTHOR"
          onChange={handleChange}
          rows={3}
          className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />

        <textarea
          name="short"
          value={form.short}
          placeholder="SHORT DESCRIPTION"
          onChange={handleChange}
          rows={3}
          className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />

        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select Type</option>
          <option value="article">Article</option>
          <option value="story">Story</option>
          <option value="poem">Poem</option>
          <option value="essay">Essay</option>
          <option value="review">Review</option>
        </select>

        <input
          name="category"
          value={form.category}
          placeholder="CATEGORY"
          onChange={handleChange}
          className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />

        <input
          name="time"
          value={form.time}
          placeholder="READING TIME (e.g., 5 min read)"
          onChange={handleChange}
          className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />

        <textarea
          name="full"
          value={form.full}
          placeholder="FULL ARTICLE"
          onChange={handleChange}
          rows={14}
          className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        />

        <div className="flex flex-col gap-2">
          <label className="font-semibold">Upload Image</label>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setImageFile(file);
                setImagePreview(URL.createObjectURL(file));
                setUploadProgress(0);
              }
            }}
            className="border p-2 rounded-lg"
          />

          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
            />
          )}

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>

        <button
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg mt-4 disabled:bg-gray-400"
        >
          {loading ? "Saving..." : (initialData ? "Update" : "Submit")}
        </button>
      </form>
    </div>
  );
}