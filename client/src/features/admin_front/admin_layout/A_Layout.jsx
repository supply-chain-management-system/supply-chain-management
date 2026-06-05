import { Outlet } from 'react-router-dom';
import AdminNavbar from '../admin_pages/Admin_Navbar';

const A_Layout = () => {
  return (
    <>
      <AdminNavbar />
      <div className="ml-64 min-h-screen bg-[#F8FAFC]">
        <Outlet />
      </div>
    </>
  );
};

export default A_Layout;