

import DashboardLayout from "../layout/DashboardLayout";


const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="grid grid-cols-3 gap-4">
        
        <div className="bg-white p-4 rounded-lg shadow">
          Card 1
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          Card 2
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          Card 3
        </div>

      </div>
    </DashboardLayout>
  );
};

export default Dashboard;