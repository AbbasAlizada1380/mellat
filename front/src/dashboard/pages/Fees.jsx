import { useEffect, useState, useCallback } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function Fees() {
  const [fees, setFees] = useState([]);
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    startDate: "",
    endDate: "",
    total: "",
    received: "",
    athleteId: "",
  });

  /* ================= FETCH ================= */
  const fetchFees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/fees/`);
      // Ensure each fee has a calculated 'remained' field
      const feesWithRemaining = res.data.map(fee => ({
        ...fee,
        remained: fee.total - (fee.received || 0)
      }));
      setFees(feesWithRemaining);
    } catch (err) {
      alert("Failed to load fees: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, []);

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
    fetchFees();
    // REMOVED fetchAthletes() from here to prevent unnecessary calls
  }, [fetchFees]);

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
    } catch (err) {
      alert("Delete failed: " + (err.response?.data?.message || err.message));
    }
  };

  /* ================= UI ================= */
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Fee Management</h1>
        <button
          onClick={handleOpenModal}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          + Add Fee
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Athlete</th>
              <th className="p-2 border">Period</th>
              <th className="p-2 border">Total</th>
              <th className="p-2 border">Received</th>
              <th className="p-2 border">Remained</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center p-4">
                  Loading...
                </td>
              </tr>
            ) : fees.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center p-4">
                  No fees found
                </td>
              </tr>
            ) : (
              fees.map((f) => (
                <tr key={f.id}>
                  <td className="p-2 border">
                    {f.athlete?.full_name || "Unknown"}
                  </td>
                  <td className="p-2 border">
                    {f.startDate} → {f.endDate}
                  </td>
                  <td className="p-2 border">{f.total}</td>
                  <td className="p-2 border">{f.received}</td>
                  <td className="p-2 border font-semibold">
                    <span className={f.remained > 0 ? "text-red-600" : "text-green-600"}>
                      {f.remained}
                    </span>
                  </td>
                  <td className="p-2 border space-x-2">
                    <button
                      onClick={() => handleEdit(f)}
                      className="bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(f.id)}
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
          <div className="bg-white w-full max-w-md p-6 rounded">
            <h2 className="text-lg font-semibold mb-4">
              {editingId ? "Edit Fee" : "Add Fee"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <select
                name="athleteId"
                value={form.athleteId}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              >
                <option value="">Select Athlete</option>
                {athletes.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.full_name} ({a.nic_number})
                  </option>
                ))}
              </select>

              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />

              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />

              <input
                type="number"
                name="total"
                placeholder="Total Amount"
                value={form.total}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
                min="0"
              />

              <input
                type="number"
                name="received"
                placeholder="Received Amount"
                value={form.received}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                min="0"
              />

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
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