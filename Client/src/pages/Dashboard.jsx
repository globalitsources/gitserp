import UserNav from "../components/UserNav";
import Project from "../components/Project";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <UserNav />
      <div className="pt-24">
        <Project />
      </div>
    </div>
  );
};

export default Dashboard;
