// import Customer from "./pages/ServiceManger";
import Dashboard from "./pages/dashboard";
// import S_Transaction from "./pages/RentManager";
import Report from "./pages/reports";
import AddUser from "./pages/AddUser";
import Athletes from "./pages/athletes";
import Fees from "./pages/Fees";
const MainContent = ({ activeComponent }) => {
  const renderContent = () => {
    switch (activeComponent) {
      case "dashboard":
        return <Dashboard />;
      case "Athletes":
        return <Athletes />; 
      case "Fees":
        return <Fees />;
      case "AddUser":
        return <AddUser />;

      default:
        return <Dashboard />;
    }
  };

  return <div className="min-h-[90vh]">{renderContent()}</div>;
};

export default MainContent;
