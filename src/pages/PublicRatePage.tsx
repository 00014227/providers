import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { MapPin, Package, Calendar, Truck, CheckCircle2, XCircle } from 'lucide-react';
import { RATE_REQUESTS, TRANSPORT_LABELS } from '../data/mock';

export default function PublicRatePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const rr = RATE_REQUESTS.find(r => r.token === token);

  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [transitDays, setTransitDays] = useState('');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [declined, setDeclined] = useState(false);

  if (!rr) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f6fa' }}>
      <div style={{ textAlign: 'center', color: '#6b7280' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
        <div style={{ fontSize: 18, fontWeight: 600 }}>Запрос не найден</div>
        <div style={{ fontSize: 14, marginTop: 6 }}>Ссылка недействительна или истекла</div>
      </div>
    </div>
  );

  if (submitted) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f6fa' }}>
      <div style={{ textAlign: 'center', background: '#fff', padding: 40, borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', maxWidth: 400 }}>
        <CheckCircle2 size={48} color="#10b981" style={{ marginBottom: 16 }} />
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Ставка отправлена!</div>
        <div style={{ fontSize: 14, color: '#6b7280' }}>Менеджер TransAsia получит вашу ставку и свяжется с вами.</div>
        <div style={{ marginTop: 20, padding: '12px 16px', background: '#f9fafb', borderRadius: 8, fontSize: 14 }}>
          <div><strong>{amount} {currency}</strong> · {transitDays} дней</div>
          {comment && <div style={{ color: '#6b7280', marginTop: 4 }}>{comment}</div>}
        </div>
      </div>
    </div>
  );

  if (declined) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f6fa' }}>
      <div style={{ textAlign: 'center', background: '#fff', padding: 40, borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', maxWidth: 400 }}>
        <XCircle size={48} color="#6b7280" style={{ marginBottom: 16 }} />
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Отказ зафиксирован</div>
        <div style={{ fontSize: 14, color: '#6b7280' }}>Спасибо за ответ. Мы учтём это при следующих запросах.</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f5f6fa', padding: '40px 16px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Truck size={20} color="#3b82f6" />
            <span style={{ fontWeight: 700, fontSize: 18, color: '#1e2a3a' }}>TransAsia Logistics</span>
          </div>
          <div style={{ fontSize: 14, color: '#6b7280' }}>Запрос коммерческого предложения</div>
        </div>

        {/* Request details */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e5e9f0', marginBottom: 20 }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700 }}>Параметры запроса</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <InfoRow icon={<MapPin size={14} color="#3b82f6" />} label="Маршрут">
              <strong>{rr.from}</strong> → <strong>{rr.to}</strong>
            </InfoRow>
            <InfoRow icon={<Truck size={14} color="#6b7280" />} label="Транспорт">
              {TRANSPORT_LABELS[rr.transportType]}
            </InfoRow>
            <InfoRow icon={<Package size={14} color="#6b7280" />} label="Груз">
              {rr.weight.toLocaleString()} кг {rr.volume ? `· ${rr.volume} м³` : ''}
            </InfoRow>
            <InfoRow icon={<Calendar size={14} color="#6b7280" />} label="Дата погрузки">
              {rr.loadingDate}
            </InfoRow>
            <InfoRow icon={<Calendar size={14} color="#f59e0b" />} label="Ответить до">
              <strong style={{ color: '#f59e0b' }}>{rr.deadline}</strong>
            </InfoRow>
            {rr.comment && (
              <div style={{ marginTop: 4, padding: '10px 12px', background: '#f9fafb', borderRadius: 8, fontSize: 13, color: '#6b7280' }}>
                💬 {rr.comment}
              </div>
            )}
          </div>
        </div>

        {/* Response form */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e5e9f0' }}>
          <h2 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700 }}>Ваша ставка</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Сумма *</label>
              <input
                style={inputStyle}
                type="number"
                placeholder="1500"
                value={amount}
                onChange={e => setAmount(e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyle}>Валюта</label>
              <select style={{ ...inputStyle, width: 80 }} value={currency} onChange={e => setCurrency(e.target.value)}>
                <option>USD</option>
                <option>EUR</option>
                <option>RUB</option>
                <option>UZS</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Срок доставки (дней) *</label>
            <input
              style={inputStyle}
              type="number"
              placeholder="7"
              value={transitDays}
              onChange={e => setTransitDays(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Комментарий</label>
            <textarea
              style={{ ...inputStyle, height: 80, resize: 'vertical' }}
              placeholder="Условия, особенности маршрута..."
              value={comment}
              onChange={e => setComment(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => {
                if (!amount || !transitDays) return;
                fetch('https://165-245-217-29.nip.io/api/telegram/responses', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    token: rr.token,
                    contractorName: 'Подрядчик',
                    amount: parseFloat(amount),
                    currency,
                    transitDays: parseInt(transitDays),
                    comment,
                  }),
                }).catch(() => {});
                setSubmitted(true);
              }}
              disabled={!amount || !transitDays}
              style={{ ...btnPrimary, flex: 1, opacity: (!amount || !transitDays) ? 0.5 : 1, justifyContent: 'center' }}
            >
              <CheckCircle2 size={15} /> Отправить ставку
            </button>
            <button onClick={() => setDeclined(true)} style={btnDanger}>
              <XCircle size={15} /> Отказаться
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const InfoRow = ({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, alignItems: 'center' }}>
    <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b7280' }}>{icon} {label}</span>
    <span>{children}</span>
  </div>
);

const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 };
const inputStyle: React.CSSProperties = { border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 12px', fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box', background: '#fff' };
const btnPrimary: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 6, background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, padding: '11px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' };
const btnDanger: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 6, background: '#fff', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: 8, padding: '11px 16px', fontSize: 14, fontWeight: 500, cursor: 'pointer' };
