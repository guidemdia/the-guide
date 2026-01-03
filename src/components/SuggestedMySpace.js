import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

export default function SuggestedMySpace() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "myspace"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const fetchedSuggestions = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedSuggestions.push({ 
          id: doc.id, 
          ...data,
          createdAt: data.createdAt?.toDate()
        });
      });
      setSuggestions(fetchedSuggestions.slice(0, 8)); // Get only 8 suggestions
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
    setLoading(false);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeColor = (type) => {
    const colors = {
      poem: 'bg-purple-100 text-purple-800',
      story: 'bg-blue-100 text-blue-800',
      essay: 'bg-green-100 text-green-800',
      article: 'bg-yellow-100 text-yellow-800',
      default: 'bg-gray-100 text-gray-800'
    };
    return colors[type.toLowerCase()] || colors.default;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-200"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">My Space Suggestions</h1>
        <p className="text-gray-600">Click on any suggestion to use it for your new item</p>
      </div>

      <div className="grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105"
            onClick={() => {
              // Pass the selected suggestion to parent component
              if (window.onSuggestionClick) {
                window.onSuggestionClick(suggestion);
              }
            }}
          >
            {/* Card Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTypeColor(suggestion.type)}`}>
                  {suggestion.type?.toUpperCase() || 'ARTICLE'}
                </span>
                {suggestion.createdAt && (
                  <span className="text-xs text-gray-500">
                    {formatDate(suggestion.createdAt)}
                  </span>
                )}
              </div>
              <h3 className="font-bold text-lg text-gray-900 truncate">
                {suggestion.title}
              </h3>
            </div>
            
            {/* Card Body */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0H4a4 4 0 014 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.94 13.07l-2.83-2.83" />
                  </svg>
                  <span className="text-sm text-gray-600">{suggestion.author}</span>
                </div>
                {suggestion.createdAt && (
                  <span className="text-xs text-gray-500">
                    {formatTime(suggestion.createdAt)}
                  </span>
                )}
              </div>
              
              <div className="text-sm text-gray-700 line-clamp-2">
                {suggestion.full ? suggestion.full.substring(0, 100) + "..." : "No content"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}