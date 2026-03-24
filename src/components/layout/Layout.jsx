// Wrapper principal de todas las páginas protegidas
// ErrorBoundary va DENTRO de Layout en App.jsx — nunca fuera
// Si ErrorBoundary envuelve Layout desde fuera, el Sidebar desaparece cuando falla una página
// flex h-screen overflow-hidden — evita doble scrollbar en página y sidebar

import Sidebar from "./Sidebar.jsx";
import Navbar from "./Navbar.jsx";

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen bg-[var(--bg)] overflow-hidden">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-6" role="main">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
