import { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;


export default function Athletes() {
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    full_name: "",
    father_name: "",
    permanent_residence: "",
    current_residence: "",
    nic_number: "",
    document_pdf: "",
    photo: "",
  });

  /* ================= FETCH ================= */
  const fetchAthletes = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/athletes`);
      setAthletes(res.data);
    } catch (err) {
      alert("Failed to load athletes");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAthletes();
  }, []);

  /* ================= FORM ================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      full_name: "",
      father_name: "",
      permanent_residence: "",
      current_residence: "",
      nic_number: "",
      document_pdf: "",
      photo: "",
    });
    setEditingId(null);
  };

  /* ================= CREATE / UPDATE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await axios.put(`${BASE_URL}/athletes/${editingId}`, form);
      } else {
        await axios.post(`${BASE_URL}/athletes`, form);
      }

      fetchAthletes();
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
      fetchAthletes();
    } catch {
      alert("Delete failed");
    }
  };

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
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Father</th>
              <th className="p-2 border">NIC</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="text-center p-4">
                  Loading...
                </td>
              </tr>
            ) : athletes.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center p-4">
                  No data found
                </td>
              </tr>
            ) : (
              athletes.map((a) => (
                <tr key={a.id}>
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
                ["document_pdf", "Document PDF URL"],
                ["photo", "Photo URL"],
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
    </div>
  );
}
