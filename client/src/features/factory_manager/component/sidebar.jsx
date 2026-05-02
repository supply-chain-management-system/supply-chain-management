import { NavLink } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="h-screen w-64 bg-white border-r shadow-sm flex flex-col">
      
     
      <div className="p-4 text-xl font-bold border-b">
        NexusGrid
        <p className="text-xs font-normal text-gray-500">Factory Module</p>
      </div>


      <div className="flex-1 p-4 space-y-6 overflow-y-auto">

        <div>
          <p className="text-xs text-gray-400 uppercase">Overview</p>
          <NavLink
            to="/dashboard"
            className="block mt-2 px-3 py-2 rounded-lg bg-blue-100 text-blue-600"
          >
            Dashboard
          </NavLink>
        </div>

      
        <div>
          <p className="text-xs text-gray-400 uppercase">Production</p>

          <NavLink className="block mt-2 px-3 py-2 rounded-lg hover:bg-gray-100">
            Production
          </NavLink>
          <NavLink className="block mt-2 px-3 py-2 rounded-lg hover:bg-gray-100">
            Teams
          </NavLink>
          <NavLink className="block mt-2 px-3 py-2 rounded-lg hover:bg-gray-100">
            Machines
          </NavLink>
        </div>


        <div>
          <p className="text-xs text-gray-400 uppercase">Supply</p>

          <NavLink className="block mt-2 px-3 py-2 rounded-lg hover:bg-gray-100">
            Materials
            <span className="ml-2 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
              3
            </span>
          </NavLink>

          <NavLink className="block mt-2 px-3 py-2 rounded-lg hover:bg-gray-100">
            Requests
          </NavLink>

          <NavLink className="block mt-2 px-3 py-2 rounded-lg hover:bg-gray-100">
            Output Logs
          </NavLink>
        </div>

   
        <div>
          <p className="text-xs text-gray-400 uppercase">System</p>

          <NavLink className="block mt-2 px-3 py-2 rounded-lg hover:bg-gray-100">
            Settings
          </NavLink>
        </div>
      </div>

   
      <div className="p-4 border-t flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 text-white flex items-center justify-center rounded-full">
          RK
        </div>
        <div>
          <p className="text-sm font-medium">Rajan Kumar</p>
          <p className="text-xs text-gray-500">Factory Manager</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;