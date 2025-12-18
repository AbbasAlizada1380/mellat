import React, { useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const FeesReport = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFees = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        `${BASE_URL}/fees/range`,
        {
          params: { startDate, endDate },
        }
      );
      setFees(response.data);
    } catch (error) {
      console.error("Error fetching fees:", error);
      alert("Error fetching fees");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (fees.length === 0) return alert("No data to download");

    const doc = new jsPDF();
    doc.text("Fees Report", 14, 16);

    const tableColumn = [
      "نمیر",
      "Athlete",
      "NIC",
      "Start Date",
      "End Date",
      "Total",
      "Received",
      "Remained",
    ];

    const tableRows = fees.map((fee) => [
      fee.id,
      fee.athlete?.full_name,
      fee.athlete?.nic_number,
      fee.startDate,
      fee.endDate,
      fee.total,
      fee.received,
      fee.remained,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save(`fees_report_${startDate}_to_${endDate}.pdf`);
  };


  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Fees Report</h1>

      <div className="flex gap-4 mb-4">
        <div>
          <label className="block mb-1">Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1">End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border px-3 py-2 rounded"
          />
        </div>

        <button
          onClick={fetchFees}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Loading..." : "Fetch"}
        </button>

        <button
          onClick={downloadPDF}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Download PDF
        </button>
      </div>

      {fees.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-3 py-2">ID</th>
                <th className="border px-3 py-2">Athlete</th>
                <th className="border px-3 py-2">NIC</th>
                <th className="border px-3 py-2">Start Date</th>
                <th className="border px-3 py-2">End Date</th>
                <th className="border px-3 py-2">Total</th>
                <th className="border px-3 py-2">Received</th>
                <th className="border px-3 py-2">Remained</th>
              </tr>
            </thead>
            <tbody>
              {fees.map((fee) => (
                <tr key={fee.id}>
                  <td className="border px-3 py-2">{fee.id}</td>
                  <td className="border px-3 py-2">{fee.athlete?.full_name}</td>
                  <td className="border px-3 py-2">{fee.athlete?.nic_number}</td>
                  <td className="border px-3 py-2">{fee.startDate}</td>
                  <td className="border px-3 py-2">{fee.endDate}</td>
                  <td className="border px-3 py-2">{fee.total}</td>
                  <td className="border px-3 py-2">{fee.received}</td>
                  <td className="border px-3 py-2">{fee.remained}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FeesReport;
