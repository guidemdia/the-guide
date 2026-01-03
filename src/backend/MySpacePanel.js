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
import AddMySpaceForm from "./AddMySpaceForm";

export default function MySpacePanel() {
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

  // Fetch items from Firestore on component mount
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "myspace"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const fetchedItems = [];
      querySnapshot.forEach((doc) => {
        fetchedItems.push({ id: doc.id, ...doc.data() });
      });
      setItems(fetchedItems);
    } catch (error) {
      console.error("Error fetching items:", error);
      alert("Failed to fetch items");
    }
    setLoading(false);
  };

  // Filter items based on search term
  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;
    const lowerSearchTerm = searchTerm.toLowerCase();
    return items.filter(item => 
      item.title?.toLowerCase().includes(lowerSearchTerm) ||
      item.author?.toLowerCase().includes(lowerSearchTerm) ||
      item.type?.toLowerCase().includes(lowerSearchTerm) ||
      item.id?.toLowerCase().includes(lowerSearchTerm)
    );
  }, [items, searchTerm]);

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setEditingItem(null);
    fetchItems();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteDoc(doc(db, "myspace", id));
        setItems(items.filter(item => item.id !== id));
        alert("Item deleted successfully");
      } catch (error) {
        console.error("Error deleting item:", error);
        alert("Failed to delete item");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) {
      alert("No items selected for deletion");
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete ${selectedItems.length} item(s)?`)) {
      try {
        await Promise.all(selectedItems.map(id => deleteDoc(doc(db, "myspace", id))));
        setItems(items.filter(item => !selectedItems.includes(item.id)));
        setSelectedItems([]);
        alert(`${selectedItems.length} item(s) deleted successfully`);
      } catch (error) {
        console.error("Error deleting items:", error);
        alert("Failed to delete items");
      }
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllChange = () => {
    setSelectedItems(selectAll ? [] : filteredItems.map(item => item.id));
  };
  const selectAll = filteredItems.length > 0 && selectedItems.length === filteredItems.length;

  const startCellEdit = (id, field, value) => {
    if (!accessMode || savingCell) return;
    setEditingCell({ id, field });
    setCellValue(value);
  };

  const saveCellEdit = async () => {
    if (savingCell || !editingCell.id) return;
    
    setSavingCell(true);
    try {
      const itemToUpdate = items.find(i => i.id === editingCell.id);
      const sanitizedValue = DOMPurify.sanitize(cellValue);

      await setDoc(doc(db, "myspace", editingCell.id), {
        ...itemToUpdate,
        [editingCell.field]: sanitizedValue,
        updatedAt: serverTimestamp(),
      });
      
      setItems(items.map(item => 
        item.id === editingCell.id 
          ? { ...item, [editingCell.field]: sanitizedValue }
          : item
      ));
    } catch (error) {
      console.error("Error updating cell:", error);
      alert("Failed to update cell");
    } finally {
      setSavingCell(false);
      setEditingCell({ id: null, field: null });
    }
  };

  const cancelCellEdit = () => {
    setEditingCell({ id: null, field: null });
    setCellValue("");
  };

  const exportToCSV = () => {
    const headers = ["id", "title", "type", "author", "aboutauthor", "full", "image", "to do"];
    
    const csvData = filteredItems.map(item => ({
      id: item.id || "",
      title: item.title || "",
      type: item.type || "",
      author: item.author || "",
      aboutauthor: item.aboutauthor || "",
      full: item.full || "",
      image: item.image || "",
      "to do": "correct the pera"
    }));
    
    const csv = Papa.unparse({
      fields: headers,
      data: csvData
    });
    
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `myspace_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // *** CORRECTED IMPORT FUNCTION ***
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
          let importedCount = 0;
          
          for (let i = 0; i < totalRows; i++) {
            const row = dataRows[i];
            
            // *** THIS IS THE KEY FIX ***
            // 1. Check if 'id' exists.
            // 2. Make sure the 'id' is not the literal string "id" (which indicates a header row).
            // 3. Make sure the 'title' also exists and is not the header string.
            if (row.id && row.id.toLowerCase() !== 'id' && row.title && row.title.toLowerCase() !== 'title') {
              
              const item = {
                id: DOMPurify.sanitize(row.id),
                title: DOMPurify.sanitize(row.title || ""),
                type: DOMPurify.sanitize(row.type || ""),
                author: DOMPurify.sanitize(row.author || ""),
                aboutauthor: DOMPurify.sanitize(row.aboutauthor || ""),
                full: DOMPurify.sanitize(row.full || ""),
                image: DOMPurify.sanitize(row.image || ""),
              };
              
              await setDoc(doc(db, "myspace", item.id), {
                ...item,
                createdAt: serverTimestamp(),
              });
              importedCount++;
            }
            
            setImportProgress(Math.round(((i + 1) / totalRows) * 100));
          }
          
          alert(`Import complete! ${importedCount} new items were added.`);
          fetchItems();
          setShowImportModal(false);
        },
        error: (error) => {
          console.error("Error parsing CSV:", error);
          alert("Failed to parse CSV file. Please check the format.");
        }
      });
    } catch (error) {
      console.error("Error importing CSV:", error);
      alert("Failed to import CSV.");
    } finally {
      setImporting(false);
      setImportProgress(0);
      e.target.value = null; // Reset file input
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-gray-800">My Space</h1>
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
            onClick={() => {
              setEditingItem(null);
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add New Item
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by title, author, type, or ID..."
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

      {selectedItems.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4 flex justify-between items-center">
          <span className="text-blue-800 font-medium">
            {selectedItems.length} item(s) selected
          </span>
          <button
            onClick={handleBulkDelete}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Delete Selected
          </button>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {editingItem ? "Edit Item" : "Add New Item"}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <AddMySpaceForm initialData={editingItem} onSubmit={handleFormSubmit} />
          </div>
        </div>
      )}

      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Import from CSV</h2>
              <button onClick={() => setShowImportModal(false)} className="text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-4">
                Select a CSV file to import. The file should have columns for: id, title, type, author, aboutauthor, and full.
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
                    <input id="file-upload" name="file-upload" type="file" accept=".csv" onChange={handleCsvImport} className="sr-only" disabled={importing} />
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
                  <div className="bg-purple-600 h-2 rounded-full transition-all duration-300" style={{ width: `${importProgress}%` }} />
                </div>
              </div>
            )}
            <div className="flex justify-end">
              <button onClick={() => setShowImportModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 mr-2">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : filteredItems.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No items found. Add a new item or import a CSV file.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <tr>
                  <th className="px-6 py-3 text-left"><input type="checkbox" checked={selectAll} onChange={handleSelectAllChange} className="rounded" /></th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Author</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-6 py-4 whitespace-nowrap"><input type="checkbox" checked={selectedItems.includes(item.id)} onChange={() => handleCheckboxChange(item.id)} className="rounded" /></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 cursor-pointer hover:bg-blue-50" onClick={() => startCellEdit(item.id, 'id', item.id)}>
                      {editingCell.id === item.id && editingCell.field === 'id' ? (
                        <input type="text" value={cellValue} onChange={(e) => setCellValue(e.target.value)} onBlur={saveCellEdit} onKeyPress={(e) => e.key === 'Enter' && saveCellEdit()} onKeyDown={(e) => e.key === 'Escape' && cancelCellEdit()} className="w-full p-1 border rounded" autoFocus />
                      ) : (<span className={accessMode ? "px-2 py-1 rounded hover:bg-yellow-100" : ""}>{item.id}</span>)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 cursor-pointer hover:bg-blue-50" onClick={() => startCellEdit(item.id, 'title', item.title)}>
                      {editingCell.id === item.id && editingCell.field === 'title' ? (
                        <input type="text" value={cellValue} onChange={(e) => setCellValue(e.target.value)} onBlur={saveCellEdit} onKeyPress={(e) => e.key === 'Enter' && saveCellEdit()} onKeyDown={(e) => e.key === 'Escape' && cancelCellEdit()} className="w-full p-1 border rounded" autoFocus />
                      ) : (<span className={accessMode ? "px-2 py-1 rounded hover:bg-yellow-100" : ""}>{item.title}</span>)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 cursor-pointer hover:bg-blue-50" onClick={() => startCellEdit(item.id, 'type', item.type)}>
                      {editingCell.id === item.id && editingCell.field === 'type' ? (
                        <select value={cellValue} onChange={(e) => setCellValue(e.target.value)} onBlur={saveCellEdit} className="w-full p-1 border rounded" autoFocus>
                          <option value="poem">Poem</option><option value="story">Story</option><option value="essay">Essay</option><option value="article">Article</option>
                        </select>
                      ) : (<span className={accessMode ? "px-2 py-1 rounded hover:bg-yellow-100" : ""}>{item.type}</span>)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 cursor-pointer hover:bg-blue-50" onClick={() => startCellEdit(item.id, 'author', item.author)}>
                      {editingCell.id === item.id && editingCell.field === 'author' ? (
                        <input type="text" value={cellValue} onChange={(e) => setCellValue(e.target.value)} onBlur={saveCellEdit} onKeyPress={(e) => e.key === 'Enter' && saveCellEdit()} onKeyDown={(e) => e.key === 'Escape' && cancelCellEdit()} className="w-full p-1 border rounded" autoFocus />
                      ) : (<span className={accessMode ? "px-2 py-1 rounded hover:bg-yellow-100" : ""}>{item.author}</span>)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button onClick={() => handleEdit(item)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                      <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900">Delete</button>
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