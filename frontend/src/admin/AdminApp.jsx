import { Routes, Route, Navigate } from 'react-router-dom';
import { isLoggedIn } from './utils/api.js';
import Login from './pages/Login.jsx';
import ManualList from './pages/ManualList.jsx';
import ManualEditor from './pages/ManualEditor.jsx';
import CategoryManager from './pages/CategoryManager.jsx';
import './admin.css';

function PrivateRoute({ children }) {
  return isLoggedIn() ? children : <Navigate to="/admin/login" replace />;
}

export default function AdminApp() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="manualy" element={<PrivateRoute><ManualList /></PrivateRoute>} />
      <Route path="manualy/novy" element={<PrivateRoute><ManualEditor /></PrivateRoute>} />
      <Route path="manualy/:id" element={<PrivateRoute><ManualEditor /></PrivateRoute>} />
      <Route path="kategorie" element={<PrivateRoute><CategoryManager /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/admin/manualy" replace />} />
    </Routes>
  );
}
