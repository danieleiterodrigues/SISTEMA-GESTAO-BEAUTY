import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import Login from '../pages/Login';
import PrivateRoute from './PrivateRoute';
import { Toaster } from 'react-hot-toast';
import Clientes from '../pages/Clientes';
import ClientePerfil from '../pages/Clientes/ClientePerfil';
import Servicos from '../pages/Servicos';
import DashboardFinanceiro from '../pages/DashboardFinanceiro';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<PrivateRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route path="/dashboard" element={<DashboardFinanceiro />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/clientes/:id" element={<ClientePerfil />} />
            <Route path="/servicos" element={<Servicos />} />
            <Route path="/atendimentos" element={<div>Atendimentos (Em Construção)</div>} />
            <Route path="/financeiro" element={<div>Financeiro (Em Construção)</div>} />
            <Route path="/admin" element={<div>Admin (Em Construção)</div>} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
