import { useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import './App.css'

// Pages
import Layout from './components/layout/Layout.jsx';
import LoginPage from './pages/Login/LoginPage.jsx';
import AnnotatePage from './pages/Annotate/AnnotatePage.jsx';
// import AdminPage from './pages/Admin/AdminPage.jsx';
// import NotFound from './pages/NotFound/NotFound.jsx';

function AppRoutes() {
  const location = useLocation();
  const isAnnotationPage = location.pathname === '/annotate';

  if (isAnnotationPage) {
    return (
      <div className="h-full w-full bg-slate-900 text-slate-100">
        <Routes>
          <Route path="/annotate" element={<AnnotatePage />} />
          {/* You can still add a fallback if you want: */}
          {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
      </div>
    );
  }

  // All other pages WITH Layout / Navbar
  return (
    <div className="h-full w-full bg-slate-900 text-slate-100">
      <Layout>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          {/* <Route path="/admin" element={<AdminPage />} /> */}
          {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
      </Layout>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;

