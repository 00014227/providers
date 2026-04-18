import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Check, MapPin, Package, Users, Send, Eye, X } from 'lucide-react';
import { CONTRACTORS, TransportType, TRANSPORT_LABELS } from '../data/mock';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { cn } from '../lib/utils';

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

const TRANSPORT_TYPES: TransportType[] = ['auto', 'rail', 'air', 'sea'];

export default function NewRateRequestPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<Form>({
    requestDate: new Date().toISOString().split('T')[0],
    status: 'new',
    fromCity: '',
    fromIndex: '',
    fromCountry: '',
    toCity: '',
    toIndex: '',
    toCountry: '',
    loadingDate: '',
    weightKg: '',
    cargoValueUsd: '',
    cargoType: 'general',
    vehicleCount: '1',
    vehicleType: 'truck',
    loadingMethod: 'rear',
    hsCodes: [],
    exportCustoms: '',
    importCustoms: '',
    incoterms: '',
    currency: 'USD',
    auctionDurationMin: '60',
    specialConditions: '',
    comment: '',
    selectedContractors: [],
    channels: {},
  });

  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ sent: number; failed: number } | null>(null);

  const set = <K extends keyof Form>(key: K, val: Form[K]) =>
    setForm(f => ({ ...f, [key]: val }));

  const toggleContractor = (id: string) => {
    const next = form.selectedContractors.includes(id)
      ? form.selectedContractors.filter(c => c !== id)
      : [...form.selectedContractors, id];
    set('selectedContractors', next);
    if (!form.channels[id]) set('channels', { ...form.channels, [id]: 'telegram' });
  };

  const toggleHsCode = (code: string) => {
    const next = form.hsCodes.includes(code)
      ? form.hsCodes.filter(c => c !== code)
      : [...form.hsCodes, code];
    set('hsCodes', next);
  };

  const canNext1 = form.fromCity && form.toCity && form.loadingDate && form.weightKg;
  const canNext2 = form.selectedContractors.length > 0;

  const buildMessage = (contractorName: string) => {
    return [
      `📦 *Запрос ставки — TransAsia Logistics*`,
      ``,
      `🗺 Маршрут: *${form.fromCity}${form.fromCountry ? `, ${form.fromCountry}` : ''} → ${form.toCity}${form.toCountry ? `, ${form.toCountry}` : ''}*`,
      `📅 Дата погрузки: ${form.loadingDate}`,
      `⚖️ Вес: ${form.weightKg} кг`,
      form.cargoValueUsd ? `💰 Стоимость груза: ${form.cargoValueUsd} ${form.currency}` : '',
      `🚛 Вид ТС: ${form.vehicleType}, кол-во: ${form.vehicleCount}`,
      form.incoterms ? `📋 Инкотермс: ${form.incoterms}` : '',
      form.specialConditions ? `⚠️ Особые условия: ${form.specialConditions}` : '',
      form.comment ? `💬 ${form.comment}` : '',
      ``,
      `Пожалуйста, отправьте вашу ставку в ответ на это сообщение.`,
    ].filter(Boolean).join('\n');
  };

  const handleSend = async () => {
    setSending(true);
    try {
      const selectedList = CONTRACTORS.filter(c => form.selectedContractors.includes(c.id));
      const recipients = selectedList.flatMap(c =>
        c.contacts
          .filter(ct => ct.telegram)
          .map(ct => ({ username: ct.telegram!, message: buildMessage(c.name) }))
      );

      if (recipients.length === 0) {
        alert('У выбранных подрядчиков нет Telegram контактов');
        setSending(false);
        return;
      }

      const res = await fetch('http://localhost:3000/api/telegram/send-rate-request', {
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
        <p className="text-muted-foreground text-sm mt-1">Заполните параметры отправления и выберите подрядчиков</p>
      </div>

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

      {/* Step 1 — Cargo params */}
      {step === 1 && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Основные параметры</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Row: Дата запроса + Статус */}
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Дата запроса">
                <Input type="date" value={form.requestDate} onChange={e => set('requestDate', e.target.value)} />
              </FormField>
              <FormField label="Статус запроса">
                <Select value={form.status} onValueChange={v => set('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Новый</SelectItem>
                    <SelectItem value="in_progress">В работе</SelectItem>
                    <SelectItem value="completed">Завершён</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            {/* Divider */}
            <div className="border-t pt-4">
              <p className="text-sm font-semibold text-foreground mb-3">Город отправления</p>
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
              <p className="text-sm font-semibold text-foreground mb-3">Город назначения</p>
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

            {/* Дата погрузки / Вес / Стоимость */}
            <div className="border-t pt-4">
              <p className="text-sm font-semibold text-foreground mb-3">Груз</p>
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
                  <Select value={form.cargoType} onValueChange={v => set('cargoType', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
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

            {/* ТС */}
            <div className="border-t pt-4">
              <p className="text-sm font-semibold text-foreground mb-3">Транспортное средство</p>
              <div className="grid grid-cols-3 gap-4">
                <FormField label="Кол-во ТС">
                  <Input type="number" min={1} value={form.vehicleCount} onChange={e => set('vehicleCount', e.target.value)} placeholder="1" />
                </FormField>
                <FormField label="Вид ТС">
                  <Select value={form.vehicleType} onValueChange={v => set('vehicleType', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="truck">Фура (20т)</SelectItem>
                      <SelectItem value="truck_mega">Мега-фура (24т)</SelectItem>
                      <SelectItem value="isothermal">Изотермический</SelectItem>
                      <SelectItem value="ref">Рефрижератор</SelectItem>
                      <SelectItem value="open">Открытый бортовой</SelectItem>
                      <SelectItem value="tanker">Цистерна</SelectItem>
                      <SelectItem value="container_20">Контейнер 20'</SelectItem>
                      <SelectItem value="container_40">Контейнер 40'</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Способ погрузки">
                  <Select value={form.loadingMethod} onValueChange={v => set('loadingMethod', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rear">Задняя погрузка</SelectItem>
                      <SelectItem value="side">Боковая погрузка</SelectItem>
                      <SelectItem value="top">Верхняя погрузка</SelectItem>
                      <SelectItem value="any">Любой</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
            </div>

            {/* Таможня */}
            <div className="border-t pt-4">
              <p className="text-sm font-semibold text-foreground mb-3">Таможня и ВЭД</p>
              <div className="mb-4">
                <Label className="mb-2 block">Код ТНВЭД</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {form.hsCodes.map(c => (
                    <Badge key={c} variant="secondary" className="gap-1 pr-1">
                      {c.split(' - ')[0]}
                      <button onClick={() => toggleHsCode(c)} className="hover:text-destructive">
                        <X size={12} />
                      </button>
                    </Badge>
                  ))}
                </div>
                <Select onValueChange={v => { if (!form.hsCodes.includes(v)) toggleHsCode(v); }}>
                  <SelectTrigger><SelectValue placeholder="Выберите код ТНВЭД..." /></SelectTrigger>
                  <SelectContent>
                    {HS_CODES.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
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

            {/* Условия */}
            <div className="border-t pt-4">
              <p className="text-sm font-semibold text-foreground mb-3">Условия</p>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <FormField label="Валюта">
                  <Select value={form.currency} onValueChange={v => set('currency', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="RUB">RUB</SelectItem>
                      <SelectItem value="UZS">UZS</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Длительность аукциона (мин)">
                  <Input type="number" min={1} value={form.auctionDurationMin} onChange={e => set('auctionDurationMin', e.target.value)} placeholder="60" />
                </FormField>
                <FormField label="Инкотермс">
                  <Select value={form.incoterms} onValueChange={v => set('incoterms', v)}>
                    <SelectTrigger><SelectValue placeholder="Выберите..." /></SelectTrigger>
                    <SelectContent>
                      {['EXW', 'FCA', 'FAS', 'FOB', 'CFR', 'CIF', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP'].map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Особые условия">
                  <Textarea
                    value={form.specialConditions}
                    onChange={e => set('specialConditions', e.target.value)}
                    placeholder="Температурный режим, страховка, etc."
                    className="min-h-[80px]"
                  />
                </FormField>
                <FormField label="Комментарий">
                  <Textarea
                    value={form.comment}
                    onChange={e => set('comment', e.target.value)}
                    placeholder="Дополнительная информация..."
                    className="min-h-[80px]"
                  />
                </FormField>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2 — Contractors */}
      {step === 2 && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Выбор подрядчиков</CardTitle>
            <p className="text-sm text-muted-foreground">Выберите подрядчиков и канал отправки запроса</p>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="w-10 p-3 text-left"></th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Компания</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Страна</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Транспорт</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Канал</th>
                  </tr>
                </thead>
                <tbody>
                  {CONTRACTORS.map(c => {
                    const checked = form.selectedContractors.includes(c.id);
                    return (
                      <tr
                        key={c.id}
                        className={cn(
                          'border-t cursor-pointer transition-colors',
                          checked ? 'bg-primary/5' : 'hover:bg-muted/30'
                        )}
                        onClick={() => toggleContractor(c.id)}
                      >
                        <td className="p-3 text-center">
                          <div className={cn(
                            'w-4 h-4 rounded border-2 mx-auto flex items-center justify-center',
                            checked ? 'border-primary bg-primary' : 'border-muted-foreground'
                          )}>
                            {checked && <Check size={10} className="text-white" />}
                          </div>
                        </td>
                        <td className="p-3 font-medium">{c.name}</td>
                        <td className="p-3 text-muted-foreground">{c.country}</td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {c.transportTypes.map(t => (
                              <Badge key={t} variant="secondary" className="text-xs py-0">
                                {TRANSPORT_LABELS[t]}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="p-3" onClick={e => e.stopPropagation()}>
                          {checked && (
                            <Select
                              value={form.channels[c.id] || 'telegram'}
                              onValueChange={v => set('channels', { ...form.channels, [c.id]: v as any })}
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
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {form.selectedContractors.length > 0 && (
              <div className="mt-3 px-4 py-2.5 bg-primary/10 rounded-lg text-sm text-primary font-medium">
                Выбрано подрядчиков: {form.selectedContractors.length}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3 — Confirm */}
      {step === 3 && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Параметры отправления</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                <SummaryRow label="Дата запроса" value={form.requestDate} />
                <SummaryRow label="Статус" value={{ new: 'Новый', in_progress: 'В работе', completed: 'Завершён' }[form.status] || form.status} />
                <SummaryRow label="Отправление" value={[form.fromCity, form.fromIndex, form.fromCountry].filter(Boolean).join(', ')} />
                <SummaryRow label="Назначение" value={[form.toCity, form.toIndex, form.toCountry].filter(Boolean).join(', ')} />
                <SummaryRow label="Дата погрузки" value={form.loadingDate} />
                <SummaryRow label="Вес (кг)" value={form.weightKg} />
                {form.cargoValueUsd && <SummaryRow label="Стоимость груза" value={`${form.cargoValueUsd} ${form.currency}`} />}
                <SummaryRow label="Тип груза" value={form.cargoType} />
                <SummaryRow label="Кол-во ТС / Вид" value={`${form.vehicleCount} × ${form.vehicleType}`} />
                <SummaryRow label="Способ погрузки" value={form.loadingMethod} />
                {form.incoterms && <SummaryRow label="Инкотермс" value={form.incoterms} />}
                {form.auctionDurationMin && <SummaryRow label="Длительность аукциона" value={`${form.auctionDurationMin} мин`} />}
                {form.exportCustoms && <SummaryRow label="Экспорт. ТО" value={form.exportCustoms} />}
                {form.importCustoms && <SummaryRow label="Импорт. ТО" value={form.importCustoms} />}
              </div>
              {form.hsCodes.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <span className="text-xs text-muted-foreground">Коды ТНВЭД: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {form.hsCodes.map(c => <Badge key={c} variant="outline" className="text-xs">{c.split(' - ')[0]}</Badge>)}
                  </div>
                </div>
              )}
              {form.specialConditions && (
                <div className="mt-3 pt-3 border-t text-sm">
                  <span className="text-muted-foreground">Особые условия: </span>{form.specialConditions}
                </div>
              )}
              {form.comment && (
                <div className="mt-2 text-sm">
                  <span className="text-muted-foreground">Комментарий: </span>{form.comment}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Получатели ({form.selectedContractors.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {CONTRACTORS.filter(c => form.selectedContractors.includes(c.id)).map(c => (
                <div key={c.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.country}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {form.channels[c.id] === 'both' ? 'Email + Telegram' :
                     form.channels[c.id] === 'email' ? 'Email' : 'Telegram'}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Footer actions */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => step > 1 ? setStep((step - 1) as Step) : navigate(-1)}
        >
          <ChevronLeft size={15} /> Назад
        </Button>

        {step < 3 ? (
          <Button
            onClick={() => setStep((step + 1) as Step)}
            disabled={step === 1 ? !canNext1 : !canNext2}
          >
            Далее <ChevronRight size={15} />
          </Button>
        ) : sendResult ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-green-600 font-semibold">✓ Отправлено: {sendResult.sent}</span>
            {sendResult.failed > 0 && (
              <span className="text-sm text-destructive">✗ Ошибок: {sendResult.failed}</span>
            )}
            <Button onClick={() => navigate('/rate-requests')}>Готово</Button>
          </div>
        ) : (
          <Button onClick={handleSend} disabled={sending}>
            <Send size={15} /> {sending ? 'Отправляем...' : 'Отправить запросы'}
          </Button>
        )}
      </div>
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
