import { Outlet, NavLink } from 'react-router-dom';
import AdminNavbar from '../admin_pages/Admin_Navbar';
const A_Layout=()=>{

    return(<>
     <AdminNavbar/>
     <Outlet /> 
    </>)
}

export default A_Layout