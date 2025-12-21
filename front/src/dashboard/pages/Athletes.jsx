import { useEffect, useState } from "react";
import axios from "axios";
import Pagination from "../pagination/Pagination";
import SearchBar from "../searching/athleteSearchBar"; // Import the SearchBar component

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function Athletes() {
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAthletes, setTotalAthletes] = useState(0);
  const [searchMode, setSearchMode] = useState(false); // Track if we're in search mode
  const itemsPerPage = 10;

  const [form, setForm] = useState({
    full_name: "",
    father_name: "",
    permanent_residence: "",
    current_residence: "",
    nic_number: "",
    document_pdf: null,
    photo: null,
  });
  const [showImage, setShowImage] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [searchError, setSearchError] = useState("");

  /* ================= FETCH with Pagination ================= */
  const fetchAthletes = async (page = 1) => {
    setLoading(true);
    setSearchMode(false); // Exit search mode when fetching all athletes
    try {
      const res = await axios.get(`${BASE_URL}/athletes`, {
        params: {
          page: page,
          limit: itemsPerPage
        }
      });
      if (res.data.data) {
        setAthletes(res.data.data);
        setTotalAthletes(res.data.totalItems);
        setTotalPages(res.data.totalPages);
        setCurrentPage(res.data.currentPage);
      } else {
        // If backend doesn't support pagination, handle client-side pagination
        setAthletes(res.data);
        setTotalAthletes(res.data.length);
        setTotalPages(Math.ceil(res.data.length / itemsPerPage));
      }
    } catch (err) {
      alert("Failed to load athletes");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAthletes(currentPage);
  }, [currentPage]);

  /* ================= SEARCH HANDLERS ================= */
  const handleSearchResults = (results) => {
    setSearchMode(true); // Enter search mode
    setAthletes(results);
    setTotalAthletes(results.length);
    setTotalPages(1); // Reset pagination in search mode
    setCurrentPage(1);
    setSearchError("");
  };

  const handleSearchError = (error) => {
    setSearchError(error);
  };

  const handleClearSearch = () => {
    setSearchMode(false);
    fetchAthletes(1); // Reset to first page of all athletes
  };

  /* ================= FORM ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setForm({ ...form, [name]: files[0] });
  };

  const resetForm = () => {
    setForm({
      full_name: "",
      father_name: "",
      permanent_residence: "",
      current_residence: "",
      nic_number: "",
      document_pdf: null,
      photo: null,
    });
    setEditingId(null);
  };

  /* ================= CREATE / UPDATE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("full_name", form.full_name);
    formData.append("father_name", form.father_name);
    formData.append("permanent_residence", form.permanent_residence);
    formData.append("current_residence", form.current_residence);
    formData.append("nic_number", form.nic_number);

    if (form.document_pdf) {
      formData.append("document_pdf", form.document_pdf);
    }

    if (form.photo) {
      formData.append("photo", form.photo);
    }

    try {
      if (editingId) {
        await axios.put(`${BASE_URL}/athletes/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axios.post(`${BASE_URL}/athletes`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      // Refresh data after operation
      if (searchMode) {
        // If in search mode, refresh the search results
        fetchAthletes(currentPage);
      } else {
        fetchAthletes(currentPage);
      }
      
      setOpen(false);
      resetForm();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  /* ================= EDIT ================= */
  const handleEdit = (athlete) => {
    setForm(athlete);
    setEditingId(athlete.id);
    setOpen(true);
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this athlete?")) return;

    try {
      await axios.delete(`${BASE_URL}/athletes/${id}`);
      // Refresh data after deletion
      if (searchMode) {
        fetchAthletes(1);
      } else {
        fetchAthletes(currentPage);
      }
    } catch {
      alert("Delete failed");
    }
  };

  /* ================= PAGINATION HANDLER ================= */
  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (!searchMode) {
      fetchAthletes(page);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Athlete Management</h1>
        <div className="flex items-center gap-4">
          <SearchBar
            onSearchResults={handleSearchResults}
            onSearchError={handleSearchError}
            placeholder="Search athletes by name, father name, or NIC..."
          />
          <button
            onClick={() => setOpen(true)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
          >
            + Add Athlete
          </button>
        </div>
      </div>

      {/* Search status */}
      {searchMode && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-blue-600 font-medium">
              Search Results: {athletes.length} athlete(s) found
            </span>
          </div>
          <button
            onClick={handleClearSearch}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear Search & Show All
          </button>
        </div>
      )}

      {searchError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {searchError}
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-right border-b font-semibold text-gray-700">Photo</th>
              <th className="p-3 text-right border-b font-semibold text-gray-700">Full Name</th>
              <th className="p-3 text-right border-b font-semibold text-gray-700">Father Name</th>
              <th className="p-3 text-right border-b font-semibold text-gray-700">NIC Number</th>
              <th className="p-3 text-right border-b font-semibold text-gray-700">Current Residence</th>
              <th className="p-3 text-right border-b font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center p-8">
                  <div className="flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                    <span className="text-gray-500">Loading athletes...</span>
                  </div>
                </td>
              </tr>
            ) : athletes.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center p-8">
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-gray-400 text-lg mb-2">No athletes found</span>
                    {searchMode ? (
                      <span className="text-gray-500">Try a different search term</span>
                    ) : (
                      <span className="text-gray-500">Add your first athlete using the "Add Athlete" button</span>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              athletes.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3 border-b">
                    <div className="w-16 h-16 mx-auto cursor-pointer" onClick={() => {
                      setImageUrl(`${BASE_URL}/uploads/photos/${a.photo}`);
                      setShowImage(true);
                    }}>
                      {a.photo ? (
                        <img
                          src={`${BASE_URL}/uploads/photos/${a.photo}`}
                          alt={a.full_name}
                          className="w-full h-full object-cover rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-border"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg border-2 border-gray-200">
                          <span className="text-gray-400 text-xs">No Image</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-3 border-b font-medium text-gray-800">{a.full_name}</td>
                  <td className="p-3 border-b text-gray-600">{a.father_name}</td>
                  <td className="p-3 border-b text-gray-600 font-mono">{a.nic_number}</td>
                  <td className="p-3 border-b text-gray-600 text-sm max-w-xs truncate">{a.current_residence}</td>
                  <td className="p-3 border-b">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleEdit(a)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION - Only show if not in search mode or if search results are paginated */}
      {!searchMode && totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Results count */}
      <div className="mt-4 text-sm text-gray-500">
        {searchMode ? (
          <span>Showing {athletes.length} search result(s)</span>
        ) : (
          <span>Showing {athletes.length} of {totalAthletes} athlete(s)</span>
        )}
      </div>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg p-6 rounded-lg shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                {editingId ? "Edit Athlete" : "Add Athlete"}
              </h2>
              <button
                onClick={() => {
                  setOpen(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                ["full_name", "Full Name"],
                ["father_name", "Father Name"],
                ["permanent_residence", "Permanent Residence"],
                ["current_residence", "Current Residence"],
                ["nic_number", "NIC Number"],
              ].map(([name, label]) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    name={name}
                    placeholder={`Enter ${label.toLowerCase()}`}
                    value={form[name]}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Document PDF</label>
                <input
                  type="file"
                  name="document_pdf"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="w-full border border-gray-300 rounded-lg p-2.5 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                <input
                  type="file"
                  name="photo"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full border border-gray-300 rounded-lg p-2.5 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                >
                  {editingId ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* IMAGE MODAL */}
      {showImage && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
          <div
            className="absolute inset-0"
            onClick={() => setShowImage(false)}
          />
          
          <div
            className="relative z-10 bg-white rounded-lg shadow-xl 
                 w-[420px] h-[360px] 
                 flex items-center justify-center"
          >
            <img
              src={imageUrl}
              alt="Preview"
              className="max-w-full max-h-full object-contain"
            />

            <button
              onClick={() => setShowImage(false)}
              className="absolute -top-3 -right-3 bg-red-600 text-white 
                   w-8 h-8 rounded-full flex items-center justify-center shadow"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}