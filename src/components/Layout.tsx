import { NavLink, Outlet } from 'react-router-dom';
import { Truck, FileText, Users, Package } from 'lucide-react';

const nav = [
  { to: '/shipments', label: 'Перевозки', icon: Package },
  { to: '/rate-requests', label: 'Запросы ставок', icon: FileText },
  { to: '/contractors', label: 'Подрядчики', icon: Users },
];

export default function Layout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f6fa' }}>
      <aside style={{ width: 240, background: '#1e2a3a', color: '#fff', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '20px 20px 14px', borderBottom: '1px solid #2d3f55' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Truck size={20} color="#4f9cf9" />
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>TransAsia</div>
              <div style={{ fontSize: 11, color: '#8fa3b8' }}>Кабинет сотрудника</div>
            </div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: '8px 0' }}>
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 20px',
                color: isActive ? '#fff' : '#8fa3b8',
                background: isActive ? '#2d3f55' : 'transparent',
                textDecoration: 'none', fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                borderLeft: isActive ? '3px solid #4f9cf9' : '3px solid transparent',
                transition: 'all 0.15s',
              })}
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div style={{ padding: '14px 20px', borderTop: '1px solid #2d3f55', fontSize: 11, color: '#8fa3b8' }}>
          v1.0 MVP
        </div>
      </aside>

      <main style={{ flex: 1, overflowY: 'auto', padding: 28 }}>
        <Outlet />
      </main>
    </div>
  );
}
