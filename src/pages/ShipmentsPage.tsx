import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, FileText, ArrowRight, Truck,
  Package, Clock, CheckCircle, XCircle, Loader,
} from 'lucide-react';
import {
  SHIPMENTS, SHIPMENT_STATUS_LABELS, Shipment, ShipmentStatus,
} from '../data/mock';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const STATUS_ICONS: Record<ShipmentStatus, React.ReactNode> = {
  new: <FileText size={13} />,
  pending_rates: <Clock size={13} />,
  carrier_assigned: <Truck size={13} />,
  in_transit: <Loader size={13} />,
  delivered: <CheckCircle size={13} />,
  cancelled: <XCircle size={13} />,
};

const STATUS_COLORS: Record<ShipmentStatus, string> = {
  new: 'bg-slate-100 text-slate-700 border-slate-200',
  pending_rates: 'bg-amber-50 text-amber-700 border-amber-200',
  carrier_assigned: 'bg-blue-50 text-blue-700 border-blue-200',
  in_transit: 'bg-purple-50 text-purple-700 border-purple-200',
  delivered: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

const ALL_STATUSES: ShipmentStatus[] = [
  'new', 'pending_rates', 'carrier_assigned', 'in_transit', 'delivered', 'cancelled',
];

export default function ShipmentsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | 'all'>('all');

  const filtered = SHIPMENTS.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      s.orderNumber.toLowerCase().includes(q) ||
      s.client.toLowerCase().includes(q) ||
      s.fromCity.toLowerCase().includes(q) ||
      s.toCity.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = ALL_STATUSES.reduce((acc, s) => {
    acc[s] = SHIPMENTS.filter(x => x.status === s).length;
    return acc;
  }, {} as Record<ShipmentStatus, number>);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Перевозки</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{SHIPMENTS.length} всего</p>
        </div>
        <Button onClick={() => navigate('/shipments/new')}>
          <Plus size={15} /> Новая перевозка
        </Button>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 flex-wrap mb-4">
        <button
          onClick={() => setStatusFilter('all')}
          className={cn(
            'px-3 py-1.5 rounded-md text-xs font-medium border transition-colors',
            statusFilter === 'all'
              ? 'bg-foreground text-background border-foreground'
              : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted/50'
          )}
        >
          Все · {SHIPMENTS.length}
        </button>
        {ALL_STATUSES.map(s => counts[s] > 0 && (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors',
              statusFilter === s
                ? STATUS_COLORS[s] + ' border-current'
                : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            {STATUS_ICONS[s]}
            {SHIPMENT_STATUS_LABELS[s]} · {counts[s]}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-8"
          placeholder="Поиск по номеру, клиенту, маршруту..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground text-sm">
            <Package size={32} className="mx-auto mb-3 opacity-30" />
            Перевозки не найдены
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map(s => (
            <ShipmentRow key={s.id} shipment={s} onRequestRates={() =>
              navigate(`/rate-requests/new?shipmentId=${s.id}`)
            } />
          ))}
        </div>
      )}
    </div>
  );
}

function ShipmentRow({ shipment: s, onRequestRates }: { shipment: Shipment; onRequestRates: () => void }) {
  const navigate = useNavigate();
  const canRequest = s.status === 'new' || s.status === 'pending_rates';

  return (
    <Card
      className="hover:shadow-sm transition-shadow cursor-pointer"
      onClick={() => navigate(`/shipments/${s.id}`)}
    >
      <CardContent className="py-3 px-4">
        <div className="flex items-center gap-4">
          {/* Order info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-sm font-semibold">{s.orderNumber}</span>
              <span className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
                STATUS_COLORS[s.status]
              )}>
                {STATUS_ICONS[s.status]}
                {SHIPMENT_STATUS_LABELS[s.status]}
              </span>
              {s.rateRequestId && (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  Запрос привязан
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{s.client}</p>
          </div>

          {/* Route */}
          <div className="hidden sm:flex items-center gap-2 text-sm min-w-0">
            <div className="text-right">
              <p className="font-medium truncate">{s.fromCity}</p>
              <p className="text-xs text-muted-foreground">{s.fromCountry}</p>
            </div>
            <ArrowRight size={14} className="text-muted-foreground shrink-0" />
            <div>
              <p className="font-medium truncate">{s.toCity}</p>
              <p className="text-xs text-muted-foreground">{s.toCountry}</p>
            </div>
          </div>

          {/* Cargo */}
          <div className="hidden lg:block text-right text-sm min-w-[100px]">
            <p className="font-medium">{s.weightKg.toLocaleString()} кг</p>
            <p className="text-xs text-muted-foreground">{s.loadingDate}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
            {canRequest ? (
              <Button size="sm" onClick={onRequestRates} className="text-xs gap-1.5">
                <FileText size={13} />
                Запросить ставки
              </Button>
            ) : (
              <span className="text-xs text-muted-foreground px-2">
                {s.status === 'carrier_assigned' ? 'Перевозчик назначен' :
                 s.status === 'in_transit' ? 'В пути' :
                 s.status === 'delivered' ? 'Доставлено' : '—'}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
