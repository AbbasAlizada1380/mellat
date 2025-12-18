import React from "react";
import FeesReport from "./FeesReport";

const Dashboard = () => {
  const BRAND_NAME=import.meta.env.VITE_BRAND_NAME;
  return (
    <div className=" p-6 bg-gray-50 min-h-screen text-right" dir="rtl">
      {/* Main Dashboard Title */}
      <h1 className=" text-center text-2xl lg:text-3xl font-bold text-gray-800 mb-6">
     {BRAND_NAME}
      </h1>

      {/* Render the FinancialReports component */}
      <div className="mt-6">
        <FeesReport/>
      </div>
    </div>
  );
};

export default Dashboard;
