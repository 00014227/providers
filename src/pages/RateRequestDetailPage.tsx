import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { MapPin, Calendar, Package, Trophy, Clock, CheckCircle2, XCircle, Copy } from 'lucide-react';
import { RATE_REQUESTS, TRANSPORT_LABELS, CONTRACTORS, RateResponse } from '../data/mock';

export default function RateRequestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const rr = RATE_REQUESTS.find(r => r.id === id);
  const [winnerId, setWinnerId] = useState(rr?.winnerId || '');
  const [copied, setCopied] = useState(false);

  if (!rr) return <div>Запрос не найден</div>;

  const contractors = CONTRACTORS.filter(c => rr.invitedContractors.includes(c.id));
  const publicLink = `${window.location.origin}/rate/${rr.token}`;

  const copyLink = () => {
    navigator.clipboard.writeText(publicLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectWinner = (respId: string) => {
    setWinnerId(respId);
    alert(`Победитель выбран: ${rr.responses.find(r => r.id === respId)?.contractorName} (mock)`);
  };

  const statusBadge = (s: RateResponse['status']) => {
    const map = {
      responded: { label: 'Ответил', color: '#10b981', bg: '#ecfdf5' },
      pending: { label: 'Ожидает', color: '#f59e0b', bg: '#fffbeb' },
      declined: { label: 'Отказался', color: '#ef4444', bg: '#fef2f2' },
      winner: { label: 'Победитель', color: '#7c3aed', bg: '#f5f3ff' },
    };
    const { label, color, bg } = map[s] || map.pending;
    return <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: bg, color }}>{label}</span>;
  };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} style={btnGhost}>← Назад</button>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', margin: '12px 0 24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <MapPin size={18} color="#3b82f6" />
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{rr.from} → {rr.to}</h1>
            <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: '#eff6ff', color: '#3b82f6' }}>
              {TRANSPORT_LABELS[rr.transportType]}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 20, fontSize: 13, color: '#6b7280' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Calendar size={13} /> Погрузка: {rr.loadingDate}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={13} /> Дедлайн: {rr.deadline}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Package size={13} /> {rr.weight.toLocaleString()} кг · {rr.volume} м³
            </span>
          </div>
        </div>
        {winnerId && (
          <span style={{ padding: '6px 14px', borderRadius: 10, background: '#f5f3ff', color: '#7c3aed', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Trophy size={14} /> Победитель выбран
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
        {/* Responses */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
              Ответы ({rr.responses.length}/{rr.invitedContractors.length})
            </h2>
          </div>

          {rr.responses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af', background: '#fff', borderRadius: 10, border: '1px solid #e5e9f0' }}>
              <Clock size={32} style={{ marginBottom: 8, opacity: 0.5 }} />
              <div>Ответов пока нет</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>Ожидаем ответы от подрядчиков</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {rr.responses.map(resp => {
                const isWinner = winnerId === resp.id;
                return (
                  <div key={resp.id} style={{
                    background: '#fff', borderRadius: 10, padding: '16px 20px',
                    border: `2px solid ${isWinner ? '#7c3aed' : '#e5e9f0'}`,
                    boxShadow: isWinner ? '0 0 0 4px #f5f3ff' : 'none',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                          {isWinner && <Trophy size={15} color="#7c3aed" />}
                          {resp.contractorName}
                        </div>
                        <div style={{ fontSize: 13, color: '#6b7280' }}>
                          {new Date(resp.respondedAt).toLocaleDateString('ru', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      {statusBadge(isWinner ? 'winner' : resp.status)}
                    </div>

                    <div style={{ display: 'flex', gap: 24, marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 2 }}>СТАВКА</div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: '#111' }}>
                          {resp.amount.toLocaleString()} <span style={{ fontSize: 14, color: '#6b7280' }}>{resp.currency}</span>
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 2 }}>СРОК</div>
                        <div style={{ fontSize: 18, fontWeight: 600 }}>{resp.transitDays} дн.</div>
                      </div>
                    </div>

                    {resp.comment && (
                      <div style={{ fontSize: 13, color: '#6b7280', background: '#f9fafb', padding: '8px 12px', borderRadius: 6, marginBottom: 12 }}>
                        {resp.comment}
                      </div>
                    )}

                    {!winnerId && (
                      <button onClick={() => selectWinner(resp.id)} style={btnWinner}>
                        <Trophy size={14} /> Выбрать победителем
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Awaiting */}
          {contractors.filter(c => !rr.responses.find(r => r.contractorId === c.id)).length > 0 && (
            <div style={{ marginTop: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#6b7280', marginBottom: 10 }}>Ожидают ответа:</h3>
              {contractors.filter(c => !rr.responses.find(r => r.contractorId === c.id)).map(c => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', fontSize: 13, color: '#6b7280', borderBottom: '1px solid #f3f4f6' }}>
                  <Clock size={13} color="#f59e0b" />
                  {c.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div>
          {/* Public link */}
          <div style={{ background: '#fff', borderRadius: 10, padding: 16, border: '1px solid #e5e9f0', marginBottom: 16 }}>
            <h3 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 600 }}>Публичная ссылка</h3>
            <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 10px' }}>
              Отправьте подрядчику — он сможет ответить без логина
            </p>
            <div style={{ display: 'flex', gap: 6 }}>
              <input readOnly value={publicLink} style={{ ...inputStyle, flex: 1, fontSize: 11, color: '#6b7280' }} />
              <button onClick={copyLink} style={btnIcon}>
                {copied ? <CheckCircle2 size={16} color="#10b981" /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          {/* Invited */}
          <div style={{ background: '#fff', borderRadius: 10, padding: 16, border: '1px solid #e5e9f0' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600 }}>Приглашены ({contractors.length})</h3>
            {contractors.map(c => {
              const resp = rr.responses.find(r => r.contractorId === c.id);
              return (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #f9fafb', fontSize: 13 }}>
                  <span>{c.name}</span>
                  {resp ? (
                    winnerId === resp.id
                      ? <Trophy size={13} color="#7c3aed" />
                      : <CheckCircle2 size={13} color="#10b981" />
                  ) : (
                    <Clock size={13} color="#f59e0b" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

const btnGhost: React.CSSProperties = { background: 'transparent', border: 'none', fontSize: 13, cursor: 'pointer', color: '#6b7280', padding: 0 };
const btnWinner: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 6, background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe', borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' };
const btnIcon: React.CSSProperties = { background: '#f3f4f6', border: 'none', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' };
const inputStyle: React.CSSProperties = { border: '1px solid #e5e7eb', borderRadius: 8, padding: '7px 10px', fontSize: 13, outline: 'none', background: '#fff', width: '100%', boxSizing: 'border-box' };
