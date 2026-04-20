import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Trophy, Copy, CheckCircle2, Send, Loader2, Bell } from 'lucide-react';
import { RATE_REQUESTS, TRANSPORT_LABELS, CONTRACTORS, RateResponse } from '../data/mock';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-blue-50 text-blue-700 border-blue-200',
  closed: 'bg-slate-100 text-slate-600 border-slate-200',
};

const RESP_STATUS_COLORS: Record<RateResponse['status'], string> = {
  responded: 'bg-green-50 text-green-700 border-green-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  declined: 'bg-red-50 text-red-700 border-red-200',
  winner: 'bg-purple-50 text-purple-700 border-purple-200',
};

const RESP_STATUS_LABELS: Record<RateResponse['status'], string> = {
  responded: 'Ответил',
  pending: 'Ожидает',
  declined: 'Отказался',
  winner: 'Победитель',
};

export default function RateRequestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const rr = RATE_REQUESTS.find(r => r.id === id);
  const [winnerId, setWinnerId] = useState(rr?.winnerId || '');
  const [copied, setCopied] = useState(false);
  const [tgSending, setTgSending] = useState(false);
  const [tgResult, setTgResult] = useState<{ sent: number; failed: number } | null>(null);
  const baseResponses = rr?.responses ?? [];
  const [extraResponses, setExtraResponses] = useState<typeof baseResponses>([]);
  const responses = [...baseResponses, ...extraResponses];
  const seenIds = useRef<Set<string>>(new Set(baseResponses.map(r => r.id)));
  const [newIds, setNewIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`https://165-245-217-29.nip.io/api/telegram/responses/${rr?.token}`);
        const data: typeof baseResponses = await res.json();
        setExtraResponses(data);
        const fresh = data.filter(r => !seenIds.current.has(r.id));
        if (fresh.length > 0) {
          fresh.forEach(r => seenIds.current.add(r.id));
          setNewIds(prev => new Set([...prev, ...fresh.map(r => r.id)]));
        }
      } catch {}
    };
    check();
    const interval = setInterval(check, 4000);
    return () => clearInterval(interval);
  }, [id]);

  if (!rr) {
    return (
      <div className="text-center py-24 text-muted-foreground text-sm">
        Запрос не найден
        <br />
        <Button variant="link" onClick={() => navigate('/rate-requests')}>← Назад к списку</Button>
      </div>
    );
  }

  const publicLink = `${window.location.origin}/rate/${rr.token}`;
  const copyLink = () => {
    navigator.clipboard.writeText(publicLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectWinner = (respId: string) => {
    setWinnerId(respId);
  };

  const sendViaTelegram = async () => {
    const recipients = invitedContractors
      .flatMap(c => c.contacts.filter(ct => ct.telegram).map(ct => ({
        username: ct.telegram!,
        message: `Добрый день, ${ct.name.split(' ')[0]}! 👋\n\nКак вы поживаете? Надеюсь, всё хорошо.\n\nХотели бы обратиться к вам с небольшой просьбой — у нас появился груз, и мы в первую очередь думаем о вас. Не могли бы вы подсказать вашу ставку?\n\n📍 Маршрут: ${rr.from} → ${rr.to}\n🚛 Транспорт: ${TRANSPORT_LABELS[rr.transportType]}\n📅 Дата погрузки: ${rr.loadingDate}\n⚖️ Вес: ${rr.weight.toLocaleString()} кг${rr.volume ? `, ${rr.volume} м³` : ''}${rr.comment ? `\n\n💬 ${rr.comment}` : ''}\n\nЕсли вам удобно — можете оставить ставку здесь: ${window.location.origin}/rate/${rr.token}\n\nБудем ждать до ${rr.deadline}. Заранее большое спасибо! 🙏`,
      })));

    if (recipients.length === 0) {
      alert('У приглашённых подрядчиков нет Telegram-контактов');
      return;
    }

    setTgSending(true);
    setTgResult(null);
    try {
      const res = await fetch('https://165-245-217-29.nip.io/api/telegram/send-rate-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipients }),
      });
      const data = await res.json();
      setTgResult({ sent: data.sent, failed: data.failed });
    } catch {
      setTgResult({ sent: 0, failed: recipients.length });
    } finally {
      setTgSending(false);
    }
  };

  // Build full contractor rows: invited but not responded = pending row
  const invitedContractors = CONTRACTORS.filter(c => rr.invitedContractors.includes(c.id));
  const tableRows = invitedContractors.map(c => {
    const resp = responses.find(r => r.contractorId === c.id);
    return { contractor: c, resp };
  });
  // Rows from unknown contractors (submitted via public link without contractor ID)
  const unknownRows = responses.filter(r => !rr.invitedContractors.includes(r.contractorId));

  const fields: { label: string; value: React.ReactNode }[] = [
    { label: 'Дата запроса', value: rr.createdAt },
    { label: 'Город отправления', value: rr.from },
    { label: 'Город назначения', value: rr.to },
    { label: 'Дата погрузки', value: rr.loadingDate },
    { label: 'Вид транспорта', value: TRANSPORT_LABELS[rr.transportType] },
    { label: 'Дедлайн ответа', value: rr.deadline },
    { label: 'Вес груза', value: `${rr.weight.toLocaleString()} кг` },
    { label: 'Объём', value: `${rr.volume} м³` },
    { label: 'Статус запроса', value: (
      <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border', STATUS_COLORS[rr.status])}>
        {rr.status === 'open' ? 'Открыт' : 'Закрыт'}
      </span>
    )},
    { label: 'Победитель', value: winnerId
        ? (rr.responses.find(r => r.id === winnerId)?.contractorName ?? '—')
        : '—'
    },
    { label: 'Приглашено подрядчиков', value: rr.invitedContractors.length },
    { label: 'Получено ответов', value: rr.responses.length },
    { label: 'Комментарий', value: rr.comment || '—' },
    { label: 'Публичная ссылка', value: (
      <button
        onClick={copyLink}
        className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 underline underline-offset-2"
      >
        {copied ? <CheckCircle2 size={12} className="text-green-600" /> : <Copy size={12} />}
        {copied ? 'Скопировано' : 'Скопировать ссылку'}
      </button>
    )},
  ];

  return (
    <div className="max-w-5xl mx-auto pb-10">
      {/* Back */}
      <button
        onClick={() => navigate('/rate-requests')}
        className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-4"
      >
        <ChevronLeft size={14} /> Запросы ставок
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold font-mono mb-1">{rr.from} → {rr.to}</h1>
          <p className="text-sm text-muted-foreground">
            {TRANSPORT_LABELS[rr.transportType]} · Создан {rr.createdAt}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border',
            STATUS_COLORS[rr.status]
          )}>
            {rr.status === 'open' ? 'Открыт' : 'Закрыт'}
          </span>
          {winnerId && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
              <Trophy size={12} /> Победитель выбран
            </span>
          )}
          <Button onClick={sendViaTelegram} disabled={tgSending} className="gap-1.5">
            {tgSending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            Отправить в Telegram
          </Button>
          {tgResult && (
            <span className={cn(
              'text-xs font-medium px-2.5 py-1 rounded-full border',
              tgResult.failed === 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
            )}>
              {tgResult.failed === 0 ? `✓ Отправлено ${tgResult.sent}` : `${tgResult.sent} ок · ${tgResult.failed} ошибок`}
            </span>
          )}
        </div>
      </div>

      {/* Info grid */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Параметры запроса</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-4">
            {fields.map(f => (
              <div key={f.label}>
                <p className="text-xs text-muted-foreground mb-0.5">{f.label}</p>
                <p className="text-sm font-medium">{f.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contractor requests table */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            Запросы подрядчикам
            <span className="text-muted-foreground font-normal">
              ({responses.length}/{rr.invitedContractors.length} ответов)
            </span>
            {newIds.size > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200 animate-pulse">
                <Bell size={11} /> {newIds.size} новый ответ
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5 whitespace-nowrap">Подрядчик</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5 whitespace-nowrap">Дата запроса</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-2.5 whitespace-nowrap">Ставка</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-2.5 whitespace-nowrap">Транзит (дни)</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5 whitespace-nowrap">Срок действия ставки</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5 whitespace-nowrap">Комментарий</th>
                  <th className="text-center text-xs font-medium text-muted-foreground px-4 py-2.5 whitespace-nowrap">Рейтинг</th>
                  <th className="text-center text-xs font-medium text-muted-foreground px-4 py-2.5 whitespace-nowrap">Статус</th>
                  <th className="text-center text-xs font-medium text-muted-foreground px-4 py-2.5 whitespace-nowrap">Действие</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map(({ contractor: c, resp }) => {
                  const isWinner = resp && winnerId === resp.id;
                  return (
                    <tr
                      key={c.id}
                      className={cn(
                        'border-b last:border-0 transition-colors',
                        isWinner ? 'bg-purple-50/60' :
                        resp && newIds.has(resp.id) ? 'bg-green-50/70' :
                        'hover:bg-muted/20'
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {isWinner && <Trophy size={12} className="text-purple-600 shrink-0" />}
                          <span className="font-medium">{c.name}</span>
                          {resp && newIds.has(resp.id) && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-500 text-white">NEW</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{c.country}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                        {resp
                          ? new Date(resp.respondedAt).toLocaleDateString('ru', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
                          : rr.createdAt
                        }
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {resp ? (
                          <span className="font-semibold">{resp.amount.toLocaleString()} {resp.currency}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {resp ? (
                          <span>{resp.transitDays}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {resp ? `${rr.deadline}` : '—'}
                      </td>
                      <td className="px-4 py-3 max-w-[200px]">
                        {resp?.comment ? (
                          <p className="text-xs text-muted-foreground truncate" title={resp.comment}>{resp.comment}</p>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-xs font-medium">{c.rating.toFixed(1)}</span>
                        <span className="text-muted-foreground text-xs"> ★</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {resp ? (
                          <span className={cn(
                            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
                            RESP_STATUS_COLORS[isWinner ? 'winner' : resp.status]
                          )}>
                            {RESP_STATUS_LABELS[isWinner ? 'winner' : resp.status]}
                          </span>
                        ) : (
                          <span className={cn(
                            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
                            RESP_STATUS_COLORS['pending']
                          )}>
                            {RESP_STATUS_LABELS['pending']}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {resp && !winnerId && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 px-2.5"
                            onClick={() => selectWinner(resp.id)}
                          >
                            <Trophy size={11} /> Выбрать
                          </Button>
                        )}
                        {isWinner && (
                          <span className="text-xs text-purple-600 font-semibold">Победитель</span>
                        )}
                        {!resp && (
                          <span className="text-xs text-muted-foreground">Ожидание</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {tableRows.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-muted-foreground text-sm">
                      Нет приглашённых подрядчиков
                    </td>
                  </tr>
                )}
                {unknownRows.map(resp => (
                  <tr key={resp.id} className={cn(
                    'border-b last:border-0 transition-colors',
                    newIds.has(resp.id) ? 'bg-green-50/70' : 'hover:bg-muted/20'
                  )}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium">{resp.contractorName}</span>
                        {newIds.has(resp.id) && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-500 text-white">NEW</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">Внешний подрядчик</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                      {new Date(resp.respondedAt).toLocaleDateString('ru', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <span className="font-semibold">{resp.amount.toLocaleString()} {resp.currency}</span>
                    </td>
                    <td className="px-4 py-3 text-right">{resp.transitDays}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">—</td>
                    <td className="px-4 py-3 max-w-[200px]">
                      {resp.comment ? <p className="text-xs text-muted-foreground truncate">{resp.comment}</p> : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground">—</td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border', RESP_STATUS_COLORS['responded'])}>
                        {RESP_STATUS_LABELS['responded']}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {!winnerId && (
                        <Button size="sm" variant="outline" className="text-xs h-7 px-2.5" onClick={() => selectWinner(resp.id)}>
                          <Trophy size={11} /> Выбрать
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
