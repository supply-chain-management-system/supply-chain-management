import { Outlet, NavLink } from 'react-router-dom';
import Ware_Navbar from './ware_navbar';
const Ware_Layout=()=>{

    return(<>
     <Ware_Navbar/>
     <Outlet /> 
    </>)
}

export default Ware_Layout