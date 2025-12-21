import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Pagination from "../pagination/Pagination";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const ActiveAthletes = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showImage, setShowImage] = useState(false)
  const [imageUrl, setImageUrl] = useState("")

  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchActiveAthletes = useCallback(
    async (page = currentPage) => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${BASE_URL}/fees/active?page=${page}&limit=${limit}`
        );

        setFees(res.data.data);
        console.log(res.data.data);

        setCurrentPage(res.data.currentPage);
        setTotalPages(res.data.totalPages);
      } catch (error) {
        console.error("Error fetching active athletes:", error);
      } finally {
        setLoading(false);
      }
    },
    [currentPage]
  );

  useEffect(() => {
    fetchActiveAthletes(currentPage);
  }, [currentPage, fetchActiveAthletes]);

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
        <>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 border">#</th>
                  <th className="p-3 border">photo</th>
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
                      {(currentPage - 1) * limit + index + 1}
                    </td>
                    <td className="p-2 border">
                      <div className="w-16 h-16 mx-auto">
                        <img onClick={() => {
                          setImageUrl(`${BASE_URL}/uploads/photos/${a.photo}`)
                          setShowImage(!showImage)
                        }}
                          src={`${BASE_URL}/uploads/photos/${fee.athlete.photo}`}
                          alt={fee.athlete.full_name}
                          className="w-full h-full object-cover rounded border"
                        />
                      </div>
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

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </>
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
};

export default ActiveAthletes;
