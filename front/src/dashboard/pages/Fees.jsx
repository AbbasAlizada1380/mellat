import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Pagination from "../pagination/Pagination";
import FeesSearchBar from "../searching/feeSearchBar"; // Import the search bar

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function Fees() {
  const [fees, setFees] = useState([]);
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [searchMeta, setSearchMeta] = useState(null);
  const limit = 10;

  const [form, setForm] = useState({
    startDate: "",
    endDate: "",
    total: "",
    received: "",
    athleteId: "",
  });

  /* ================= FETCH FEES ================= */
  const fetchFees = useCallback(
    async (page = currentPage, searchData = null) => {
      setLoading(true);
      try {
        let res;
        
        if (searchData) {
          // If we have search results from search bar, use them directly
          setFees(searchData.fees);
          setCurrentPage(searchData.meta?.currentPage || 1);
          setTotalPages(searchData.meta?.totalPages || 1);
          setTotalItems(searchData.meta?.totalItems || 0);
          setSearchMeta(searchData.meta);
        } else {
          // Normal fetch from API with pagination
          res = await axios.get(
            `${BASE_URL}/fees?page=${page}&limit=${limit}`
          );

          setFees(res.data.data);
          setCurrentPage(res.data.currentPage);
          setTotalPages(res.data.totalPages);
          setTotalItems(res.data.totalItems);
          setSearchMeta(null); // Clear search meta when fetching all
        }
      } catch (err) {
        alert(
          "Failed to load fees: " +
          (err.response?.data?.message || err.message)
        );
      } finally {
        setLoading(false);
      }
    },
    [currentPage]
  );

  /* ================= SEARCH HANDLERS ================= */
  const handleSearchResults = (searchResults, meta = null) => {
    if (searchResults.length === 0 && meta?.totalItems === 0) {
      // No results found in search
      setFees([]);
      setTotalItems(0);
      setTotalPages(0);
      setIsSearching(true);
      setSearchMeta(meta);
    } else if (searchResults.length > 0) {
      // Search results found
      setFees(searchResults);
      setTotalItems(meta?.totalItems || searchResults.length);
      setTotalPages(meta?.totalPages || 1);
      setIsSearching(true);
      setSearchMeta(meta);
    } else {
      // Empty search - reset to show all fees
      setIsSearching(false);
      fetchFees(1);
    }
  };

  const handleSearchError = (errorMessage) => {
    alert("Search error: " + errorMessage);
    setIsSearching(false);
    // Reset to show all fees on error
    fetchFees(1);
  };

  const handleClearSearch = () => {
    setIsSearching(false);
    setSearchMeta(null);
    fetchFees(1); // Reset to page 1
  };

  // Fetch athletes ONLY when the modal is about to open
  const fetchAthletesForModal = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/athletes`);
      setAthletes(res.data);
    } catch (err) {
      alert("Failed to load athletes: " + (err.response?.data?.message || err.message));
    }
  }, []);

  useEffect(() => {
    if (!isSearching) {
      fetchFees(currentPage);
    }
  }, [currentPage, isSearching]);

  /* ================= FORM ================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      startDate: "",
      endDate: "",
      total: "",
      received: "",
      athleteId: "",
    });
    setEditingId(null);
  };

  /* ================= MODAL ================= */
  const handleOpenModal = () => {
    fetchAthletesForModal(); // Fetch athletes only when needed
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
    resetForm();
  };

  /* ================= CREATE / UPDATE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await axios.put(`${BASE_URL}/fees/${editingId}`, form);
      } else {
        await axios.post(`${BASE_URL}/fees`, form);
      }

      // Refresh the fees list after successful operation
      await fetchFees();
      handleCloseModal();
      setIsSearching(false); // Exit search mode after edit/add
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  /* ================= EDIT ================= */
  const handleEdit = (fee) => {
    setForm({
      startDate: fee.startDate,
      endDate: fee.endDate,
      total: fee.total,
      received: fee.received,
      athleteId: fee.athleteId,
    });
    setEditingId(fee.id);
    handleOpenModal(); // This will also fetch fresh athlete data
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this fee?")) return;

    try {
      await axios.delete(`${BASE_URL}/fees/${id}`);
      // Refresh the list after deletion
      await fetchFees();
      setIsSearching(false); // Exit search mode after delete
    } catch (err) {
      alert("Delete failed: " + (err.response?.data?.message || err.message));
    }
  };

  /* ================= UI ================= */
  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <h1 className="text-xl font-bold">Fee Management</h1>
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
          {/* Search Bar */}
          <div className="w-full md:w-96">
            <FeesSearchBar
              onSearchResults={handleSearchResults}
              onSearchError={handleSearchError}
              placeholder="Search fees by athlete name, father, or NIC..."
            />
          </div>
          
          {/* Add Fee Button */}
          <button
            onClick={handleOpenModal}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded whitespace-nowrap"
          >
            + Add Fee
          </button>
        </div>
      </div>

      {/* Search Status Banner */}
      {isSearching && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-blue-600 font-medium">
              Showing search results
              {searchMeta?.searchQuery && ` for "${searchMeta.searchQuery}"`}
              {searchMeta?.matchingAthletesCount && ` (${searchMeta.matchingAthletesCount} athletes)`}
            </span>
            <span className="text-blue-500 text-sm">
              • {totalItems} fee{totalItems !== 1 ? 's' : ''} found
            </span>
          </div>
          <button
            onClick={handleClearSearch}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 hover:bg-blue-100 rounded"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 border-b text-left font-medium text-gray-700">Athlete</th>
              <th className="p-3 border-b text-left font-medium text-gray-700">NIC</th>
              <th className="p-3 border-b text-left font-medium text-gray-700">Period</th>
              <th className="p-3 border-b text-left font-medium text-gray-700">Total</th>
              <th className="p-3 border-b text-left font-medium text-gray-700">Received</th>
              <th className="p-3 border-b text-left font-medium text-gray-700">Remained</th>
              <th className="p-3 border-b text-left font-medium text-gray-700">Status</th>
              <th className="p-3 border-b text-left font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center p-6">
                  <div className="flex justify-center items-center gap-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-200 border-t-blue-600"></div>
                    <span className="text-gray-600">Loading fees...</span>
                  </div>
                </td>
              </tr>
            ) : fees.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center p-6">
                  <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
                    {isSearching ? (
                      <>
                        <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <p className="font-medium">No fees found matching your search</p>
                        <p className="text-sm">Try a different search term</p>
                      </>
                    ) : (
                      <>
                        <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                        </svg>
                        <p className="font-medium">No fees found</p>
                        <p className="text-sm">Start by adding your first fee</p>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              fees.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3 border-b">
                    <div className="flex items-center gap-2">
                      {f.athlete?.photo && (
                        <img 
                          src={`${BASE_URL}/uploads/${f.athlete.photo}`} 
                          alt={f.athlete?.full_name} 
                          className="w-8 h-8 rounded-full object-cover border"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{f.athlete?.full_name || "Unknown"}</div>
                        <div className="text-xs text-gray-500">{f.athlete?.father_name || ""}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 border-b text-gray-600 font-mono text-sm">
                    {f.athlete?.nic_number || "N/A"}
                  </td>
                  <td className="p-3 border-b">
                    <div className="flex flex-col">
                      <span className="text-gray-700">{f.startDate}</span>
                      <span className="text-gray-400 text-xs">to</span>
                      <span className="text-gray-700">{f.endDate}</span>
                    </div>
                  </td>
                  <td className="p-3 border-b font-medium text-gray-900">
                    Rs. {parseFloat(f.total).toLocaleString()}
                  </td>
                  <td className="p-3 border-b text-green-600 font-medium">
                    Rs. {parseFloat(f.received || 0).toLocaleString()}
                  </td>
                  <td className="p-3 border-b">
                    <span className={`font-semibold ${f.remained > 0 ? "text-red-600" : "text-green-600"}`}>
                      Rs. {parseFloat(f.remained || 0).toLocaleString()}
                    </span>
                  </td>
                  <td className="p-3 border-b">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      f.remained === 0 
                        ? "bg-green-100 text-green-800" 
                        : f.remained === f.total
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {f.remained === 0 ? "Paid" : f.remained === f.total ? "Unpaid" : "Partial"}
                    </span>
                  </td>
                  <td className="p-3 border-b">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(f)}
                        className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm font-medium rounded border border-blue-200 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(f.id)}
                        className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded border border-red-200 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {/* Pagination - Only show if we have multiple pages */}
        {totalPages > 1 && (
          <div className="p-4 border-t">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                if (isSearching) {
                  // If searching, fetch search results for the new page
                  fetchFees(page, { fees: [], meta: { ...searchMeta, currentPage: page } });
                } else {
                  // Normal pagination
                  setCurrentPage(page);
                }
              }}
            />
            
            {/* Show page info */}
            <div className="text-center text-sm text-gray-500 mt-2">
              Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, totalItems)} of {totalItems} fees
            </div>
          </div>
        )}
      </div>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-lg shadow-xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingId ? "Edit Fee" : "Add Fee"}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Athlete *
                  </label>
                  <select
                    name="athleteId"
                    value={form.athleteId}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  >
                    <option value="">Select Athlete</option>
                    {athletes.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.full_name} ({a.nic_number})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={form.startDate}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date *
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={form.endDate}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Amount (PKR) *
                  </label>
                  <input
                    type="number"
                    name="total"
                    placeholder="0.00"
                    value={form.total}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Received Amount (PKR)
                  </label>
                  <input
                    type="number"
                    name="received"
                    placeholder="0.00"
                    value={form.received}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    min="0"
                    step="0.01"
                  />
                </div>

                {form.total && form.received && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Remaining:</span>
                      <span className={`font-semibold ${form.total - form.received > 0 ? "text-red-600" : "text-green-600"}`}>
                        Rs. {(form.total - form.received).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    {editingId ? "Update Fee" : "Create Fee"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}