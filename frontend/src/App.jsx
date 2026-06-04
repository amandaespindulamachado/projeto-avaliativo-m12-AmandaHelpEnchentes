import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Abrigos from './pages/Abrigos';
import AbrigoDetalhe from './pages/AbrigoDetalhe';
import Doacoes from './pages/Doacoes';
import Voluntarios from './pages/Voluntarios';
import Desaparecidos from './pages/Desaparecidos';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="abrigos" element={<Abrigos />} />
            <Route path="abrigos/:id" element={<AbrigoDetalhe />} />
            <Route path="doacoes" element={<Doacoes />} />
            <Route path="voluntarios" element={<Voluntarios />} />
            <Route path="desaparecidos" element={<Desaparecidos />} />
            <Route path="dashboard" element={<Dashboard />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
