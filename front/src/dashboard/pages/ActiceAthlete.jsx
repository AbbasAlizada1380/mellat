import { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const ActiveAthletes = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActiveAthletes = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/fees/active`);
      setFees(res.data);
    } catch (error) {
      console.error("Error fetching active athletes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveAthletes();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading active athletes...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <h2 className="text-2xl font-semibold mb-6 text-center">
        Active Athletes
      </h2>

      {fees.length === 0 ? (
        <p className="text-center text-gray-500">
          No active athletes today.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 border">#</th>
                <th className="p-3 border">Name</th>
                <th className="p-3 border">NIC</th>
                <th className="p-3 border">Start Date</th>
                <th className="p-3 border">End Date</th>
                <th className="p-3 border">Total</th>
                <th className="p-3 border">Received</th>
                <th className="p-3 border">Remaining</th>
              </tr>
            </thead>
            <tbody>
              {fees.map((fee, index) => (
                <tr key={fee.id} className="hover:bg-gray-50">
                  <td className="p-2 border text-center">
                    {index + 1}
                  </td>
                  <td className="p-2 border">
                    {fee.athlete?.full_name}
                  </td>
                  <td className="p-2 border">
                    {fee.athlete?.nic_number}
                  </td>
                  <td className="p-2 border text-center">
                    {fee.startDate}
                  </td>
                  <td className="p-2 border text-center">
                    {fee.endDate}
                  </td>
                  <td className="p-2 border text-center">
                    {fee.total}
                  </td>
                  <td className="p-2 border text-center text-green-600">
                    {fee.received}
                  </td>
                  <td className="p-2 border text-center text-red-600">
                    {fee.remained}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ActiveAthletes;
