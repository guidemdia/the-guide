import { useState, useEffect, useMemo } from "react";
import { db } from "../firebase";
import { 
  collection, 
  doc, 
  setDoc, 
  serverTimestamp, 
  getDocs,
  deleteDoc,
  query,
  orderBy
} from "firebase/firestore";
import Papa from 'papaparse';
import DOMPurify from 'dompurify';
import AddArticleForm from "./AddArticleForm";

export default function ArticlesPanel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [accessMode, setAccessMode] = useState(false);
  const [editingCell, setEditingCell] = useState({ id: null, field: null });
  const [cellValue, setCellValue] = useState("");
  const [savingCell, setSavingCell] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [showImportModal, setShowImportModal] = useState(false);
  const [expandedFullText, setExpandedFullText] = useState({});
  const [expandedCells, setExpandedCells] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null); // Add success state

  // Function to show success message
  const showSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000); // Auto-hide after 3 seconds
  };

  // Fetch items from Firestore on component mount
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      // Simple query to get all documents
      const q = query(collection(db, "writings"));
      const querySnapshot = await getDocs(q);
      
      const fetchedItems = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Add a default order if it doesn't exist
        if (!data.order) {
          data.order = 0;
        }
        fetchedItems.push({ id: doc.id, ...data });
      });
      
      // Sort by order field (highest first)
      fetchedItems.sort((a, b) => (b.order || 0) - (a.order || 0));
      
      console.log(`Fetched ${fetchedItems.length} items`);
      setItems(fetchedItems);
    } catch (error) {
      console.error("Error fetching items:", error);
      setError(`Failed to fetch items: ${error.message}`);
    }
    setLoading(false);
  };

  // Function to strip HTML tags from text
  const stripHtml = (html) => {
    if (!html) return "";
    // Create a temporary div element
    const tempDiv = document.createElement("div");
    // Set the HTML content
    tempDiv.innerHTML = html;
    // Return the text content
    return tempDiv.textContent || tempDiv.innerText || "";
  };

  // Function to truncate text and add read more
  const truncateTextWithReadMore = (text, maxLength = 50, itemId = null, field = null) => {
    if (!text) return "";
    
    // Strip HTML for display
    const plainText = stripHtml(text);
    
    // If text is short enough, return as is
    if (plainText.length <= maxLength) {
      return plainText;
    }
    
    // Check if this cell is expanded
    const cellKey = `${itemId}-${field}`;
    const isExpanded = expandedCells[cellKey];
    
    if (isExpanded) {
      return plainText;
    }
    
    // Return truncated text with dots
    return plainText.substring(0, maxLength) + "...";
  };

  // Toggle cell expansion
  const toggleCellExpansion = (itemId, field) => {
    const cellKey = `${itemId}-${field}`;
    setExpandedCells(prev => ({
      ...prev,
      [cellKey]: !prev[cellKey]
    }));
  };

  // Filter items based on search term
  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;
    const lowerSearchTerm = searchTerm.toLowerCase();
    return items.filter(item => 
      item.title?.toLowerCase().includes(lowerSearchTerm) ||
      item.author?.toLowerCase().includes(lowerSearchTerm) ||
      item.type?.toLowerCase().includes(lowerSearchTerm) ||
      item.category?.toLowerCase().includes(lowerSearchTerm) ||
      item.id?.toLowerCase().includes(lowerSearchTerm) ||
      stripHtml(item.full).toLowerCase().includes(lowerSearchTerm)
    );
  }, [items, searchTerm]);

  const handleEdit = (item) => {
    try {
      console.log("Editing item:", item);
      setEditingItem(item);
      setShowForm(true);
      setError(null);
    } catch (error) {
      console.error("Error in handleEdit:", error);
      setError(`Failed to edit item: ${error.message}`);
    }
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setEditingItem(null);
    setError(null);
    fetchItems();
  };

  const handleDelete = async (id) => {
    try {
      if (window.confirm("Are you sure you want to delete this article?")) {
        await deleteDoc(doc(db, "writings", id));
        setItems(items.filter(item => item.id !== id));
        showSuccess("Article deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      setError(`Failed to delete article: ${error.message}`);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) {
      alert("No items selected for deletion");
      return;
    }
    
    try {
      if (window.confirm(`Are you sure you want to delete ${selectedItems.length} article(s)?`)) {
        for (const id of selectedItems) {
          await deleteDoc(doc(db, "writings", id));
        }
        setItems(items.filter(item => !selectedItems.includes(item.id)));
        setSelectedItems([]);
        showSuccess(`${selectedItems.length} article(s) deleted successfully`);
      }
    } catch (error) {
      console.error("Error deleting items:", error);
      setError(`Failed to delete articles: ${error.message}`);
    }
  };

  const handleCheckboxChange = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(item => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleSelectAllChange = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map(item => item.id));
    }
  };

  const startCellEdit = (id, field, value) => {
    if (!accessMode) return;
    setEditingCell({ id, field });
    setCellValue(value);
  };

  const saveCellEdit = async () => {
    if (!editingCell.id) return;
    
    setSavingCell(true);
    try {
      const item = items.find(i => i.id === editingCell.id);
      await setDoc(doc(db, "writings", editingCell.id), {
        ...item,
        [editingCell.field]: cellValue,
        updatedAt: serverTimestamp(),
      });
      
      setItems(items.map(item => 
        item.id === editingCell.id 
          ? { ...item, [editingCell.field]: cellValue }
          : item
      ));
      
      setEditingCell({ id: null, field: null });
    } catch (error) {
      console.error("Error updating cell:", error);
      setError(`Failed to update cell: ${error.message}`);
    } finally {
      setSavingCell(false);
    }
  };

  const cancelCellEdit = () => {
    setEditingCell({ id: null, field: null });
    setCellValue("");
  };

  const saveOrder = async (id, newOrder) => {
    try {
      const item = items.find(i => i.id === id);
      await setDoc(doc(db, "writings", id), {
        ...item,
        order: parseInt(newOrder, 10),
        updatedAt: serverTimestamp(),
      });
      
      setItems(items.map(item => 
        item.id === id 
          ? { ...item, order: parseInt(newOrder, 10) }
          : item
      ));
      
      showSuccess("Order updated successfully!");
    } catch (error) {
      console.error("Error updating order:", error);
      setError(`Failed to update order: ${error.message}`);
    }
  };

  const toggleFullText = (id) => {
    setExpandedFullText(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return "";
    // Strip HTML before truncating
    const plainText = stripHtml(text);
    return plainText.length > maxLength ? plainText.substring(0, maxLength) + "..." : plainText;
  };

  const exportToCSV = () => {
    try {
      const headers = ["id", "title", "type", "category", "author", "aboutauthor", "short", "time", "full", "image", "order"];
      
      const csvData = filteredItems.map(item => ({
        id: item.id || "",
        title: item.title || "",
        type: item.type || "",
        category: item.category || "",
        author: item.author || "",
        aboutauthor: item.aboutauthor || "",
        short: item.short || "",
        time: item.time || "",
        full: stripHtml(item.full) || "", // Strip HTML for CSV export
        image: item.image || "",
        order: item.order || 0
      }));
      
      const csv = Papa.unparse({
        fields: headers,
        data: csvData
      });
      
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `articles_export_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting CSV:", error);
      setError(`Failed to export CSV: ${error.message}`);
    }
  };

  const handleCsvImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImporting(true);
    setImportProgress(0);
    
    try {
      const text = await file.text();
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const dataRows = results.data;
          const totalRows = dataRows.length;
          
          for (let i = 0; i < totalRows; i++) {
            const row = dataRows[i];
            
            if (row.id && row.id.toLowerCase() !== 'id' && row.title && row.title.toLowerCase() !== 'title') {
              const item = {
                id: DOMPurify.sanitize(row.id || ""),
                title: DOMPurify.sanitize(row.title || ""),
                type: DOMPurify.sanitize(row.type || ""),
                category: DOMPurify.sanitize(row.category || ""),
                author: DOMPurify.sanitize(row.author || ""),
                aboutauthor: DOMPurify.sanitize(row.aboutauthor || ""),
                short: DOMPurify.sanitize(row.short || ""),
                time: DOMPurify.sanitize(row.time || ""),
                full: DOMPurify.sanitize(row.full || ""),
                image: DOMPurify.sanitize(row.image || ""),
                order: parseInt(row.order || 0, 10)
              };
              
              await setDoc(doc(db, "writings", item.id), {
                ...item,
                createdAt: serverTimestamp(),
              });
            }
            
            setImportProgress(Math.round(((i + 1) / totalRows) * 100));
          }
          
          showSuccess("CSV imported successfully!");
          fetchItems();
          setShowImportModal(false);
        },
        error: (error) => {
          console.error("Error parsing CSV:", error);
          setError(`Failed to parse CSV file: ${error.message}`);
        }
      });
    } catch (error) {
      console.error("Error importing CSV:", error);
      setError(`Failed to import CSV: ${error.message}`);
    } finally {
      setImporting(false);
      setImportProgress(0);
      e.target.value = null;
    }
  };

  // Add function to update all documents with order field
  const updateAllWithOrder = async () => {
    if (!window.confirm("This will add an 'order' field to all documents that don't have one. Continue?")) {
      return;
    }

    try {
      const q = query(collection(db, "writings"));
      const querySnapshot = await getDocs(q);
      let updatedCount = 0;
      
      for (const docSnapshot of querySnapshot.docs) {
        const data = docSnapshot.data();
        if (!data.order) {
          await setDoc(doc(db, "writings", docSnapshot.id), {
            ...data,
            order: 0,
            updatedAt: serverTimestamp()
          });
          updatedCount++;
        }
      }
      
      showSuccess(`Updated ${updatedCount} documents with order field`);
      fetchItems();
    } catch (error) {
      console.error("Error updating documents:", error);
      setError(`Failed to update documents: ${error.message}`);
    }
  };

  return (
    <div className="max-w-full mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Success Alert */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 flex justify-between items-center">
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="font-bold">✕</button>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-bold">✕</button>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">Articles</h1>
          <p className="text-sm text-gray-600 mt-1">
            Showing {filteredItems.length} of {items.length} articles
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setAccessMode(!accessMode)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              accessMode 
                ? "bg-green-600 text-white hover:bg-green-700" 
                : "bg-gray-300 text-gray-700 hover:bg-gray-400"
            }`}
          >
            {accessMode ? "✓ Editing ON" : "Enable Editing"}
          </button>
          
          <button
            onClick={updateAllWithOrder}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
          >
            Fix Order Field
          </button>
          
          <button
            onClick={() => {
              setEditingItem(null);
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add New Article
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by title, author, type, category, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* Export/Import Section */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Data Management</h2>
        <div className="flex gap-4">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Export to CSV
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            Import from CSV
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4 flex justify-between items-center">
          <span className="text-blue-800 font-medium">
            {selectedItems.length} article(s) selected
          </span>
          <button
            onClick={handleBulkDelete}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Delete Selected
          </button>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {editingItem ? "Edit Article" : "Add New Article"}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingItem(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <AddArticleForm
              initialData={editingItem}
              onSubmit={handleFormSubmit}
            />
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Import from CSV</h2>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-4">
                Select a CSV file to import. The file should have columns for: id, title, type, category, author, aboutauthor, short, time, full, image, and order.
              </p>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <div className="mt-4">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Click to upload or drag and drop
                    </span>
                    <input id="file-upload" name="file-upload" type="file" accept=".csv" onChange={handleCsvImport} className="sr-only" />
                  </label>
                  <p className="mt-1 text-xs text-gray-500">CSV files only</p>
                </div>
              </div>
            </div>
            
            {importing && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Importing...</span>
                  <span>{importProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${importProgress}%` }}
                  />
                </div>
              </div>
            )}
            
            <div className="flex justify-end">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 mr-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Items Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : filteredItems.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No articles found. Add a new article or import a CSV file.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === filteredItems.length}
                      onChange={handleSelectAllChange}
                      className="rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    About Author
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Short
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Full Text
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleCheckboxChange(item.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        defaultValue={item.order || 0}
                        onBlur={(e) => saveOrder(item.id, e.target.value)}
                        className="w-20 p-1 border rounded text-center"
                        placeholder="0"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {editingCell.id === item.id && editingCell.field === 'id' ? (
                        <input
                          type="text"
                          value={cellValue}
                          onChange={(e) => setCellValue(e.target.value)}
                          onBlur={saveCellEdit}
                          onKeyPress={(e) => e.key === 'Enter' && saveCellEdit()}
                          onKeyDown={(e) => e.key === 'Escape' && cancelCellEdit()}
                          className="w-full p-1 border rounded"
                          autoFocus
                        />
                      ) : (
                        <span 
                          className={accessMode ? "px-2 py-1 rounded hover:bg-yellow-100 cursor-pointer" : ""}
                          onClick={() => startCellEdit(item.id, 'id', item.id)}
                        >
                          {item.id}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 max-w-xs">
                      {editingCell.id === item.id && editingCell.field === 'title' ? (
                        <input
                          type="text"
                          value={cellValue}
                          onChange={(e) => setCellValue(e.target.value)}
                          onBlur={saveCellEdit}
                          onKeyPress={(e) => e.key === 'Enter' && saveCellEdit()}
                          onKeyDown={(e) => e.key === 'Escape' && cancelCellEdit()}
                          className="w-full p-1 border rounded"
                          autoFocus
                        />
                      ) : (
                        <div className={accessMode ? "cursor-pointer" : ""}>
                          <span 
                            onClick={() => startCellEdit(item.id, 'title', item.title)}
                            className={accessMode ? "hover:bg-yellow-100 px-2 py-1 rounded" : ""}
                          >
                            {truncateTextWithReadMore(item.title, 50, item.id, 'title')}
                          </span>
                          {stripHtml(item.title).length > 50 && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCellExpansion(item.id, 'title');
                              }}
                              className="text-blue-500 hover:text-blue-700 ml-1 text-xs"
                            >
                              {expandedCells[`${item.id}-title`] ? "Show less" : "Read more"}
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {editingCell.id === item.id && editingCell.field === 'type' ? (
                        <select
                          value={cellValue}
                          onChange={(e) => setCellValue(e.target.value)}
                          onBlur={saveCellEdit}
                          className="w-full p-1 border rounded"
                          autoFocus
                        >
                          <option value="article">Article</option>
                          <option value="story">Story</option>
                          <option value="poem">Poem</option>
                          <option value="essay">Essay</option>
                          <option value="review">Review</option>
                        </select>
                      ) : (
                        <span 
                          className={accessMode ? "px-2 py-1 rounded hover:bg-yellow-100 cursor-pointer" : ""}
                          onClick={() => startCellEdit(item.id, 'type', item.type)}
                        >
                          {item.type}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs">
                      {editingCell.id === item.id && editingCell.field === 'category' ? (
                        <input
                          type="text"
                          value={cellValue}
                          onChange={(e) => setCellValue(e.target.value)}
                          onBlur={saveCellEdit}
                          onKeyPress={(e) => e.key === 'Enter' && saveCellEdit()}
                          onKeyDown={(e) => e.key === 'Escape' && cancelCellEdit()}
                          className="w-full p-1 border rounded"
                          autoFocus
                        />
                      ) : (
                        <div className={accessMode ? "cursor-pointer" : ""}>
                          <span 
                            onClick={() => startCellEdit(item.id, 'category', item.category)}
                            className={accessMode ? "hover:bg-yellow-100 px-2 py-1 rounded" : ""}
                          >
                            {truncateTextWithReadMore(item.category, 30, item.id, 'category')}
                          </span>
                          {stripHtml(item.category).length > 30 && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCellExpansion(item.id, 'category');
                              }}
                              className="text-blue-500 hover:text-blue-700 ml-1 text-xs"
                            >
                              {expandedCells[`${item.id}-category`] ? "Show less" : "Read more"}
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs">
                      {editingCell.id === item.id && editingCell.field === 'author' ? (
                        <input
                          type="text"
                          value={cellValue}
                          onChange={(e) => setCellValue(e.target.value)}
                          onBlur={saveCellEdit}
                          onKeyPress={(e) => e.key === 'Enter' && saveCellEdit()}
                          onKeyDown={(e) => e.key === 'Escape' && cancelCellEdit()}
                          className="w-full p-1 border rounded"
                          autoFocus
                        />
                      ) : (
                        <div className={accessMode ? "cursor-pointer" : ""}>
                          <span 
                            onClick={() => startCellEdit(item.id, 'author', item.author)}
                            className={accessMode ? "hover:bg-yellow-100 px-2 py-1 rounded" : ""}
                          >
                            {truncateTextWithReadMore(item.author, 30, item.id, 'author')}
                          </span>
                          {stripHtml(item.author).length > 30 && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCellExpansion(item.id, 'author');
                              }}
                              className="text-blue-500 hover:text-blue-700 ml-1 text-xs"
                            >
                              {expandedCells[`${item.id}-author`] ? "Show less" : "Read more"}
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 max-w-xs">
                      {editingCell.id === item.id && editingCell.field === 'aboutauthor' ? (
                        <textarea
                          value={cellValue}
                          onChange={(e) => setCellValue(e.target.value)}
                          onBlur={saveCellEdit}
                          onKeyPress={(e) => e.key === 'Enter' && saveCellEdit()}
                          onKeyDown={(e) => e.key === 'Escape' && cancelCellEdit()}
                          className="w-full p-1 border rounded"
                          autoFocus
                        />
                      ) : (
                        <div className={accessMode ? "cursor-pointer" : ""}>
                          <span 
                            onClick={() => startCellEdit(item.id, 'aboutauthor', item.aboutauthor)}
                            className={accessMode ? "hover:bg-yellow-100 px-2 py-1 rounded" : ""}
                          >
                            {truncateTextWithReadMore(item.aboutauthor, 40, item.id, 'aboutauthor')}
                          </span>
                          {stripHtml(item.aboutauthor).length > 40 && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCellExpansion(item.id, 'aboutauthor');
                              }}
                              className="text-blue-500 hover:text-blue-700 ml-1 text-xs"
                            >
                              {expandedCells[`${item.id}-aboutauthor`] ? "Show less" : "Read more"}
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 max-w-xs">
                      {editingCell.id === item.id && editingCell.field === 'short' ? (
                        <textarea
                          value={cellValue}
                          onChange={(e) => setCellValue(e.target.value)}
                          onBlur={saveCellEdit}
                          onKeyPress={(e) => e.key === 'Enter' && saveCellEdit()}
                          onKeyDown={(e) => e.key === 'Escape' && cancelCellEdit()}
                          className="w-full p-1 border rounded"
                          autoFocus
                        />
                      ) : (
                        <div className={accessMode ? "cursor-pointer" : ""}>
                          <span 
                            onClick={() => startCellEdit(item.id, 'short', item.short)}
                            className={accessMode ? "hover:bg-yellow-100 px-2 py-1 rounded" : ""}
                          >
                            {truncateTextWithReadMore(item.short, 50, item.id, 'short')}
                          </span>
                          {stripHtml(item.short).length > 50 && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCellExpansion(item.id, 'short');
                              }}
                              className="text-blue-500 hover:text-blue-700 ml-1 text-xs"
                            >
                              {expandedCells[`${item.id}-short`] ? "Show less" : "Read more"}
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {editingCell.id === item.id && editingCell.field === 'time' ? (
                        <input
                          type="text"
                          value={cellValue}
                          onChange={(e) => setCellValue(e.target.value)}
                          onBlur={saveCellEdit}
                          onKeyPress={(e) => e.key === 'Enter' && saveCellEdit()}
                          onKeyDown={(e) => e.key === 'Escape' && cancelCellEdit()}
                          className="w-full p-1 border rounded"
                          autoFocus
                        />
                      ) : (
                        <span 
                          className={accessMode ? "px-2 py-1 rounded hover:bg-yellow-100 cursor-pointer" : ""}
                          onClick={() => startCellEdit(item.id, 'time', item.time)}
                        >
                          {item.time}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 max-w-md">
                      {editingCell.id === item.id && editingCell.field === 'full' ? (
                        <textarea
                          value={cellValue}
                          onChange={(e) => setCellValue(e.target.value)}
                          onBlur={saveCellEdit}
                          onKeyPress={(e) => e.key === 'Enter' && saveCellEdit()}
                          onKeyDown={(e) => e.key === 'Escape' && cancelCellEdit()}
                          className="w-full p-1 border rounded"
                          rows={4}
                          autoFocus
                        />
                      ) : (
                        <div 
                          className={accessMode ? "px-2 py-1 rounded hover:bg-yellow-100 cursor-pointer" : ""}
                          onClick={() => startCellEdit(item.id, 'full', item.full)}
                        >
                          {expandedFullText[item.id] ? stripHtml(item.full) : truncateText(item.full, 100)}
                          {item.full && stripHtml(item.full).length > 100 && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFullText(item.id);
                              }}
                              className="text-blue-500 hover:text-blue-700 ml-1"
                            >
                              {expandedFullText[item.id] ? "Show less" : "Read more"}
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.image && (
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          className="h-12 w-12 object-cover rounded"
                        />
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}