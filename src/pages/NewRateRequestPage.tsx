import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ChevronRight, ChevronLeft, Check, Package, Users, Send, Eye, X,
  Sparkles, UserCheck, ChevronDown, ChevronUp, Star, Link2,
} from 'lucide-react';
import { CONTRACTORS, SHIPMENTS, TransportType, TRANSPORT_LABELS } from '../data/mock';
import { matchContractors, vehicleToTransportType } from '@/lib/contractor-matcher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Step = 1 | 2 | 3;

const HS_CODES = [
  '8704 - Автомобили грузовые',
  '8716 - Прицепы и полуприцепы',
  '2710 - Нефть и нефтепродукты',
  '7208 - Прокат плоский из железа',
  '8471 - Машины вычислительные',
  '6403 - Обувь',
  '9403 - Мебель прочая',
  '2204 - Вина виноградные',
];

interface Form {
  requestDate: string;
  status: string;
  fromCity: string;
  fromIndex: string;
  fromCountry: string;
  toCity: string;
  toIndex: string;
  toCountry: string;
  loadingDate: string;
  weightKg: string;
  cargoValueUsd: string;
  cargoType: string;
  vehicleCount: string;
  vehicleType: string;
  loadingMethod: string;
  hsCodes: string[];
  exportCustoms: string;
  importCustoms: string;
  incoterms: string;
  currency: string;
  auctionDurationMin: string;
  specialConditions: string;
  comment: string;
  selectedContractors: string[];
  channels: Record<string, 'email' | 'telegram' | 'both'>;
}

export default function NewRateRequestPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<Step>(1);
  const [showManual, setShowManual] = useState(false);
  const [linkedShipment, setLinkedShipment] = useState<(typeof SHIPMENTS)[0] | null>(null);

  const [form, setForm] = useState<Form>(() => {
    const shipmentId = searchParams.get('shipmentId');
    const shipment = shipmentId ? SHIPMENTS.find(s => s.id === shipmentId) : null;
    if (shipment) {
      return {
        requestDate: new Date().toISOString().split('T')[0],
        status: 'new',
        fromCity: shipment.fromCity,
        fromIndex: shipment.fromIndex ?? '',
        fromCountry: shipment.fromCountry,
        toCity: shipment.toCity,
        toIndex: shipment.toIndex ?? '',
        toCountry: shipment.toCountry,
        loadingDate: shipment.loadingDate,
        weightKg: String(shipment.weightKg),
        cargoValueUsd: shipment.cargoValueUsd ? String(shipment.cargoValueUsd) : '',
        cargoType: shipment.cargoType,
        vehicleCount: String(shipment.vehicleCount),
        vehicleType: shipment.vehicleType,
        loadingMethod: shipment.loadingMethod ?? 'rear',
        hsCodes: shipment.hsCodes ?? [],
        exportCustoms: shipment.exportCustoms ?? '',
        importCustoms: shipment.importCustoms ?? '',
        incoterms: shipment.incoterms ?? '',
        currency: shipment.currency,
        auctionDurationMin: '60',
        specialConditions: shipment.specialConditions ?? '',
        comment: shipment.comment ?? '',
        selectedContractors: [],
        channels: {},
      };
    }
    return {
      requestDate: new Date().toISOString().split('T')[0],
      status: 'new',
      fromCity: '', fromIndex: '', fromCountry: '',
      toCity: '', toIndex: '', toCountry: '',
      loadingDate: '', weightKg: '', cargoValueUsd: '',
      cargoType: 'general',
      vehicleCount: '1', vehicleType: 'truck', loadingMethod: 'rear',
      hsCodes: [],
      exportCustoms: '', importCustoms: '',
      incoterms: '', currency: 'USD', auctionDurationMin: '60',
      specialConditions: '', comment: '',
      selectedContractors: [],
      channels: {},
    };
  });

  useEffect(() => {
    const shipmentId = searchParams.get('shipmentId');
    if (shipmentId) {
      const s = SHIPMENTS.find(x => x.id === shipmentId) ?? null;
      setLinkedShipment(s);
    }
  }, [searchParams]);

  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ sent: number; failed: number } | null>(null);

  const set = <K extends keyof Form>(key: K, val: Form[K]) =>
    setForm(f => ({ ...f, [key]: val }));

  // ---------- Auto-match ----------
  const matched = useMemo(() => matchContractors({
    fromCountry: form.fromCountry,
    toCountry: form.toCountry,
    vehicleType: form.vehicleType,
  }, CONTRACTORS), [form.fromCountry, form.toCountry, form.vehicleType]);

  const autoMatched = matched.filter(m => m.matchType === 'auto');
  const partialMatched = matched.filter(m => m.matchType === 'partial');
  const restContractors = matched.filter(m => m.matchType === 'manual');

  // Auto-select all auto-matched when entering step 2
  const handleGoStep2 = () => {
    const autoIds = autoMatched.map(m => m.contractor.id);
    const channels: Record<string, 'email' | 'telegram' | 'both'> = {};
    autoIds.forEach(id => { channels[id] = 'telegram'; });
    set('selectedContractors', autoIds);
    set('channels', channels);
    setStep(2);
  };

  const toggleContractor = (id: string) => {
    const next = form.selectedContractors.includes(id)
      ? form.selectedContractors.filter(c => c !== id)
      : [...form.selectedContractors, id];
    set('selectedContractors', next);
    if (!form.channels[id]) set('channels', { ...form.channels, [id]: 'telegram' });
  };

  const toggleHsCode = (code: string) => {
    set('hsCodes', form.hsCodes.includes(code)
      ? form.hsCodes.filter(c => c !== code)
      : [...form.hsCodes, code]);
  };

  const canNext1 = form.fromCity && form.toCity && form.loadingDate && form.weightKg;
  const canNext2 = form.selectedContractors.length > 0;

  const buildMessage = (contactName?: string) => {
    const firstName = contactName?.split(' ')[0] ?? '';
    return [
      `Добрый день${firstName ? `, ${firstName}` : ''}! 👋`,
      ``,
      `Как вы поживаете? Надеюсь, всё хорошо.`,
      ``,
      `У нас появился новый груз, и мы в первую очередь обращаемся к вам — хотели бы узнать вашу ставку, если есть такая возможность.`,
      ``,
      `📍 Маршрут: ${form.fromCity}${form.fromCountry ? ` (${form.fromCountry})` : ''} → ${form.toCity}${form.toCountry ? ` (${form.toCountry})` : ''}`,
      `📅 Дата погрузки: ${form.loadingDate}`,
      `⚖️ Вес: ${form.weightKg} кг`,
      form.cargoValueUsd ? `💰 Стоимость груза: ${form.cargoValueUsd} ${form.currency}` : '',
      `🚛 Транспорт: ${form.vehicleType}, ${form.vehicleCount} шт.`,
      form.incoterms ? `📋 Инкотермс: ${form.incoterms}` : '',
      form.specialConditions ? `⚠️ Особые условия: ${form.specialConditions}` : '',
      form.comment ? `💬 ${form.comment}` : '',
      ``,
      `Если вам удобно — пожалуйста, скиньте вашу ставку в ответ. Будем очень признательны! 🙏`,
    ].filter(Boolean).join('\n');
  };

  const handleSend = async () => {
    setSending(true);
    try {
      const selectedList = CONTRACTORS.filter(c => form.selectedContractors.includes(c.id));
      const recipients = selectedList.flatMap(c =>
        c.contacts.filter(ct => ct.telegram)
          .map(ct => ({ username: ct.telegram!, message: buildMessage(ct.name) }))
      );
      if (recipients.length === 0) {
        alert('У выбранных подрядчиков нет Telegram контактов');
        setSending(false);
        return;
      }
      const res = await fetch('http://165.245.217.29:3000/api/telegram/send-rate-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipients, delayMs: 5000 }),
      });
      const data = await res.json();
      setSendResult({ sent: data.sent, failed: data.failed });
    } catch {
      alert('Ошибка отправки. Проверьте что backend запущен.');
    } finally {
      setSending(false);
    }
  };

  const steps = [
    { n: 1, label: 'Параметры груза', icon: Package },
    { n: 2, label: 'Подрядчики', icon: Users },
    { n: 3, label: 'Подтверждение', icon: Eye },
  ];

  return (
    <div className="max-w-4xl mx-auto pb-10">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-3"
        >
          <ChevronLeft size={14} /> Назад
        </button>
        <h1 className="text-2xl font-bold">Новый запрос ставки</h1>
        <p className="text-muted-foreground text-sm mt-1">Заполните параметры и система подберёт подрядчиков автоматически</p>
      </div>

      {/* Linked shipment banner */}
      {linkedShipment && (
        <div className="flex items-center gap-3 mb-5 px-4 py-3 bg-primary/5 border border-primary/20 rounded-lg text-sm">
          <Link2 size={15} className="text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="font-medium text-primary">{linkedShipment.orderNumber}</span>
            <span className="text-muted-foreground ml-2">
              {linkedShipment.client} · {linkedShipment.fromCity} → {linkedShipment.toCity}
            </span>
          </div>
          <span className="text-xs text-muted-foreground shrink-0">Данные заполнены из перевозки</span>
        </div>
      )}

      {/* Stepper */}
      <div className="flex items-center mb-8">
        {steps.map(({ n, label, icon: Icon }, i) => (
          <div key={n} className={cn('flex items-center', i < 2 && 'flex-1')}>
            <div className="flex items-center gap-2.5">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold',
                step > n ? 'bg-green-500 text-white' :
                step === n ? 'bg-primary text-primary-foreground' :
                'bg-muted text-muted-foreground'
              )}>
                {step > n ? <Check size={14} /> : <Icon size={14} />}
              </div>
              <span className={cn('text-sm', step === n ? 'font-semibold text-foreground' : 'text-muted-foreground')}>
                {label}
              </span>
            </div>
            {i < 2 && (
              <div className={cn(
                'flex-1 h-px mx-3',
                step > n + 1 ? 'bg-green-500' : step > n ? 'bg-primary/30' : 'bg-border'
              )} />
            )}
          </div>
        ))}
      </div>

      {/* ───── STEP 1 ───── */}
      {step === 1 && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Основные параметры</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Дата запроса">
                <Input type="date" value={form.requestDate} onChange={e => set('requestDate', e.target.value)} />
              </FormField>
              <FormField label="Статус запроса">
                <Select value={form.status} onValueChange={v => v && set('status', v)}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Новый</SelectItem>
                    <SelectItem value="in_progress">В работе</SelectItem>
                    <SelectItem value="completed">Завершён</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-semibold mb-3">Город отправления</p>
              <div className="grid grid-cols-3 gap-4">
                <FormField label="Город *">
                  <Input value={form.fromCity} onChange={e => set('fromCity', e.target.value)} placeholder="Ташкент" />
                </FormField>
                <FormField label="Индекс">
                  <Input value={form.fromIndex} onChange={e => set('fromIndex', e.target.value)} placeholder="100000" />
                </FormField>
                <FormField label="Страна">
                  <Input value={form.fromCountry} onChange={e => set('fromCountry', e.target.value)} placeholder="Узбекистан" />
                </FormField>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-semibold mb-3">Город назначения</p>
              <div className="grid grid-cols-3 gap-4">
                <FormField label="Город *">
                  <Input value={form.toCity} onChange={e => set('toCity', e.target.value)} placeholder="Москва" />
                </FormField>
                <FormField label="Индекс">
                  <Input value={form.toIndex} onChange={e => set('toIndex', e.target.value)} placeholder="101000" />
                </FormField>
                <FormField label="Страна">
                  <Input value={form.toCountry} onChange={e => set('toCountry', e.target.value)} placeholder="Россия" />
                </FormField>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-semibold mb-3">Груз</p>
              <div className="grid grid-cols-3 gap-4">
                <FormField label="Дата погрузки *">
                  <Input type="date" value={form.loadingDate} onChange={e => set('loadingDate', e.target.value)} />
                </FormField>
                <FormField label="Вес брутто (кг) *">
                  <Input type="number" value={form.weightKg} onChange={e => set('weightKg', e.target.value)} placeholder="5000" />
                </FormField>
                <FormField label="Стоимость груза (USD)">
                  <Input type="number" value={form.cargoValueUsd} onChange={e => set('cargoValueUsd', e.target.value)} placeholder="50000" />
                </FormField>
              </div>
              <div className="mt-4">
                <FormField label="Тип груза">
                  <Select value={form.cargoType} onValueChange={v => v && set('cargoType', v)}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">Генеральный</SelectItem>
                      <SelectItem value="bulk">Насыпной</SelectItem>
                      <SelectItem value="liquid">Жидкий</SelectItem>
                      <SelectItem value="oversized">Негабаритный</SelectItem>
                      <SelectItem value="dangerous">Опасный (ADR)</SelectItem>
                      <SelectItem value="refrigerated">Рефрижераторный</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-semibold mb-3">Транспортное средство</p>
              <div className="grid grid-cols-3 gap-4">
                <FormField label="Кол-во ТС">
                  <Input type="number" min={1} value={form.vehicleCount} onChange={e => set('vehicleCount', e.target.value)} />
                </FormField>
                <FormField label="Вид ТС">
                  <Select value={form.vehicleType} onValueChange={v => v && set('vehicleType', v)}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="truck">Фура (20т) — Авто</SelectItem>
                      <SelectItem value="truck_mega">Мега-фура (24т) — Авто</SelectItem>
                      <SelectItem value="isothermal">Изотермический — Авто</SelectItem>
                      <SelectItem value="ref">Рефрижератор — Авто</SelectItem>
                      <SelectItem value="open">Открытый бортовой — Авто</SelectItem>
                      <SelectItem value="tanker">Цистерна — Авто</SelectItem>
                      <SelectItem value="container_20">Контейнер 20' — Море</SelectItem>
                      <SelectItem value="container_40">Контейнер 40' — Море</SelectItem>
                      <SelectItem value="air">Авиагрузовой</SelectItem>
                      <SelectItem value="rail_wagon">Ж/Д вагон</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Способ погрузки">
                  <Select value={form.loadingMethod} onValueChange={v => v && set('loadingMethod', v)}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rear">Задняя</SelectItem>
                      <SelectItem value="side">Боковая</SelectItem>
                      <SelectItem value="top">Верхняя</SelectItem>
                      <SelectItem value="any">Любой</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-semibold mb-3">Таможня и ВЭД</p>
              <div className="mb-4">
                <Label className="mb-2 block text-xs text-muted-foreground">Код ТНВЭД</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {form.hsCodes.map(c => (
                    <Badge key={c} variant="secondary" className="gap-1">
                      {c.split(' - ')[0]}
                      <button onClick={() => toggleHsCode(c)} className="hover:text-destructive ml-1">
                        <X size={11} />
                      </button>
                    </Badge>
                  ))}
                </div>
                <Select onValueChange={(v: unknown) => { const s = v as string; if (s && !form.hsCodes.includes(s)) toggleHsCode(s); }}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Выберите код ТНВЭД..." /></SelectTrigger>
                  <SelectContent>
                    {HS_CODES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Место экспорт. ТО">
                  <Input value={form.exportCustoms} onChange={e => set('exportCustoms', e.target.value)} placeholder="Ташкент, пост №1" />
                </FormField>
                <FormField label="Место импорт. ТО">
                  <Input value={form.importCustoms} onChange={e => set('importCustoms', e.target.value)} placeholder="Москва, СВХ" />
                </FormField>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-semibold mb-3">Условия</p>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <FormField label="Валюта">
                  <Select value={form.currency} onValueChange={v => v && set('currency', v)}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['USD', 'EUR', 'RUB', 'UZS'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Длительность аукциона (мин)">
                  <Input type="number" min={1} value={form.auctionDurationMin} onChange={e => set('auctionDurationMin', e.target.value)} />
                </FormField>
                <FormField label="Инкотермс">
                  <Select value={form.incoterms} onValueChange={v => v && set('incoterms', v)}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Выберите..." /></SelectTrigger>
                    <SelectContent>
                      {['EXW','FCA','FAS','FOB','CFR','CIF','CPT','CIP','DAP','DPU','DDP'].map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Особые условия">
                  <Textarea value={form.specialConditions} onChange={e => set('specialConditions', e.target.value)} placeholder="Температурный режим, страховка..." className="min-h-[80px]" />
                </FormField>
                <FormField label="Комментарий">
                  <Textarea value={form.comment} onChange={e => set('comment', e.target.value)} placeholder="Дополнительная информация..." className="min-h-[80px]" />
                </FormField>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ───── STEP 2 ───── */}
      {step === 2 && (
        <div className="space-y-4">
          {/* Auto-matched */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-primary" />
                  <CardTitle className="text-base">Автоподбор</CardTitle>
                  {autoMatched.length > 0 && (
                    <Badge variant="secondary">{autoMatched.length} подрядчик{autoMatched.length > 1 ? 'а' : ''}</Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {form.fromCountry || form.fromCity} → {form.toCountry || form.toCity} · {vehicleToTransportType(form.vehicleType) === 'auto' ? 'Авто' : vehicleToTransportType(form.vehicleType) === 'rail' ? 'Ж/Д' : vehicleToTransportType(form.vehicleType) === 'air' ? 'Авиа' : 'Море'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Система выбрала подрядчиков по маршруту и типу перевозки. Вы можете снять или добавить.
              </p>
            </CardHeader>
            <CardContent>
              {autoMatched.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Не найдено подрядчиков для этого маршрута и вида ТС.
                  <br />Укажите страны отправления и назначения для автоподбора.
                </div>
              ) : (
                <ContractorTable
                  items={autoMatched}
                  selected={form.selectedContractors}
                  channels={form.channels}
                  onToggle={toggleContractor}
                  onChannelChange={(id, v) => set('channels', { ...form.channels, [id]: v })}
                  showReasons
                />
              )}

              {/* Partial matches */}
              {partialMatched.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Частичное совпадение</p>
                  <ContractorTable
                    items={partialMatched}
                    selected={form.selectedContractors}
                    channels={form.channels}
                    onToggle={toggleContractor}
                    onChannelChange={(id, v) => set('channels', { ...form.channels, [id]: v })}
                    showReasons
                    dimmed
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Manual selection */}
          <Card>
            <button
              className="w-full"
              onClick={() => setShowManual(v => !v)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck size={16} className="text-muted-foreground" />
                    <CardTitle className="text-sm font-medium text-muted-foreground">Выбрать вручную</CardTitle>
                    {restContractors.length > 0 && (
                      <Badge variant="outline" className="text-xs">{restContractors.length} других</Badge>
                    )}
                  </div>
                  {showManual ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
                </div>
              </CardHeader>
            </button>
            {showManual && (
              <CardContent className="pt-0">
                <ContractorTable
                  items={restContractors}
                  selected={form.selectedContractors}
                  channels={form.channels}
                  onToggle={toggleContractor}
                  onChannelChange={(id, v) => set('channels', { ...form.channels, [id]: v })}
                />
              </CardContent>
            )}
          </Card>

          {/* Summary bar */}
          {form.selectedContractors.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 bg-primary/5 border border-primary/20 rounded-lg text-sm">
              <div className="flex items-center gap-2 text-primary font-medium">
                <Check size={14} />
                Выбрано: {form.selectedContractors.length} подрядчик{form.selectedContractors.length > 1 ? 'а' : ''}
              </div>
              <button
                onClick={() => { set('selectedContractors', []); set('channels', {}); }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Снять всё
              </button>
            </div>
          )}
        </div>
      )}

      {/* ───── STEP 3 ───── */}
      {step === 3 && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Параметры отправления</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
                <SummaryRow label="Дата запроса" value={form.requestDate} />
                <SummaryRow label="Статус" value={{ new: 'Новый', in_progress: 'В работе', completed: 'Завершён' }[form.status] || form.status} />
                <SummaryRow label="Отправление" value={[form.fromCity, form.fromIndex, form.fromCountry].filter(Boolean).join(', ')} />
                <SummaryRow label="Назначение" value={[form.toCity, form.toIndex, form.toCountry].filter(Boolean).join(', ')} />
                <SummaryRow label="Дата погрузки" value={form.loadingDate} />
                <SummaryRow label="Вес (кг)" value={form.weightKg} />
                {form.cargoValueUsd && <SummaryRow label="Стоимость" value={`${form.cargoValueUsd} ${form.currency}`} />}
                <SummaryRow label="Вид ТС" value={`${form.vehicleCount} × ${form.vehicleType}`} />
                {form.incoterms && <SummaryRow label="Инкотермс" value={form.incoterms} />}
                {form.auctionDurationMin && <SummaryRow label="Аукцион" value={`${form.auctionDurationMin} мин`} />}
              </div>
              {form.hsCodes.length > 0 && (
                <div className="mt-3 pt-3 border-t flex flex-wrap gap-1">
                  {form.hsCodes.map(c => <Badge key={c} variant="outline" className="text-xs">{c.split(' - ')[0]}</Badge>)}
                </div>
              )}
              {(form.specialConditions || form.comment) && (
                <div className="mt-3 pt-3 border-t text-sm space-y-1">
                  {form.specialConditions && <p><span className="text-muted-foreground">Особые условия: </span>{form.specialConditions}</p>}
                  {form.comment && <p><span className="text-muted-foreground">Комментарий: </span>{form.comment}</p>}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Получатели — {form.selectedContractors.length} подрядчик{form.selectedContractors.length > 1 ? 'а' : ''}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {CONTRACTORS.filter(c => form.selectedContractors.includes(c.id)).map(c => {
                const m = matched.find(x => x.contractor.id === c.id);
                return (
                  <div key={c.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{c.name}</p>
                        {m?.matchType === 'auto' && (
                          <Badge variant="secondary" className="text-xs gap-1 py-0">
                            <Sparkles size={9} /> авто
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{c.country}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {form.channels[c.id] === 'both' ? 'Email + Telegram' :
                       form.channels[c.id] === 'email' ? 'Email' : 'Telegram'}
                    </Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-6">
        <Button variant="outline" onClick={() => step > 1 ? setStep((step - 1) as Step) : navigate(-1)}>
          <ChevronLeft size={15} /> Назад
        </Button>

        {step === 1 && (
          <Button onClick={handleGoStep2} disabled={!canNext1}>
            Далее <ChevronRight size={15} />
          </Button>
        )}
        {step === 2 && (
          <Button onClick={() => setStep(3)} disabled={!canNext2}>
            Далее <ChevronRight size={15} />
          </Button>
        )}
        {step === 3 && !sendResult && (
          <Button onClick={handleSend} disabled={sending}>
            <Send size={15} /> {sending ? 'Отправляем...' : `Отправить ${form.selectedContractors.length} запрос${form.selectedContractors.length > 1 ? 'а' : ''}`}
          </Button>
        )}
        {step === 3 && sendResult && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-green-600 font-semibold">✓ Отправлено: {sendResult.sent}</span>
            {sendResult.failed > 0 && <span className="text-sm text-destructive">✗ Ошибок: {sendResult.failed}</span>}
            <Button onClick={() => navigate('/rate-requests')}>Готово</Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface ContractorTableProps {
  items: ReturnType<typeof matchContractors>;
  selected: string[];
  channels: Record<string, 'email' | 'telegram' | 'both'>;
  onToggle: (id: string) => void;
  onChannelChange: (id: string, v: 'email' | 'telegram' | 'both') => void;
  showReasons?: boolean;
  dimmed?: boolean;
}

function ContractorTable({ items, selected, channels, onToggle, onChannelChange, showReasons, dimmed }: ContractorTableProps) {
  if (items.length === 0) return null;
  return (
    <div className="rounded-lg border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/40">
          <tr>
            <th className="w-10 p-2.5 text-left"></th>
            <th className="p-2.5 text-left font-medium text-muted-foreground">Компания</th>
            <th className="p-2.5 text-left font-medium text-muted-foreground hidden md:table-cell">Рейтинг</th>
            <th className="p-2.5 text-left font-medium text-muted-foreground hidden md:table-cell">Транспорт</th>
            {showReasons && <th className="p-2.5 text-left font-medium text-muted-foreground hidden lg:table-cell">Почему подобран</th>}
            <th className="p-2.5 text-left font-medium text-muted-foreground">Канал</th>
          </tr>
        </thead>
        <tbody>
          {items.map(({ contractor: c, reasons, score }) => {
            const checked = selected.includes(c.id);
            return (
              <tr
                key={c.id}
                className={cn(
                  'border-t cursor-pointer transition-colors',
                  checked ? 'bg-primary/5' : dimmed ? 'opacity-60 hover:opacity-100 hover:bg-muted/20' : 'hover:bg-muted/20'
                )}
                onClick={() => onToggle(c.id)}
              >
                <td className="p-2.5 text-center">
                  <div className={cn(
                    'w-4 h-4 rounded border-2 mx-auto flex items-center justify-center',
                    checked ? 'border-primary bg-primary' : 'border-muted-foreground/40'
                  )}>
                    {checked && <Check size={10} className="text-white" />}
                  </div>
                </td>
                <td className="p-2.5">
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.country} · {c.totalRates} перевозок</p>
                </td>
                <td className="p-2.5 hidden md:table-cell">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star size={12} className="fill-amber-400" />
                    <span className="text-xs font-medium text-foreground">{c.rating}</span>
                  </div>
                </td>
                <td className="p-2.5 hidden md:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {c.transportTypes.map(t => (
                      <Badge key={t} variant="secondary" className="text-xs py-0">
                        {TRANSPORT_LABELS[t]}
                      </Badge>
                    ))}
                  </div>
                </td>
                {showReasons && (
                  <td className="p-2.5 hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {reasons.map(r => (
                        <span key={r} className="text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded">{r}</span>
                      ))}
                    </div>
                  </td>
                )}
                <td className="p-2.5" onClick={e => e.stopPropagation()}>
                  {checked ? (
                    <Select
                      value={channels[c.id] || 'telegram'}
                      onValueChange={v => v && onChannelChange(c.id, v as 'email' | 'telegram' | 'both')}
                    >
                      <SelectTrigger className="h-7 text-xs w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="telegram">Telegram</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="both">Оба</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
