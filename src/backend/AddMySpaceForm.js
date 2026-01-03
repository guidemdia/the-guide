import { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function AddMySpaceForm({ initialData, onSubmit }) {
  const [form, setForm] = useState({
    id: "",
    title: "",
    author: "",
    aboutauthor: "",
    full: "",
    type: "",
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
        type: initialData.type || "",
      });
      setImagePreview(initialData.image || "");
    }
  }, [initialData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const uploadImage = () => {
    if (!imageFile) return Promise.resolve(initialData?.image || "");

    return new Promise((resolve, reject) => {
      const data = new FormData();
      data.append("file", imageFile);
      data.append("upload_preset", "guideimages");
      data.append("cloud_name", "dkevvbzvn");

      const xhr = new XMLHttpRequest();
      xhr.open(
        "POST",
        "https://api.cloudinary.com/v1_1/dkevvbzvn/image/upload"
      );

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
          reject("Image upload failed");
        }
      };

      xhr.onerror = () => reject("Network error");
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

      await setDoc(doc(db, "myspace", form.id), {
        ...form,
        image: imageUrl || null,
        createdAt: initialData?.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // CLEAR FORM AFTER SUCCESS
      setForm({
        id: "",
        title: "",
        author: "",
        aboutauthor: "",
        full: "",
        type: "",
      });
      setImageFile(null);
      setImagePreview("");
      setUploadProgress(0);

      setSuccess(true);
      if (onSubmit) onSubmit();
    } catch (error) {
      console.error(error);
      alert("Submission failed");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold mb-6">
        {initialData ? "Edit Item" : "Add to My Space"}
      </h2>

      {/* SUCCESS MESSAGE */}
      {success && (
        <div className="bg-green-100 text-green-800 p-3 rounded-lg mb-4">
          ✅ Your writing has been successfully {initialData ? "updated" : "added"}.
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          name="id"
          placeholder="UNIQUE ID"
          value={form.id}
          onChange={handleChange}
          className="p-3 border rounded-lg"
          required
          disabled={!!initialData} // Disable ID editing for existing items
        />

        <input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          className="p-3 border rounded-lg"
          required
        />

        <input
          name="author"
          placeholder="Author"
          value={form.author}
          onChange={handleChange}
          className="p-3 border rounded-lg"
          required
        />

        <textarea
          name="aboutauthor"
          placeholder="About Author"
          value={form.aboutauthor}
          onChange={handleChange}
          rows={3}
          className="p-3 border rounded-lg"
        />

        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className="p-3 border rounded-lg"
          required
        >
          <option value="">Select Type</option>
          <option value="poem">Poem</option>
          <option value="story">Story</option>
          <option value="essay">Essay</option>
          <option value="article">Article</option>
        </select>

        <textarea
          name="full"
          placeholder="Write your poem / story / essay here..."
          value={form.full}
          onChange={handleChange}
          rows={14}
          className="p-3 border rounded-lg"
          required
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            setImageFile(e.target.files[0]);
            setImagePreview(
              e.target.files[0]
                ? URL.createObjectURL(e.target.files[0])
                : ""
            );
            setUploadProgress(0);
          }}
        />

        {imagePreview && (
          <img
            src={imagePreview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg"
          />
        )}

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}

        <button
          disabled={loading}
          className="bg-black text-white py-2 rounded-lg hover:bg-gray-800"
        >
          {loading ? "Saving..." : (initialData ? "Update" : "Publish")}
        </button>
      </form>
    </div>
  );
}