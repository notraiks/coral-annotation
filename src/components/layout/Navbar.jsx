import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const baseLink =
    'px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors';

  const activeClasses = 'bg-slate-800 text-emerald-400';
  const inactiveClasses = 'text-slate-300 hover:bg-slate-800 hover:text-emerald-300';

  return (
    <nav className="border-b border-slate-800 bg-slate-900/90 backdrop-blur ">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <Link to="/" className="text-sm sm:text-base font-semibold text-emerald-400">
          Coral Bleaching Annotation
        </Link>
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className={`${baseLink} ${isActive('/') ? activeClasses : inactiveClasses}`}
          >
            Login
          </Link>
          <Link
            to="/annotate"
            className={`${baseLink} ${
              isActive('/annotate') ? activeClasses : inactiveClasses
            }`}
          >
            Annotate
          </Link>
          <Link
            to="/admin"
            className={`${baseLink} ${
              isActive('/admin') ? activeClasses : inactiveClasses
            }`}
          >
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
