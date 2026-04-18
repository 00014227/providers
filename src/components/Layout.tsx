import { NavLink, Outlet } from 'react-router-dom';
import { Truck, FileText, Users, ChevronRight } from 'lucide-react';

const nav = [
  { to: '/rate-requests', label: 'Запросы ставок', icon: FileText },
  { to: '/contractors', label: 'Подрядчики', icon: Users },
];

export default function Layout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#f5f6fa' }}>
      {/* Sidebar */}
      <aside style={{ width: 240, background: '#1e2a3a', color: '#fff', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid #2d3f55' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Truck size={22} color="#4f9cf9" />
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>TransAsia</div>
              <div style={{ fontSize: 11, color: '#8fa3b8' }}>Кабинет сотрудника</div>
            </div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: '12px 0' }}>
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 20px', color: isActive ? '#fff' : '#8fa3b8',
                background: isActive ? '#2d3f55' : 'transparent',
                textDecoration: 'none', fontSize: 14, fontWeight: isActive ? 600 : 400,
                borderLeft: isActive ? '3px solid #4f9cf9' : '3px solid transparent',
                transition: 'all 0.15s',
              })}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div style={{ padding: '16px 20px', borderTop: '1px solid #2d3f55', fontSize: 12, color: '#8fa3b8' }}>
          v1.0 MVP
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar breadcrumb */}
        <header style={{ background: '#fff', borderBottom: '1px solid #e5e9f0', padding: '0 28px', height: 52, display: 'flex', alignItems: 'center' }}>
          <ChevronRight size={14} color="#8fa3b8" style={{ margin: '0 4px' }} />
        </header>
        <main style={{ flex: 1, overflowY: 'auto', padding: 28 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
