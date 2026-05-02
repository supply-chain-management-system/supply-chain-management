import { Bell } from "lucide-react";

const Navbar = () => {
  return (
    <div className="h-14 bg-white border-b flex items-center justify-between px-6">
      
 
      <div>
        <h1 className="font-semibold">Factory Overview</h1>
        <p className="text-xs text-gray-500">
          NexusGrid / Factory Manager / Dashboard
        </p>
      </div>


      <div className="flex items-center gap-4">
        
      
        <div className="relative">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </div>

    
        <div className="w-8 h-8 bg-blue-600 text-white flex items-center justify-center rounded-full">
          RK
        </div>
      </div>
    </div>
  );
};

export default Navbar;