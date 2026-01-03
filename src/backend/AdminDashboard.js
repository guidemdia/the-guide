import { useState, useEffect, useRef } from "react";
import { db } from "../firebase";
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Edit2, Save, X, Trash2, RefreshCw, Plus, Upload, Copy, FileText, Image as ImageIcon,  Eye,  Search, Lock, Unlock } from "lucide-react";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pinDigits, setPinDigits] = useState(["", "", "", ""]);
  const [currentPinIndex, setCurrentPinIndex] = useState(0);
  
  // Set your admin password here
  const ADMIN_PASSWORD = "0754"; // Changed to the requested password

  const [activeTab, setActiveTab] = useState("articles");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRows, setExpandedRows] = useState(new Set());
  const tableRef = useRef(null);
  
  // Articles state
  const [articles, setArticles] = useState([]);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [editingArticleId, setEditingArticleId] = useState(null);
  const [viewImage, setViewImage] = useState(null);
  const [showBulkPaste, setShowBulkPaste] = useState(false);
  const [bulkData, setBulkData] = useState("");
  const [showArticleForm, setShowArticleForm] = useState(false);
  // Fixed: Added useState hook
  const [editingInTable, setEditingInTable] = useState(null);
  
  // Editions state
  const [editions, setEditions] = useState([]);
  const [editionsLoading, setEditionsLoading] = useState(true);
  const [showEditionForm, setShowEditionForm] = useState(false);
  const [editingEditionId, setEditingEditionId] = useState(null);
  const [editionData, setEditionData] = useState({
    name: "",
    date: "",
    imageURL: "",
    pdfURL: "",
  });

  // Myspace state
  const [myspaceData, setMyspaceData] = useState([]);
  const [myspaceLoading, setMyspaceLoading] = useState(true);
  const [showMyspaceForm, setShowMyspaceForm] = useState(false);
  const [editingMyspaceId, setEditingMyspaceId] = useState(null);
  const [myspaceForm, setMyspaceForm] = useState({
    title: "",
    content: "",
    imageURL: "",
    date: "",
    author: "", // Added author field
    aboutauthor: "", // Added aboutauthor field
  });

  // Article Form State
  const [articleForm, setArticleForm] = useState({
    image: "",
    title: "",
    author: "",
    aboutauthor: "",
    type: "",
    category: "",
    time: "", // Changed from "readingTime" to "time"
    short: "",
    full: "",
  });
  const [saving, setSaving] = useState(false);

  // Handle PIN input
  const handlePinChange = (value, index) => {
    const newPin = [...pinDigits];
    newPin[index] = value;
    setPinDigits(newPin);
    
    if (value && index < 3) {
      setCurrentPinIndex(index + 1);
    }
    
    // Check if PIN is complete
    if (index === 3 && value) {
      const enteredPin = newPin.join("");
      if (enteredPin === ADMIN_PASSWORD) {
        setIsAuthenticated(true);
        setPasswordError("");
      } else {
        setPasswordError("Incorrect PIN. Please try again.");
        setPinDigits(["", "", "", ""]);
        setCurrentPinIndex(0);
      }
    }
  };

  // Handle PIN backspace
  const handlePinKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
      setCurrentPinIndex(index - 1);
      const newPin = [...pinDigits];
      newPin[index - 1] = "";
      setPinDigits(newPin);
    }
  };

  // Password authentication
  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPasswordError("");
    } else {
      setPasswordError("Incorrect password. Please try again.");
      setPassword("");
    }
  };

  // Toggle row expansion
  const toggleRowExpansion = (id) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  // Handle inline editing
  const startInlineEdit = (id, field, value) => {
    setEditingInTable({ id, field, value });
  };

  const saveInlineEdit = async () => {
    if (!editingInTable) return;
    
    try {
      await updateDoc(doc(db, "writings", editingInTable.id), {
        [editingInTable.field]: editingInTable.value
      });
      
      setArticles(articles.map(article => 
        article.id === editingInTable.id 
          ? { ...article, [editingInTable.field]: editingInTable.value }
          : article
      ));
      
      setEditingInTable(null);
    } catch (error) {
      console.error("Error updating article:", error);
      alert("Failed to update article");
    }
  };

  // Function to add the Social Media Essay to MySpace
  const addInfluenceOfSocialMediaEssay = async () => {
    const essayData = {
      title: "Influence of social media",
      content: "Media is a wide and rapid source for the world to obtain information and solutions to the problems people face. Its specialized features have gradually made it an indispensable component of human life. Its diverse characteristics distinguish it from other forms of media and make it highly attractive. Media also helps us find solutions to our day-to-day problems and provides a vast amount of informative knowledge on different topics. A major reason for its popularity is its accessibility to all kinds of people. It is not limited by caste, race, or religion. People actively engage in social media to share their emotions, habits, and the challenges they face in their lives. Human beings, as social creatures, naturally feel the need to share their feelings, and media fulfills this need quickly and effectively when other means fail. These elements of amazement and curiosity automatically attract people and may eventually lead to addiction. In addition, media provides relaxation and entertainment. Such entertainment encourages users to spend a significant amount of their valuable time on it, and gradually, it may become an addiction. A noticeable change in a media user's behavior and character in daily life is referred to as the \"influence of social media.\" Media has expanded its power through its unique settings and engaging features. In recent times, it has also played a significant role in political issues. The primary targets of social media are children and youth. Media increasingly controls them both physically and mentally through excessive use. This concern reflects the words of scientist Albert Einstein: \"I fear the day when technology overlaps with humanity. The world will only have a generation of idiots.\" The overuse of social media is making children and youth careless about their future, which may gradually influence the entire world. Therefore, the use of media should be controlled, as its attractive features can quickly draw users in and strongly influence them. We must seriously consider how much social media should influence our lives.",
      author: "Muhammed Sinan P",
      aboutauthor: "Shamsul Huda Islamic Academy",
      date: "December 27, 2025",
      imageURL: null,
      type: "essay"
    };

    try {
      const docRef = await addDoc(collection(db, "myspace"), essayData);
      setMyspaceData([...myspaceData, { id: docRef.id, ...essayData }]);
      alert("Essay added successfully to MySpace!");
      fetchMyspace(); // Refresh the data
    } catch (error) {
      console.error("Error adding essay:", error);
      alert("Failed to add essay to MySpace");
    }
  };

  // 🔹 FETCH FUNCTIONS
  const fetchArticles = async () => {
    setArticlesLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "writings"));
      const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setArticles(data);
    } catch (error) {
      console.error("Error fetching articles:", error);
      alert("Failed to load articles");
    }
    setArticlesLoading(false);
  };

  const fetchEditions = async () => {
    setEditionsLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "editions"));
      const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setEditions(data);
    } catch (error) {
      console.error("Error fetching editions:", error);
      alert("Failed to load editions");
    }
    setEditionsLoading(false);
  };

  const fetchMyspace = async () => {
    setMyspaceLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "myspace"));
      const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMyspaceData(data);
    } catch (error) {
      console.error("Error fetching myspace:", error);
      alert("Failed to load myspace data");
    }
    setMyspaceLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchArticles();
      fetchEditions();
      fetchMyspace();
    }
  }, [isAuthenticated]);

  // 🔹 ARTICLE FUNCTIONS
  const handleArticleFormChange = (field, value) => {
    setArticleForm({ ...articleForm, [field]: value });
  };

  const resetArticleForm = () => {
    setArticleForm({
      image: "", title: "", author: "", aboutauthor: "",
      type: "", category: "", time: "", short: "", full: "",
    });
    setEditingArticleId(null);
  };

  const handleArticleSubmit = async () => {
    if (!articleForm.title || !articleForm.author) {
      return alert("Please provide at least title and author.");
    }

    setSaving(true);
    try {
      if (editingArticleId) {
        await updateDoc(doc(db, "writings", editingArticleId), articleForm);
        setArticles(articles.map(a => a.id === editingArticleId ? { id: editingArticleId, ...articleForm } : a));
        alert("Article updated successfully!");
      } else {
        const docRef = await addDoc(collection(db, "writings"), articleForm);
        setArticles([...articles, { id: docRef.id, ...articleForm }]);
        alert("Article added successfully!");
      }
      resetArticleForm();
      setShowArticleForm(false);
    } catch (error) {
      console.error("Error saving article:", error);
      alert("Failed to save article");
    }
    setSaving(false);
  };

  const startEditArticle = (article) => {
    setEditingArticleId(article.id);
    setArticleForm({ ...article });
    setShowArticleForm(true);
  };

  const deleteArticle = async (id) => {
    if (!window.confirm("Are you sure you want to delete this article?")) return;
    try {
      await deleteDoc(doc(db, "writings", id));
      setArticles(articles.filter(a => a.id !== id));
      alert("Article deleted successfully!");
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Failed to delete");
    }
  };

  // 🔹 BULK PASTE FUNCTION
  const handleBulkPaste = async () => {
    if (!bulkData.trim()) {
      return alert("Please paste data first!");
    }

    try {
      const rows = bulkData.trim().split('\n');
      const newArticles = [];

      for (const row of rows) {
        const cells = row.split('\t');
        if (cells.length >= 2) {
          const article = {
            image: cells[0] || "",
            title: cells[1] || "",
            author: cells[2] || "",
            aboutauthor: cells[3] || "",
            type: cells[4] || "",
            category: cells[5] || "",
            time: cells[6] || "", // Changed from readingTime to time
            short: cells[7] || "",
            full: cells[8] || "",
          };
          
          const docRef = await addDoc(collection(db, "writings"), article);
          newArticles.push({ id: docRef.id, ...article });
        }
      }

      setArticles([...articles, ...newArticles]);
      setBulkData("");
      setShowBulkPaste(false);
      alert(`Successfully added ${newArticles.length} articles!`);
    } catch (error) {
      console.error("Error bulk adding:", error);
      alert("Failed to bulk add articles");
    }
  };

  // 🔹 EDITION FUNCTIONS
  const handleCloudinaryUpload = (target) => {
    if (!window.cloudinary) {
      alert("Cloudinary widget not loaded. Please check your setup.");
      return;
    }
    
    window.cloudinary.openUploadWidget(
      {
        cloudName: "dkevvbzvn",
        uploadPreset: "your_upload_preset",
        multiple: false,
        resourceType: "image",
      },
      (err, result) => {
        if (err) {
          console.error("Cloudinary upload error:", err);
        } else if (result.event === "success") {
          if (target === "article") {
            setArticleForm(prev => ({ ...prev, image: result.info.secure_url }));
          } else if (target === "edition") {
            setEditionData(prev => ({ ...prev, imageURL: result.info.secure_url }));
          } else if (target === "myspace") {
            setMyspaceForm(prev => ({ ...prev, imageURL: result.info.secure_url }));
          }
        }
      }
    );
  };

  const resetEditionForm = () => {
    setEditionData({ name: "", date: "", imageURL: "", pdfURL: "" });
    setEditingEditionId(null);
  };

  const handleEditionSubmit = async () => {
    if (!editionData.name || !editionData.date || !editionData.imageURL) {
      return alert("Please provide edition name, date, and image.");
    }

    try {
      if (editingEditionId) {
        await updateDoc(doc(db, "editions", editingEditionId), editionData);
        setEditions(editions.map(e => e.id === editingEditionId ? { id: editingEditionId, ...editionData } : e));
        alert("Edition updated successfully!");
      } else {
        const docRef = await addDoc(collection(db, "editions"), editionData);
        setEditions([...editions, { id: docRef.id, ...editionData }]);
        alert("Edition added successfully!");
      }
      resetEditionForm();
      setShowEditionForm(false);
    } catch (error) {
      console.error("Error saving edition:", error);
      alert("Failed to save edition");
    }
  };

  const startEditEdition = (edition) => {
    setEditingEditionId(edition.id);
    setEditionData({ ...edition });
    setShowEditionForm(true);
  };

  const deleteEdition = async (id) => {
    if (!window.confirm("Are you sure you want to delete this edition?")) return;
    try {
      await deleteDoc(doc(db, "editions", id));
      setEditions(editions.filter(e => e.id !== id));
      alert("Edition deleted successfully!");
    } catch (error) {
      console.error("Error deleting edition:", error);
      alert("Failed to delete edition");
    }
  };

  // 🔹 MYSPACE FUNCTIONS
  const resetMyspaceForm = () => {
    setMyspaceForm({ title: "", content: "", imageURL: "", date: "", author: "", aboutauthor: "" });
    setEditingMyspaceId(null);
  };

  const handleMyspaceSubmit = async () => {
    if (!myspaceForm.title || !myspaceForm.content) {
      return alert("Please provide at least title and content.");
    }

    try {
      if (editingMyspaceId) {
        await updateDoc(doc(db, "myspace", editingMyspaceId), myspaceForm);
        setMyspaceData(myspaceData.map(m => m.id === editingMyspaceId ? { id: editingMyspaceId, ...myspaceForm } : m));
        alert("Entry updated successfully!");
      } else {
        const docRef = await addDoc(collection(db, "myspace"), myspaceForm);
        setMyspaceData([...myspaceData, { id: docRef.id, ...myspaceForm }]);
        alert("Entry added successfully!");
      }
      resetMyspaceForm();
      setShowMyspaceForm(false);
    } catch (error) {
      console.error("Error saving myspace:", error);
      alert("Failed to save entry");
    }
  };

  const startEditMyspace = (entry) => {
    setEditingMyspaceId(entry.id);
    setMyspaceForm({ 
      title: entry.title || "",
      content: entry.content || "",
      imageURL: entry.imageURL || "",
      date: entry.date || "",
      author: entry.author || "",
      aboutauthor: entry.aboutauthor || ""
    });
    setShowMyspaceForm(true);
  };

  const deleteMyspace = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;
    try {
      await deleteDoc(doc(db, "myspace", id));
      setMyspaceData(myspaceData.filter(m => m.id !== id));
      alert("Entry deleted successfully!");
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Failed to delete");
    }
  };

  // 🔹 FILTER FUNCTION
  const filterData = (data, fields) => {
    if (!searchTerm) return data;
    
    return data.filter(item => {
      return fields.some(field => {
        const value = item[field];
        return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  };

  // 🔹 RENDER LOGIN SCREEN WITH IPHONE PIN STYLE
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Login</h1>
            <p className="text-gray-600 mt-2">Enter your 4-digit PIN to access dashboard</p>
          </div>
          
          {/* iPhone-style PIN Input */}
          <div className="mb-6">
            <div className="flex justify-center gap-3 mb-6">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className={`w-16 h-16 rounded-full border-2 flex items-center justify-center text-2xl font-bold transition-all ${
                    currentPinIndex === index
                      ? "border-indigo-600 bg-indigo-50"
                      : "border-gray-300 bg-gray-50"
                  }`}
                >
                  {pinDigits[index] ? "●" : ""}
                </div>
              ))}
            </div>
            
      
{/* Number Pad */}
<div className="grid grid-cols-3 gap-3">
  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
    <button
      key={num}
      onClick={() => handlePinChange(num.toString(), currentPinIndex)}
      onKeyDown={(e) => handlePinKeyDown(e, currentPinIndex)}
      className="h-16 rounded-full bg-gray-100 hover:bg-gray-200 text-xl font-bold transition-all"
    >
      {num}
    </button>
  ))}
  <button
    onClick={() => setShowPassword(!showPassword)}
    className="h-16 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all"
  >
    {showPassword ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
  </button>
  <button
    onClick={() => handlePinChange("0", currentPinIndex)}
    onKeyDown={(e) => handlePinKeyDown(e, currentPinIndex)}
    className="h-16 rounded-full bg-gray-100 hover:bg-gray-200 text-xl font-bold transition-all"
  >
    0
  </button>
  <button
    onClick={() => {
      if (currentPinIndex > 0) {
        const newPin = [...pinDigits];
        newPin[currentPinIndex - 1] = "";
        setPinDigits(newPin);
        setCurrentPinIndex(currentPinIndex - 1);
      }
    }}
    className="h-16 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all"
  >
    <X className="w-6 h-6" />
  </button>
</div>
          </div>
          
          {/* Alternative Password Input */}
          <div className="border-t pt-6">
            <p className="text-center text-sm text-gray-500 mb-4">Or enter password directly</p>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Enter admin password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                </button>
              </div>
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-lg"
              >
                Login to Dashboard
              </button>
            </form>
          </div>
          
          {passwordError && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center">
              {passwordError}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Rest of the component remains the same...
  // (I've only included the fixed part for brevity)
  
  // 🔹 RENDER ARTICLES TAB
  const renderArticlesTab = () => {
    const filteredArticles = filterData(articles, ['title', 'author', 'category', 'type']);
    
    if (articlesLoading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading articles...</p>
          </div>
        </div>
      );
    }

    return (
      <div>
        {/* HEADER */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-6 mb-6 text-white">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold">📰 Articles Database</h2>
              <p className="mt-2 opacity-90">Total: {articles.length} articles</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  resetArticleForm();
                  setShowArticleForm(!showArticleForm);
                }}
                className="flex items-center gap-2 px-5 py-3 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all font-bold shadow-lg"
              >
                <Plus className="w-5 h-5" />
                {showArticleForm ? 'Hide Form' : 'Add Article'}
              </button>
              <button
                onClick={() => setShowBulkPaste(!showBulkPaste)}
                className="flex items-center gap-2 px-5 py-3 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all font-bold shadow-lg"
              >
                <Copy className="w-5 h-5" />
                Bulk Paste
              </button>
              <button
                onClick={fetchArticles}
                className="flex items-center gap-2 px-5 py-3 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all font-bold shadow-lg"
              >
                <RefreshCw className="w-5 h-5" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="bg-white rounded-2xl shadow-xl p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search articles by title, author, category, or type..."
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* ARTICLE FORM */}
        {showArticleForm && (
          <div className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-xl p-8 mb-8 border border-indigo-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {editingArticleId ? "✏️ Edit Article" : "➕ Add New Article"}
              </h2>
              <button onClick={() => { setShowArticleForm(false); resetArticleForm(); }} className="p-2 text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Article Image</label>
                <button
                  onClick={() => handleCloudinaryUpload("article")}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 flex items-center justify-center gap-2 shadow-lg"
                >
                  <Upload className="w-5 h-5" />
                  Upload Image
                </button>
                {articleForm.image && (
                  <div className="mt-4">
                    <img src={articleForm.image} alt="Preview" className="rounded-xl shadow-lg max-w-md" />
                  </div>
                )}
                <input
                  className="mt-3 border-2 border-gray-200 p-3 w-full rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={articleForm.image}
                  onChange={(e) => handleArticleFormChange('image', e.target.value)}
                  placeholder="Or paste image URL"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Title *</label>
                <input
                  className="border-2 border-gray-200 p-3 w-full rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={articleForm.title}
                  onChange={(e) => handleArticleFormChange('title', e.target.value)}
                  placeholder="Enter article title"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Author *</label>
                <input
                  className="border-2 border-gray-200 p-3 w-full rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={articleForm.author}
                  onChange={(e) => handleArticleFormChange('author', e.target.value)}
                  placeholder="Enter author name"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Time *</label>
                <input
                  className="border-2 border-gray-200 p-3 w-full rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={articleForm.time}
                  onChange={(e) => handleArticleFormChange('time', e.target.value)}
                  placeholder="e.g., 5 min read"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Type</label>
                <input
                  className="border-2 border-gray-200 p-3 w-full rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={articleForm.type}
                  onChange={(e) => handleArticleFormChange('type', e.target.value)}
                  placeholder="e.g., News, Opinion"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                <input
                  className="border-2 border-gray-200 p-3 w-full rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={articleForm.category}
                  onChange={(e) => handleArticleFormChange('category', e.target.value)}
                  placeholder="e.g., Technology"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">About Author</label>
                <textarea
                  className="border-2 border-gray-200 p-3 w-full rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={articleForm.aboutauthor}
                  onChange={(e) => handleArticleFormChange('aboutauthor', e.target.value)}
                  placeholder="Enter author bio"
                  rows="3"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Short Description</label>
                <textarea
                  className="border-2 border-gray-200 p-3 w-full rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={articleForm.short}
                  onChange={(e) => handleArticleFormChange('short', e.target.value)}
                  placeholder="Enter a brief summary"
                  rows="4"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Full Article Content *</label>
                <textarea
                  className="border-2 border-gray-200 p-3 w-full rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono text-sm"
                  value={articleForm.full}
                  onChange={(e) => handleArticleFormChange('full', e.target.value)}
                  placeholder="Enter the complete article content"
                  rows="10"
                />
              </div>

              <div className="md:col-span-2 flex gap-4">
                <button
                  onClick={handleArticleSubmit}
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-bold disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Saving...' : editingArticleId ? 'Update Article' : 'Add Article'}
                </button>
                <button
                  onClick={() => { setShowArticleForm(false); resetArticleForm(); }}
                  className="px-8 bg-gray-600 text-white py-4 rounded-xl hover:bg-gray-700 transition-all font-bold flex items-center justify-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* BULK PASTE */}
        {showBulkPaste && (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-xl p-6 mb-6 border-2 border-amber-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">📋 Bulk Paste Articles</h3>
            <p className="text-sm text-gray-600 mb-4">
              Paste tab-separated data: Image URL, Title, Author, About Author, Type, Category, Time, Short, Full
            </p>
            <textarea
              className="border-2 border-amber-300 p-4 w-full rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono text-sm"
              value={bulkData}
              onChange={(e) => setBulkData(e.target.value)}
              placeholder="Paste your data here (tab-separated columns)"
              rows="8"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleBulkPaste}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 font-bold shadow-lg"
              >
                Import Articles
              </button>
              <button
                onClick={() => setShowBulkPaste(false)}
                className="px-6 bg-gray-600 text-white py-3 rounded-xl hover:bg-gray-700 font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* EXCEL-LIKE ARTICLES TABLE */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto" style={{ maxHeight: '70vh' }}>
            <table className="w-full table-fixed" ref={tableRef}>
              <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider w-20">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider w-20">Image</th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider w-48">Title</th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider w-32">Author</th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider w-32">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider w-32">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider w-24">Time</th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Full Content</th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider w-32">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredArticles.map((article) => (
                  <>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {article.id.substring(0, 8)}...
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {article.image ? (
                          <img 
                            src={article.image} 
                            alt={article.title} 
                            className="h-12 w-12 rounded-lg object-cover cursor-pointer"
                            onClick={() => setViewImage(article.image)}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingInTable && editingInTable.id === article.id && editingInTable.field === 'title' ? (
                          <input
                            type="text"
                            className="w-full px-2 py-1 border border-indigo-500 rounded"
                            value={editingInTable.value}
                            onChange={(e) => setEditingInTable({ ...editingInTable, value: e.target.value })}
                            onBlur={saveInlineEdit}
                            onKeyPress={(e) => e.key === 'Enter' && saveInlineEdit()}
                            autoFocus
                          />
                        ) : (
                          <div 
                            className="text-sm font-medium text-gray-900 line-clamp-2 cursor-pointer hover:text-indigo-600"
                            onClick={() => startInlineEdit(article.id, 'title', article.title)}
                          >
                            {article.title}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingInTable && editingInTable.id === article.id && editingInTable.field === 'author' ? (
                          <input
                            type="text"
                            className="w-full px-2 py-1 border border-indigo-500 rounded"
                            value={editingInTable.value}
                            onChange={(e) => setEditingInTable({ ...editingInTable, value: e.target.value })}
                            onBlur={saveInlineEdit}
                            onKeyPress={(e) => e.key === 'Enter' && saveInlineEdit()}
                            autoFocus
                          />
                        ) : (
                          <div 
                            className="text-sm text-gray-900 cursor-pointer hover:text-indigo-600"
                            onClick={() => startInlineEdit(article.id, 'author', article.author)}
                          >
                            {article.author}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingInTable && editingInTable.id === article.id && editingInTable.field === 'category' ? (
                          <input
                            type="text"
                            className="w-full px-2 py-1 border border-indigo-500 rounded"
                            value={editingInTable.value}
                            onChange={(e) => setEditingInTable({ ...editingInTable, value: e.target.value })}
                            onBlur={saveInlineEdit}
                            onKeyPress={(e) => e.key === 'Enter' && saveInlineEdit()}
                            autoFocus
                          />
                        ) : (
                          <span 
                            className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800 cursor-pointer hover:bg-purple-200"
                            onClick={() => startInlineEdit(article.id, 'category', article.category)}
                          >
                            {article.category || 'N/A'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingInTable && editingInTable.id === article.id && editingInTable.field === 'type' ? (
                          <input
                            type="text"
                            className="w-full px-2 py-1 border border-indigo-500 rounded"
                            value={editingInTable.value}
                            onChange={(e) => setEditingInTable({ ...editingInTable, value: e.target.value })}
                            onBlur={saveInlineEdit}
                            onKeyPress={(e) => e.key === 'Enter' && saveInlineEdit()}
                            autoFocus
                          />
                        ) : (
                          <span 
                            className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800 cursor-pointer hover:bg-indigo-200"
                            onClick={() => startInlineEdit(article.id, 'type', article.type)}
                          >
                            {article.type || 'N/A'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingInTable && editingInTable.id === article.id && editingInTable.field === 'time' ? (
                          <input
                            type="text"
                            className="w-full px-2 py-1 border border-indigo-500 rounded"
                            value={editingInTable.value}
                            onChange={(e) => setEditingInTable({ ...editingInTable, value: e.target.value })}
                            onBlur={saveInlineEdit}
                            onKeyPress={(e) => e.key === 'Enter' && saveInlineEdit()}
                            autoFocus
                          />
                        ) : (
                          <div 
                            className="text-sm text-gray-900 cursor-pointer hover:text-indigo-600"
                            onClick={() => startInlineEdit(article.id, 'time', article.time)}
                          >
                            {article.time || 'N/A'}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          {article.full ? (
                            <div>
                              <p className="text-sm text-gray-600 line-clamp-3">
                                {article.full.substring(0, 150)}...
                              </p>
                              <button
                                onClick={() => toggleRowExpansion(article.id)}
                                className="text-indigo-600 hover:text-indigo-900 text-xs font-medium mt-1 flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3" />
                                {expandedRows.has(article.id) ? 'Show Less' : 'Show Full'}
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-400">No content</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditArticle(article)}
                            className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => deleteArticle(article.id)}
                            className="text-red-600 hover:text-red-900 flex items-center gap-1"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedRows.has(article.id) && (
                      <tr>
                        <td colSpan="9" className="px-6 py-4 bg-gray-50">
                          <div className="p-4 bg-white rounded-lg max-h-96 overflow-y-auto">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{article.full}</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
          {filteredArticles.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-500">No articles found</p>
              <p className="text-sm text-gray-400 mt-2">Add your first article above</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 🔹 RENDER EDITIONS TAB
  const renderEditionsTab = () => {
    const filteredEditions = filterData(editions, ['name', 'date']);
    
    if (editionsLoading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading editions...</p>
          </div>
        </div>
      );
    }

    return (
      <div>
        {/* HEADER */}
        <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl shadow-xl p-6 mb-6 text-white">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold">📚 Editions</h2>
              <p className="mt-2 opacity-90">Total: {editions.length} editions</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  resetEditionForm();
                  setShowEditionForm(!showEditionForm);
                }}
                className="flex items-center gap-2 px-5 py-3 bg-white text-purple-600 rounded-xl hover:bg-purple-50 transition-all font-bold shadow-lg"
              >
                <Plus className="w-5 h-5" />
                {showEditionForm ? 'Hide Form' : 'Add Edition'}
              </button>
              <button
                onClick={fetchEditions}
                className="flex items-center gap-2 px-5 py-3 bg-white text-purple-600 rounded-xl hover:bg-purple-50 transition-all font-bold shadow-lg"
              >
                <RefreshCw className="w-5 h-5" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="bg-white rounded-2xl shadow-xl p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search editions by name or date..."
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* EDITION FORM */}
        {showEditionForm && (
          <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-xl p-8 mb-8 border border-purple-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {editingEditionId ? "✏️ Edit Edition" : "➕ Add New Edition"}
              </h2>
              <button onClick={() => { setShowEditionForm(false); resetEditionForm(); }} className="p-2 text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Edition Name *</label>
                <input
                  className="border-2 border-gray-200 p-3 w-full rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  value={editionData.name}
                  onChange={(e) => setEditionData({ ...editionData, name: e.target.value })}
                  placeholder="Enter edition name"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Publication Date *</label>
                <input
                  type="date"
                  className="border-2 border-gray-200 p-3 w-full rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  value={editionData.date}
                  onChange={(e) => setEditionData({ ...editionData, date: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Cover Image *</label>
                <button
                  onClick={() => handleCloudinaryUpload("edition")}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-indigo-700 flex items-center justify-center gap-2 shadow-lg"
                >
                  <Upload className="w-5 h-5" />
                  Upload Image
                </button>
                {editionData.imageURL && (
                  <div className="mt-4">
                    <img src={editionData.imageURL} alt="Preview" className="rounded-xl shadow-lg max-w-md" />
                  </div>
                )}
                <input
                  className="mt-3 border-2 border-gray-200 p-3 w-full rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  value={editionData.imageURL}
                  onChange={(e) => setEditionData({ ...editionData, imageURL: e.target.value })}
                  placeholder="Or paste image URL"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">PDF URL</label>
                <input
                  className="border-2 border-gray-200 p-3 w-full rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  value={editionData.pdfURL}
                  onChange={(e) => setEditionData({ ...editionData, pdfURL: e.target.value })}
                  placeholder="Enter PDF URL"
                />
              </div>

              <div className="md:col-span-2 flex gap-4">
                <button
                  onClick={handleEditionSubmit}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-bold flex items-center justify-center gap-2 shadow-lg"
                >
                  <Save className="w-5 h-5" />
                  {editingEditionId ? 'Update Edition' : 'Add Edition'}
                </button>
                <button
                  onClick={() => { setShowEditionForm(false); resetEditionForm(); }}
                  className="px-8 bg-gray-600 text-white py-4 rounded-xl hover:bg-gray-700 transition-all font-bold flex items-center justify-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* EDITIONS TABLE */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto" style={{ maxHeight: '70vh' }}>
            <table className="w-full table-fixed">
              <thead className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider w-20">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider w-20">Cover</th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">PDF</th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider w-32">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEditions.map((edition) => (
                  <tr key={edition.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {edition.id.substring(0, 8)}...
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {edition.imageURL ? (
                        <img 
                          src={edition.imageURL} 
                          alt={edition.name} 
                          className="h-12 w-12 rounded-lg object-cover cursor-pointer"
                          onClick={() => setViewImage(edition.imageURL)}
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{edition.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{edition.date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {edition.pdfURL ? (
                        <a 
                          href={edition.pdfURL} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-900 flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          View PDF
                        </a>
                      ) : (
                        <span className="text-gray-400">No PDF</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditEdition(edition)}
                          className="text-purple-600 hover:text-purple-900 flex items-center gap-1"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => deleteEdition(edition.id)}
                          className="text-red-600 hover:text-red-900 flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredEditions.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-500">No editions found</p>
              <p className="text-sm text-gray-400 mt-2">Add your first edition above</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 🔹 RENDER MYSPACE TAB
  const renderMyspaceTab = () => {
    const filteredMyspace = filterData(myspaceData, ['title', 'full', 'date', 'author']);
    
    if (myspaceLoading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 animate-spin text-pink-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading myspace...</p>
          </div>
        </div>
      );
    }

    return (
      <div>
        {/* HEADER */}
        <div className="bg-gradient-to-br from-pink-600 to-rose-600 rounded-2xl shadow-xl p-6 mb-6 text-white">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold">🎨 MySpace</h2>
              <p className="mt-2 opacity-90">Total: {myspaceData.length} entries</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  resetMyspaceForm();
                  setShowMyspaceForm(!showMyspaceForm);
                }}
                className="flex items-center gap-2 px-5 py-3 bg-white text-pink-600 rounded-xl hover:bg-pink-50 transition-all font-bold shadow-lg"
              >
                <Plus className="w-5 h-5" />
                {showMyspaceForm ? 'Hide Form' : 'Add Entry'}
              </button>
              <button
                onClick={addInfluenceOfSocialMediaEssay}
                className="flex items-center gap-2 px-5 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-bold shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Add Social Media Essay
              </button>
              <button
                onClick={fetchMyspace}
                className="flex items-center gap-2 px-5 py-3 bg-white text-pink-600 rounded-xl hover:bg-pink-50 transition-all font-bold shadow-lg"
              >
                <RefreshCw className="w-5 h-5" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="bg-white rounded-2xl shadow-xl p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search entries by title, content, author, or date..."
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* MYSPACE FORM */}
        {showMyspaceForm && (
          <div className="bg-gradient-to-br from-white to-pink-50 rounded-2xl shadow-xl p-8 mb-8 border border-pink-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                {editingMyspaceId ? "✏️ Edit Entry" : "➕ Add New Entry"}
              </h2>
              <button onClick={() => { setShowMyspaceForm(false); resetMyspaceForm(); }} className="p-2 text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Title *</label>
                <input
                  className="border-2 border-gray-200 p-3 w-full rounded-xl focus:ring-2 focus:ring-pink-500 focus:outline-none"
                  value={myspaceForm.title}
                  onChange={(e) => setMyspaceForm({ ...myspaceForm, title: e.target.value })}
                  placeholder="Enter title"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Author</label>
                <input
                  className="border-2 border-gray-200 p-3 w-full rounded-xl focus:ring-2 focus:ring-pink-500 focus:outline-none"
                  value={myspaceForm.author}
                  onChange={(e) => setMyspaceForm({ ...myspaceForm, author: e.target.value })}
                  placeholder="Enter author name"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  className="border-2 border-gray-200 p-3 w-full rounded-xl focus:ring-2 focus:ring-pink-500 focus:outline-none"
                  value={myspaceForm.date}
                  onChange={(e) => setMyspaceForm({ ...myspaceForm, date: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">About Author</label>
                <textarea
                  className="border-2 border-gray-200 p-3 w-full rounded-xl focus:ring-2 focus:ring-pink-500 focus:outline-none"
                  value={myspaceForm.aboutauthor}
                  onChange={(e) => setMyspaceForm({ ...myspaceForm, aboutauthor: e.target.value })}
                  placeholder="Enter author bio"
                  rows="3"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Content *</label>
                <textarea
                  className="border-2 border-gray-200 p-3 w-full rounded-xl focus:ring-2 focus:ring-pink-500 focus:outline-none"
                  value={myspaceForm.full}
                  onChange={(e) => setMyspaceForm({ ...myspaceForm, content: e.target.value })}
                  placeholder="Enter content"
                  rows="6"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Image</label>
                <button
                  onClick={() => handleCloudinaryUpload("myspace")}
                  className="w-full bg-gradient-to-r from-pink-600 to-rose-600 text-white px-6 py-3 rounded-xl hover:from-pink-700 hover:to-rose-700 flex items-center justify-center gap-2 shadow-lg"
                >
                  <Upload className="w-5 h-5" />
                  Upload Image
                </button>
                {myspaceForm.imageURL && (
                  <div className="mt-4">
                    <img src={myspaceForm.imageURL} alt="Preview" className="rounded-xl shadow-lg max-w-md" />
                  </div>
                )}
                <input
                  className="mt-3 border-2 border-gray-200 p-3 w-full rounded-xl focus:ring-2 focus:ring-pink-500 focus:outline-none"
                  value={myspaceForm.imageURL}
                  onChange={(e) => setMyspaceForm({ ...myspaceForm, imageURL: e.target.value })}
                  placeholder="Or paste image URL"
                />
              </div>

              <div className="md:col-span-2 flex gap-4">
                <button
                  onClick={handleMyspaceSubmit}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-bold flex items-center justify-center gap-2 shadow-lg"
                >
                  <Save className="w-5 h-5" />
                  {editingMyspaceId ? 'Update Entry' : 'Add Entry'}
                </button>
                <button
                  onClick={() => { setShowMyspaceForm(false); resetMyspaceForm(); }}
                  className="px-8 bg-gray-600 text-white py-4 rounded-xl hover:bg-gray-700 transition-all font-bold flex items-center justify-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MYSPACE TABLE */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto" style={{ maxHeight: '70vh' }}>
            <table className="w-full table-fixed">
              <thead className="bg-gradient-to-r from-pink-600 to-rose-600 text-white sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider w-20">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider w-20">Image</th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Title</th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider w-32">Author</th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Content</th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">About Author</th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider w-32">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMyspace.map((entry) => (
                  <>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {entry.id.substring(0, 8)}...
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {entry.imageURL ? (
                          <img 
                            src={entry.imageURL} 
                            alt={entry.title} 
                            className="h-12 w-12 rounded-lg object-cover cursor-pointer"
                            onClick={() => setViewImage(entry.imageURL)}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{entry.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{entry.author || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <p className="text-sm text-gray-900 line-clamp-3">{entry.content}</p>
                          {entry.content && entry.content.length > 150 && (
                            <button
                              onClick={() => toggleRowExpansion(entry.id)}
                              className="text-pink-600 hover:text-pink-900 text-xs font-medium mt-1 flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              {expandedRows.has(entry.id) ? 'Show Less' : 'Show Full'}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <p className="text-sm text-gray-600 line-clamp-2">{entry.aboutauthor || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{entry.date || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditMyspace(entry)}
                            className="text-pink-600 hover:text-pink-900 flex items-center gap-1"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => deleteMyspace(entry.id)}
                            className="text-red-600 hover:text-red-900 flex items-center gap-1"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedRows.has(entry.id) && (
                      <tr>
                        <td colSpan="8" className="px-6 py-4 bg-gray-50">
                          <div className="p-4 bg-white rounded-lg max-h-96 overflow-y-auto">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{entry.content}</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
          {filteredMyspace.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-500">No entries found</p>
              <p className="text-sm text-gray-400 mt-2">Add your first entry above</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 🔹 MAIN RETURN
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* TAB NAVIGATION */}
        <div className="bg-white rounded-2xl shadow-xl p-2 mb-6 flex gap-2 flex-wrap">
          <button 
            onClick={() => setActiveTab("articles")} 
            className={`flex-1 min-w-[200px] py-4 px-6 rounded-xl font-bold transition-all ${
              activeTab === "articles" 
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            📰 Articles
          </button>
          <button 
            onClick={() => setActiveTab("myspace")} 
            className={`flex-1 min-w-[200px] py-4 px-6 rounded-xl font-bold transition-all ${
              activeTab === "myspace" 
                ? "bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            🎨 MySpace
          </button>
          <button 
            onClick={() => setActiveTab("editions")} 
            className={`flex-1 min-w-[200px] py-4 px-6 rounded-xl font-bold transition-all ${
              activeTab === "editions" 
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            📚 Editions
          </button>
        </div>

        {/* TAB CONTENT */}
        {activeTab === "articles" && renderArticlesTab()}
        {activeTab === "myspace" && renderMyspaceTab()}
        {activeTab === "editions" && renderEditionsTab()}
      </div>

      {/* IMAGE VIEWER MODAL */}
      {viewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4" onClick={() => setViewImage(null)}>
          <div className="relative max-w-6xl max-h-full">
            <button onClick={() => setViewImage(null)} className="absolute top-4 right-4 p-3 bg-white rounded-full hover:bg-gray-100 shadow-lg z-10">
              <X className="w-6 h-6" />
            </button>
            <img src={viewImage} alt="Full view" className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );
}