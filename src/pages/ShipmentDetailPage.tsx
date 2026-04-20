import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, FileText, ArrowRight, Package, Weight,
  Calendar, DollarSign, Truck, MapPin, Hash,
  ClipboardList, MessageSquare, ExternalLink,
} from 'lucide-react';
import {
  SHIPMENTS, SHIPMENT_STATUS_LABELS, ShipmentStatus, TRANSPORT_LABELS,
} from '../data/mock';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const STATUS_COLORS: Record<ShipmentStatus, string> = {
  new: 'bg-slate-100 text-slate-700 border-slate-200',
  pending_rates: 'bg-amber-50 text-amber-700 border-amber-200',
  carrier_assigned: 'bg-blue-50 text-blue-700 border-blue-200',
  in_transit: 'bg-purple-50 text-purple-700 border-purple-200',
  delivered: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

const VEHICLE_LABELS: Record<string, string> = {
  truck: 'Фура (20т)',
  truck_mega: 'Мега-фура (24т)',
  isothermal: 'Изотермический',
  ref: 'Рефрижератор',
  open: 'Открытый бортовой',
  tanker: 'Цистерна',
  container_20: "Контейнер 20'",
  container_40: "Контейнер 40'",
  air: 'Авиагрузовой',
  rail_wagon: 'Ж/Д вагон',
};

const CARGO_LABELS: Record<string, string> = {
  general: 'Генеральный',
  bulk: 'Насыпной',
  liquid: 'Жидкий',
  oversized: 'Негабаритный',
  dangerous: 'Опасный (ADR)',
  refrigerated: 'Рефрижераторный',
};

const LOADING_LABELS: Record<string, string> = {
  rear: 'Задняя',
  side: 'Боковая',
  top: 'Верхняя',
  any: 'Любой',
};

export default function ShipmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const shipment = SHIPMENTS.find(s => s.id === id);

  if (!shipment) {
    return (
      <div className="text-center py-24 text-muted-foreground">
        <Package size={40} className="mx-auto mb-3 opacity-30" />
        <p>Перевозка не найдена</p>
        <Button variant="link" onClick={() => navigate('/shipments')}>← Назад к списку</Button>
      </div>
    );
  }

  const canRequest = shipment.status === 'new' || shipment.status === 'pending_rates';

  return (
    <div className="max-w-3xl mx-auto pb-10">
      {/* Back + header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/shipments')}
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-3"
        >
          <ChevronLeft size={14} /> Перевозки
        </button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold font-mono">{shipment.orderNumber}</h1>
              <span className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                STATUS_COLORS[shipment.status]
              )}>
                {SHIPMENT_STATUS_LABELS[shipment.status]}
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              Клиент: <span className="font-medium text-foreground">{shipment.client}</span>
              <span className="mx-2 text-border">·</span>
              Создано {shipment.createdAt}
            </p>
          </div>
          {canRequest && (
            <Button onClick={() => navigate(`/rate-requests/new?shipmentId=${shipment.id}`)}>
              <FileText size={14} /> Запросить ставки
            </Button>
          )}
          {shipment.rateRequestId && (
            <Button variant="outline" onClick={() => navigate(`/rate-requests/${shipment.rateRequestId}`)}>
              <ExternalLink size={14} /> Открыть запрос
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {/* Route card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <MapPin size={14} className="text-primary" /> Маршрут
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1 p-4 rounded-lg bg-muted/40 border">
                <p className="text-xs text-muted-foreground mb-0.5">Отправление</p>
                <p className="font-semibold text-lg">{shipment.fromCity}</p>
                {shipment.fromIndex && <p className="text-xs text-muted-foreground">{shipment.fromIndex}</p>}
                <p className="text-sm text-muted-foreground">{shipment.fromCountry}</p>
              </div>
              <ArrowRight size={20} className="text-muted-foreground shrink-0" />
              <div className="flex-1 p-4 rounded-lg bg-muted/40 border">
                <p className="text-xs text-muted-foreground mb-0.5">Назначение</p>
                <p className="font-semibold text-lg">{shipment.toCity}</p>
                {shipment.toIndex && <p className="text-xs text-muted-foreground">{shipment.toIndex}</p>}
                <p className="text-sm text-muted-foreground">{shipment.toCountry}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cargo + Vehicle */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Package size={14} className="text-primary" /> Груз
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <DetailRow icon={<Weight size={13} />} label="Вес брутто">
                {shipment.weightKg.toLocaleString()} кг
              </DetailRow>
              {shipment.cargoValueUsd && (
                <DetailRow icon={<DollarSign size={13} />} label="Стоимость">
                  {shipment.cargoValueUsd.toLocaleString()} {shipment.currency}
                </DetailRow>
              )}
              <DetailRow icon={<ClipboardList size={13} />} label="Тип груза">
                {CARGO_LABELS[shipment.cargoType] ?? shipment.cargoType}
              </DetailRow>
              <DetailRow icon={<Calendar size={13} />} label="Дата погрузки">
                {shipment.loadingDate}
              </DetailRow>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Truck size={14} className="text-primary" /> Транспорт
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <DetailRow icon={<Truck size={13} />} label="Вид ТС">
                {VEHICLE_LABELS[shipment.vehicleType] ?? shipment.vehicleType}
              </DetailRow>
              <DetailRow icon={<Hash size={13} />} label="Кол-во ТС">
                {shipment.vehicleCount} шт.
              </DetailRow>
              {shipment.loadingMethod && (
                <DetailRow icon={<Package size={13} />} label="Погрузка">
                  {LOADING_LABELS[shipment.loadingMethod] ?? shipment.loadingMethod}
                </DetailRow>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Customs + conditions */}
        {(shipment.incoterms || shipment.exportCustoms || shipment.importCustoms ||
          shipment.hsCodes?.length || shipment.specialConditions || shipment.comment) && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <ClipboardList size={14} className="text-primary" /> Условия и таможня
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {shipment.incoterms && (
                <DetailRow icon={<Hash size={13} />} label="Инкотермс">{shipment.incoterms}</DetailRow>
              )}
              {shipment.exportCustoms && (
                <DetailRow icon={<MapPin size={13} />} label="Экспорт. ТО">{shipment.exportCustoms}</DetailRow>
              )}
              {shipment.importCustoms && (
                <DetailRow icon={<MapPin size={13} />} label="Импорт. ТО">{shipment.importCustoms}</DetailRow>
              )}
              {shipment.hsCodes && shipment.hsCodes.length > 0 && (
                <div className="flex items-start gap-2 text-sm">
                  <Hash size={13} className="mt-0.5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Коды ТНВЭД</p>
                    <div className="flex flex-wrap gap-1">
                      {shipment.hsCodes.map(c => (
                        <Badge key={c} variant="outline" className="text-xs font-normal">{c}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {shipment.specialConditions && (
                <DetailRow icon={<MessageSquare size={13} />} label="Особые условия">
                  {shipment.specialConditions}
                </DetailRow>
              )}
              {shipment.comment && (
                <DetailRow icon={<MessageSquare size={13} />} label="Комментарий">
                  {shipment.comment}
                </DetailRow>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function DetailRow({
  icon, label, children,
}: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="mt-0.5 text-muted-foreground shrink-0">{icon}</span>
      <div className="flex-1 min-w-0 flex items-baseline justify-between gap-2">
        <span className="text-muted-foreground shrink-0">{label}</span>
        <span className="font-medium text-right">{children}</span>
      </div>
    </div>
  );
}
