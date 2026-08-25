// AppRoutes.tsx
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';

import Home from '../pages/Home';
import About from '../pages/About';
import Services from '../pages/Services';
import Contact from '../pages/Contact';
import Login from '../pages/login/login';
import Dashboard from '../pages/dashboard/dashboard';

function AppRoutes() {
  return (
    <Routes>
      {/* Rutas CON layout (navbar + footer) */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/nosotros" element={<About />} />
        <Route path="/servicios" element={<Services />} />
        <Route path="/contacto" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
      </Route>





      {/* Rutas SIN layout (pantalla completa) */}
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default AppRoutes;