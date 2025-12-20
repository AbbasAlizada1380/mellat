// import Customer from "./pages/ServiceManger";
import Dashboard from "./pages/dashboard";
// import S_Transaction from "./pages/RentManager";
import Report from "./pages/reports";
import AddUser from "./pages/AddUser";
import Athletes from "./pages/Athletes";
import Fees from "./pages/Fees";
import ActiveAthletes from "./pages/ActiceAthlete";
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
       case "ActiveAthletes":
        return <ActiveAthletes />;

      default:
        return <Dashboard />;
    }
  };

  return <div className="min-h-[90vh]">{renderContent()}</div>;
};

export default MainContent;
