import { useEffect, useState } from "react";
import axios from "axios";
import Pagination from "../pagination/Pagination"; // Make sure to import your Pagination component

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
  const itemsPerPage = 10; // You can adjust this as needed

  const [form, setForm] = useState({
    full_name: "",
    father_name: "",
    permanent_residence: "",
    current_residence: "",
    nic_number: "",
    document_pdf: null,
    photo: null,
  });
  const [showImage, setShowImage] = useState(false)
  const [imageUrl, setImageUrl] = useState("")

  /* ================= FETCH with Pagination ================= */
  const fetchAthletes = async (page = 1) => {
    setLoading(true);
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

      fetchAthletes(currentPage); // Refresh current page
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
      fetchAthletes(currentPage); // Refresh current page
    } catch {
      alert("Delete failed");
    }
  };

  /* ================= PAGINATION HANDLER ================= */
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  /* ================= CLIENT-SIDE PAGINATION FALLBACK ================= */
  // If your backend doesn't support pagination, use this:
  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return athletes.slice(startIndex, endIndex);
  };

  // Determine which data to display
  const displayAthletes = athletes.length > 0 && athletes[0].id ? 
    getPaginatedData() : athletes;

  /* ================= UI ================= */
  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-bold">Athlete Management</h1>
        <button
          onClick={() => setOpen(true)}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          + Add Athlete
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">photo</th>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Father</th>
              <th className="p-2 border">NIC</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center p-4">
                  Loading...
                </td>
              </tr>
            ) : displayAthletes.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center p-4">
                  No data found
                </td>
              </tr>
            ) : (
              displayAthletes.map((a) => (
                <tr key={a.id}>
                  <td className="p-2 border">
                    <div className="w-16 h-16 mx-auto">
                      <img onClick={() => {
                        setImageUrl(`${BASE_URL}/uploads/photos/${a.photo}`)
                        setShowImage(!showImage)
                      }}
                        src={`${BASE_URL}/uploads/photos/${a.photo}`}
                        alt={a.full_name}
                        className="w-full h-full object-cover rounded border"
                      />
                    </div>
                  </td>
                  <td className="p-2 border">{a.full_name}</td>
                  <td className="p-2 border">{a.father_name}</td>
                  <td className="p-2 border">{a.nic_number}</td>
                  <td className="p-2 border space-x-2">
                    <button
                      onClick={() => handleEdit(a)}
                      className="bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION - Only show if there are multiple pages */}
     
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white w-full max-w-lg p-6 rounded">
            <h2 className="text-lg font-semibold mb-4">
              {editingId ? "Edit Athlete" : "Add Athlete"}
            </h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
              {[
                ["full_name", "Full Name"],
                ["father_name", "Father Name"],
                ["permanent_residence", "Permanent Residence"],
                ["current_residence", "Current Residence"],
                ["nic_number", "NIC Number"],
              ].map(([name, label]) => (
                <input
                  key={name}
                  name={name}
                  placeholder={label}
                  value={form[name]}
                  onChange={handleChange}
                  className="border p-2 rounded col-span-2"
                  required
                />
              ))}

              <input
                type="file"
                name="document_pdf"
                accept="application/pdf"
                onChange={handleFileChange}
                className="border p-2 rounded col-span-2"
              />

              <input
                type="file"
                name="photo"
                accept="image/*"
                onChange={handleFileChange}
                className="border p-2 rounded col-span-2"
              />

              <div className="col-span-2 flex justify-end gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-gray-400 text-white rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded"
                >
                  Save
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