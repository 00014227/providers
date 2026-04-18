import { useNavigate } from 'react-router-dom';
import { Plus, MapPin, Calendar, MessageSquare, CheckCircle2, Clock } from 'lucide-react';
import { RATE_REQUESTS, TRANSPORT_LABELS, CONTRACTORS } from '../data/mock';

const statusConfig = {
  open: { label: 'Открыт', color: '#10b981', bg: '#ecfdf5' },
  closed: { label: 'Закрыт', color: '#6b7280', bg: '#f3f4f6' },
};

export default function RateRequestsPage() {
  const navigate = useNavigate();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Запросы ставок</h1>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 14 }}>{RATE_REQUESTS.length} активных запроса</p>
        </div>
        <button onClick={() => navigate('/rate-requests/new')} style={btnPrimary}>
          <Plus size={16} /> Новый запрос
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {RATE_REQUESTS.map(r => {
          const status = statusConfig[r.status];
          const contractors = CONTRACTORS.filter(c => r.invitedContractors.includes(c.id));
          const responded = r.responses.length;
          const hasWinner = !!r.winnerId;

          return (
            <div
              key={r.id}
              onClick={() => navigate(`/rate-requests/${r.id}`)}
              style={{
                background: '#fff', borderRadius: 10, padding: '16px 20px',
                cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                border: '1px solid #e5e9f0', transition: 'box-shadow 0.15s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  {/* Route */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <MapPin size={15} color="#3b82f6" />
                    <span style={{ fontWeight: 600, fontSize: 15 }}>{r.from}</span>
                    <span style={{ color: '#9ca3af' }}>→</span>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>{r.to}</span>
                    <span style={{
                      padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 500,
                      background: '#eff6ff', color: '#3b82f6',
                    }}>
                      {TRANSPORT_LABELS[r.transportType]}
                    </span>
                  </div>

                  {/* Meta */}
                  <div style={{ display: 'flex', gap: 20, fontSize: 13, color: '#6b7280' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={12} /> Погрузка: {r.loadingDate}
                    </span>
                    <span>{r.weight.toLocaleString()} кг · {r.volume} м³</span>
                    {r.comment && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MessageSquare size={12} /> {r.comment.slice(0, 40)}…
                      </span>
                    )}
                  </div>
                </div>

                {/* Right side */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, marginLeft: 20 }}>
                  <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: status.bg, color: status.color }}>
                    {status.label}
                  </span>
                  <div style={{ fontSize: 13, color: '#6b7280', textAlign: 'right' }}>
                    {hasWinner ? (
                      <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircle2 size={13} /> Победитель выбран
                      </span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={13} /> {responded}/{r.invitedContractors.length} ответов
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>
                    {contractors.map(c => c.name).join(', ')}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const btnPrimary: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 6,
  background: '#3b82f6', color: '#fff', border: 'none',
  borderRadius: 8, padding: '9px 16px', fontSize: 14, fontWeight: 500, cursor: 'pointer',
};
