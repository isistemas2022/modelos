import { NavLink } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-container">

        <NavLink to="/" className="logo">
          <span>Big</span>Data
        </NavLink>

        <nav className="nav-menu">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Inicio
          </NavLink>

          <NavLink
            to="/nosotros"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Nosotros
          </NavLink>

          <NavLink
            to="/servicios"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Servicios
          </NavLink>

          <NavLink
            to="/contacto"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Contacto
          </NavLink>
        </nav>

        <NavLink to="/login" className="login-link">
          Iniciar sesión
        </NavLink>

      </div>
    </header>
  );
}

export default Navbar;