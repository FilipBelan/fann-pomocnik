import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Category from './pages/Category.jsx';
import Wizard from './pages/Wizard.jsx';
import Result from './pages/Result.jsx';
import AdminApp from './admin/AdminApp.jsx';
import Sidebar from './components/Sidebar.jsx';

function PublicLayout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/kategoria/:catId" element={<Category />} />
          <Route path="/manual/:manualId" element={<Wizard />} />
          <Route path="/manual/:manualId/vysledok" element={<Result />} />
        </Route>
        <Route path="/admin/*" element={<AdminApp />} />
      </Routes>
    </BrowserRouter>
  );
}
