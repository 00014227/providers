import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, FileText } from 'lucide-react';
import { SHIPMENTS } from '../data/mock';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ShipmentForm {
  client: string;
  fromCity: string; fromIndex: string; fromCountry: string;
  toCity: string; toIndex: string; toCountry: string;
  loadingDate: string;
  weightKg: string;
  cargoValueUsd: string;
  cargoType: string;
  vehicleType: string;
  vehicleCount: string;
  loadingMethod: string;
  exportCustoms: string;
  importCustoms: string;
  incoterms: string;
  currency: string;
  specialConditions: string;
  comment: string;
}

export default function NewShipmentPage() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [newId, setNewId] = useState('');
  const [form, setForm] = useState<ShipmentForm>({
    client: '',
    fromCity: '', fromIndex: '', fromCountry: '',
    toCity: '', toIndex: '', toCountry: '',
    loadingDate: '', weightKg: '', cargoValueUsd: '',
    cargoType: 'general', vehicleType: 'truck', vehicleCount: '1', loadingMethod: 'rear',
    exportCustoms: '', importCustoms: '',
    incoterms: '', currency: 'USD',
    specialConditions: '', comment: '',
  });

  const set = <K extends keyof ShipmentForm>(key: K, val: string) =>
    setForm(f => ({ ...f, [key]: val }));

  const canSave = form.client && form.fromCity && form.toCity && form.loadingDate && form.weightKg;

  const handleSave = (andRequest = false) => {
    const nextNum = String(SHIPMENTS.length + 43).padStart(3, '0');
    const id = `s${Date.now()}`;
    const orderNumber = `ORD-2026-${nextNum}`;

    SHIPMENTS.unshift({
      id,
      orderNumber,
      client: form.client,
      fromCity: form.fromCity, fromIndex: form.fromIndex, fromCountry: form.fromCountry,
      toCity: form.toCity, toIndex: form.toIndex, toCountry: form.toCountry,
      loadingDate: form.loadingDate,
      weightKg: parseFloat(form.weightKg) || 0,
      cargoValueUsd: form.cargoValueUsd ? parseFloat(form.cargoValueUsd) : undefined,
      cargoType: form.cargoType,
      vehicleType: form.vehicleType,
      vehicleCount: parseInt(form.vehicleCount) || 1,
      loadingMethod: form.loadingMethod,
      exportCustoms: form.exportCustoms || undefined,
      importCustoms: form.importCustoms || undefined,
      incoterms: form.incoterms || undefined,
      currency: form.currency,
      specialConditions: form.specialConditions || undefined,
      comment: form.comment || undefined,
      status: 'new',
      createdAt: new Date().toISOString().split('T')[0],
    });

    if (andRequest) {
      navigate(`/rate-requests/new?shipmentId=${id}`);
    } else {
      setNewId(id);
      setSaved(true);
    }
  };

  if (saved) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <Save size={20} className="text-green-600" />
        </div>
        <h2 className="text-lg font-semibold mb-2">Перевозка создана</h2>
        <p className="text-sm text-muted-foreground mb-6">Перевозка сохранена и доступна в списке.</p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => navigate('/shipments')}>К списку перевозок</Button>
          <Button onClick={() => navigate(`/rate-requests/new?shipmentId=${newId}`)}>
            <FileText size={14} /> Запросить ставки
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-10">
      <div className="mb-6">
        <button onClick={() => navigate('/shipments')} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-3">
          <ChevronLeft size={14} /> Перевозки
        </button>
        <h1 className="text-2xl font-bold">Новая перевозка</h1>
        <p className="text-sm text-muted-foreground mt-1">Заполните данные для создания перевозки</p>
      </div>

      <div className="space-y-5">
        <Card>
          <CardHeader className="pb-4"><CardTitle className="text-base">Клиент и маршрут</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <FormField label="Клиент *">
              <Input value={form.client} onChange={e => set('client', e.target.value)} placeholder="Название компании клиента" />
            </FormField>

            <div className="grid grid-cols-3 gap-3">
              <FormField label="Город отправления *">
                <Input value={form.fromCity} onChange={e => set('fromCity', e.target.value)} placeholder="Ташкент" />
              </FormField>
              <FormField label="Индекс">
                <Input value={form.fromIndex} onChange={e => set('fromIndex', e.target.value)} placeholder="100000" />
              </FormField>
              <FormField label="Страна">
                <Input value={form.fromCountry} onChange={e => set('fromCountry', e.target.value)} placeholder="Узбекистан" />
              </FormField>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <FormField label="Город назначения *">
                <Input value={form.toCity} onChange={e => set('toCity', e.target.value)} placeholder="Москва" />
              </FormField>
              <FormField label="Индекс">
                <Input value={form.toIndex} onChange={e => set('toIndex', e.target.value)} placeholder="101000" />
              </FormField>
              <FormField label="Страна">
                <Input value={form.toCountry} onChange={e => set('toCountry', e.target.value)} placeholder="Россия" />
              </FormField>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4"><CardTitle className="text-base">Груз и ТС</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
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

            <div className="grid grid-cols-2 gap-3">
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
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Кол-во ТС">
                <Input type="number" min={1} value={form.vehicleCount} onChange={e => set('vehicleCount', e.target.value)} />
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4"><CardTitle className="text-base">Таможня и условия</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
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
              <FormField label="Валюта">
                <Select value={form.currency} onValueChange={v => v && set('currency', v)}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['USD','EUR','RUB','UZS'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormField>
              <div />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Место экспорт. ТО">
                <Input value={form.exportCustoms} onChange={e => set('exportCustoms', e.target.value)} placeholder="Ташкент, пост №1" />
              </FormField>
              <FormField label="Место импорт. ТО">
                <Input value={form.importCustoms} onChange={e => set('importCustoms', e.target.value)} placeholder="Москва, СВХ" />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Особые условия">
                <Textarea value={form.specialConditions} onChange={e => set('specialConditions', e.target.value)} placeholder="Температура, страховка..." className="min-h-[72px]" />
              </FormField>
              <FormField label="Комментарий">
                <Textarea value={form.comment} onChange={e => set('comment', e.target.value)} placeholder="Дополнительная информация..." className="min-h-[72px]" />
              </FormField>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between mt-6">
        <Button variant="outline" onClick={() => navigate('/shipments')}>
          <ChevronLeft size={15} /> Отмена
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => handleSave(false)} disabled={!canSave}>
            <Save size={14} /> Сохранить
          </Button>
          <Button onClick={() => handleSave(true)} disabled={!canSave}>
            <FileText size={14} /> Сохранить и запросить ставки
          </Button>
        </div>
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
