import { Outlet, NavLink } from 'react-router-dom';

const BusinessManagerLayout = () => {
  const navItems = [
    { name: 'Dashboard', path: '/business-manager/dashboard' },
    { name: 'Factory', path: '/business-manager/factory' },
    { name: 'Warehouse', path: '/business-manager/warehouse' },
    { name: 'Logistics', path: '/business-manager/logistics' },
    { name: 'Suppliers', path: '/business-manager/suppliers' },
  ];

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-2xl font-bold text-blue-400">NexusGrid</h2>
          <p className="text-sm text-slate-400 mt-1">Business Manager</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>


      <main className="flex-1 overflow-y-auto p-8">
        <Outlet /> 
      </main>
    </div>
  );
};

export default BusinessManagerLayout;