import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  ShoppingCart, 
  Users, 
  LogOut 
} from 'lucide-react';
import Logo from '../../assets/cromsen.png';

const AdminLayout = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={18} /> },
    { name: 'Products', path: '/admin/products', icon: <Package size={18} /> },
    { name: 'Categories', path: '/admin/categories', icon: <Tags size={18} /> },
    { name: 'Orders', path: '/admin/orders', icon: <ShoppingCart size={18} /> },
    { name: 'Users', path: '/admin/users', icon: <Users size={18} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-white flex flex-col shadow-xl z-20">
        <div className="p-6 flex flex-col items-center gap-2 border-b border-white/10">
          <img src={Logo} alt="Cromsen Admin" className="h-8 w-auto object-contain brightness-0 invert" />
          <span className="text-[9px] font-sans font-bold text-gray-400 uppercase tracking-widest leading-none">Admin</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/admin');
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive 
                    ? 'bg-action text-white shadow-md' 
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {item.icon}
                <span className="font-medium tracking-wide text-sm">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <Link 
            to="/"
            className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 text-gray-300 hover:bg-white/10 hover:text-white"
          >
            <LogOut size={18} />
            <span className="font-medium tracking-wide text-sm">Logout to Store</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 shrink-0 z-10 sticky top-0 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800">
            {navItems.find(item => location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/admin'))?.name || 'Dashboard'}
          </h2>
          <div className="flex items-center space-x-4">
             <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-gray-100">
               A
             </div>
          </div>
        </header>
        
        {/* Page Content */}
        <div className="p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
