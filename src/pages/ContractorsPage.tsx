import { useState } from 'react';
import { Users, Mail, Send, Plus, Search, Filter } from 'lucide-react';
import { CONTRACTORS, Contractor, TransportType, TRANSPORT_LABELS, COUNTRY_LIST } from '../data/mock';

const TRANSPORT_TYPES: TransportType[] = ['auto', 'rail', 'air', 'sea'];

const badge = (label: string, color: string) => (
  <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 500, background: color, color: '#fff' }}>
    {label}
  </span>
);

const TRANSPORT_COLORS: Record<TransportType, string> = {
  auto: '#3b82f6', rail: '#8b5cf6', air: '#f59e0b', sea: '#06b6d4',
};

export default function ContractorsPage() {
  const [search, setSearch] = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  const [filterType, setFilterType] = useState<TransportType | ''>('');
  const [selected, setSelected] = useState<Contractor | null>(null);

  const filtered = CONTRACTORS.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchCountry = !filterCountry || c.country === filterCountry;
    const matchType = !filterType || c.transportTypes.includes(filterType as TransportType);
    return matchSearch && matchCountry && matchType;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Подрядчики</h1>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 14 }}>{CONTRACTORS.length} компаний в базе</p>
        </div>
        <button style={btnPrimary}>
          <Plus size={16} /> Добавить подрядчика
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            placeholder="Поиск по названию..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle, paddingLeft: 32, width: '100%' }}
          />
        </div>
        <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)} style={inputStyle}>
          <option value="">Все страны</option>
          {COUNTRY_LIST.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value as TransportType | '')} style={inputStyle}>
          <option value="">Все типы</option>
          {TRANSPORT_TYPES.map(t => <option key={t} value={t}>{TRANSPORT_LABELS[t]}</option>)}
        </select>
      </div>

      {/* List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {filtered.map(c => (
          <div
            key={c.id}
            onClick={() => setSelected(c)}
            style={{
              background: '#fff', borderRadius: 10, padding: 20, cursor: 'pointer',
              border: selected?.id === c.id ? '2px solid #3b82f6' : '2px solid transparent',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)', transition: 'all 0.15s',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{c.name}</div>
                <div style={{ color: '#6b7280', fontSize: 13 }}>{c.country}</div>
              </div>
              <div style={{ fontSize: 12, color: '#6b7280', textAlign: 'right' }}>
                <div style={{ fontWeight: 600, color: '#111', fontSize: 18 }}>{c.totalRates}</div>
                <div>запросов</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
              {c.transportTypes.map(t => badge(TRANSPORT_LABELS[t], TRANSPORT_COLORS[t]))}
            </div>
            <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 10, fontSize: 13, color: '#6b7280' }}>
              <Users size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
              {c.contacts.length} контакт{c.contacts.length > 1 ? 'а' : ''}
            </div>
          </div>
        ))}
      </div>

      {/* Side panel */}
      {selected && (
        <div style={{
          position: 'fixed', top: 0, right: 0, width: 360, height: '100vh',
          background: '#fff', boxShadow: '-4px 0 20px rgba(0,0,0,0.1)',
          padding: 24, overflowY: 'auto', zIndex: 100,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ margin: 0, fontSize: 17 }}>{selected.name}</h2>
            <button onClick={() => setSelected(null)} style={btnGhost}>✕</button>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>СТРАНА</div>
            <div style={{ fontWeight: 500 }}>{selected.country}</div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 6 }}>ТИПЫ ТРАНСПОРТА</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {selected.transportTypes.map(t => badge(TRANSPORT_LABELS[t], TRANSPORT_COLORS[t]))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 10 }}>КОНТАКТЫ</div>
            {selected.contacts.map(ct => (
              <div key={ct.id} style={{ background: '#f9fafb', borderRadius: 8, padding: 12, marginBottom: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{ct.name}</div>
                <div style={{ fontSize: 13, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <Mail size={12} /> {ct.email}
                </div>
                {ct.telegram && (
                  <div style={{ fontSize: 13, color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Send size={12} /> {ct.telegram}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const btnPrimary: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 6,
  background: '#3b82f6', color: '#fff', border: 'none',
  borderRadius: 8, padding: '9px 16px', fontSize: 14, fontWeight: 500, cursor: 'pointer',
};
const btnGhost: React.CSSProperties = {
  background: 'transparent', border: 'none', fontSize: 18, cursor: 'pointer', color: '#6b7280', padding: '4px 8px',
};
const inputStyle: React.CSSProperties = {
  border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px',
  fontSize: 14, outline: 'none', background: '#fff',
};
