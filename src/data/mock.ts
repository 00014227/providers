export type TransportType = 'auto' | 'rail' | 'air' | 'sea';
export type RateStatus = 'pending' | 'responded' | 'declined' | 'winner';

export interface Contact {
  id: string;
  name: string;
  email: string;
  telegram?: string;
}

export interface Contractor {
  id: string;
  name: string;
  country: string;
  transportTypes: TransportType[];
  contacts: Contact[];
  totalRates: number;
}

export interface RateResponse {
  id: string;
  contractorId: string;
  contractorName: string;
  amount: number;
  currency: string;
  transitDays: number;
  comment: string;
  status: RateStatus;
  respondedAt: string;
}

export interface RateRequest {
  id: string;
  token: string;
  from: string;
  to: string;
  transportType: TransportType;
  weight: number;
  volume: number;
  loadingDate: string;
  deadline: string;
  comment: string;
  status: 'open' | 'closed';
  createdAt: string;
  invitedContractors: string[];
  responses: RateResponse[];
  winnerId?: string;
}

export const CONTRACTORS: Contractor[] = [
  {
    id: 'c1',
    name: 'ТрансЛогист ООО',
    country: 'Россия',
    transportTypes: ['auto', 'rail'],
    contacts: [
      { id: 'ct1', name: 'Иван Петров', email: 'ivan@translogist.ru', telegram: '@ivan_tl' },
      { id: 'ct2', name: 'Мария Сидорова', email: 'maria@translogist.ru' },
    ],
    totalRates: 24,
  },
  {
    id: 'c2',
    name: 'AsiaCargo Ltd',
    country: 'Казахстан',
    transportTypes: ['auto', 'rail', 'air'],
    contacts: [
      { id: 'ct3', name: 'Алибек Дюсенов', email: 'alibek@asiacargo.kz', telegram: '@alibek_ac' },
    ],
    totalRates: 18,
  },
  {
    id: 'c3',
    name: 'SilkRoute Express',
    country: 'Узбекистан',
    transportTypes: ['auto'],
    contacts: [
      { id: 'ct4', name: 'Санжар Юсупов', email: 'sanzhar@silkroute.uz', telegram: '@sanzhar_sr' },
      { id: 'ct5', name: 'Нилуфар Каримова', email: 'nilufar@silkroute.uz' },
    ],
    totalRates: 31,
  },
  {
    id: 'c4',
    name: 'EuroTrans GmbH',
    country: 'Германия',
    transportTypes: ['auto', 'air'],
    contacts: [
      { id: 'ct6', name: 'Hans Mueller', email: 'h.mueller@eurotrans.de', telegram: '@hans_et' },
    ],
    totalRates: 9,
  },
  {
    id: 'c5',
    name: 'ChinaFreight Co.',
    country: 'Китай',
    transportTypes: ['sea', 'air', 'rail'],
    contacts: [
      { id: 'ct7', name: 'Li Wei', email: 'liwei@chinafreight.cn', telegram: '@liwei_cf' },
      { id: 'ct8', name: 'Zhang Min', email: 'zhangmin@chinafreight.cn' },
    ],
    totalRates: 42,
  },
  {
    id: 'c6',
    name: 'КазТранс',
    country: 'Казахстан',
    transportTypes: ['auto', 'rail'],
    contacts: [
      { id: 'ct9', name: 'Дамир Сейткали', email: 'damir@kaztrans.kz' },
    ],
    totalRates: 15,
  },
  {
    id: 'c7',
    name: 'TurkCargo AS',
    country: 'Турция',
    transportTypes: ['auto', 'sea'],
    contacts: [
      { id: 'ct10', name: 'Mehmet Yilmaz', email: 'm.yilmaz@turkcargo.com', telegram: '@mehmet_tc' },
    ],
    totalRates: 7,
  },
  {
    id: 'c8',
    name: 'АвтоДоставка РФ',
    country: 'Россия',
    transportTypes: ['auto'],
    contacts: [
      { id: 'ct11', name: 'Сергей Волков', email: 'sergey@avtodostavka.ru', telegram: '@sergey_ad' },
    ],
    totalRates: 19,
  },
];

export const RATE_REQUESTS: RateRequest[] = [
  {
    id: 'r1',
    token: 'tok-abc-123',
    from: 'Москва',
    to: 'Ташкент',
    transportType: 'auto',
    weight: 5000,
    volume: 20,
    loadingDate: '2026-04-20',
    deadline: '2026-04-18',
    comment: 'Срочная доставка, нужна рефрижераторная машина',
    status: 'open',
    createdAt: '2026-04-14',
    invitedContractors: ['c1', 'c3', 'c8'],
    responses: [
      {
        id: 'resp1',
        contractorId: 'c1',
        contractorName: 'ТрансЛогист ООО',
        amount: 1800,
        currency: 'USD',
        transitDays: 5,
        comment: 'Готовы выполнить, машина свободна',
        status: 'responded',
        respondedAt: '2026-04-14T14:30:00Z',
      },
      {
        id: 'resp2',
        contractorId: 'c3',
        contractorName: 'SilkRoute Express',
        amount: 1650,
        currency: 'USD',
        transitDays: 6,
        comment: 'Можем немного сократить цену при оплате заранее',
        status: 'responded',
        respondedAt: '2026-04-14T16:00:00Z',
      },
    ],
  },
  {
    id: 'r2',
    token: 'tok-def-456',
    from: 'Шанхай',
    to: 'Москва',
    transportType: 'rail',
    weight: 12000,
    volume: 40,
    loadingDate: '2026-04-25',
    deadline: '2026-04-20',
    comment: 'Контейнер 40HC',
    status: 'open',
    createdAt: '2026-04-13',
    invitedContractors: ['c2', 'c5', 'c6'],
    responses: [
      {
        id: 'resp3',
        contractorId: 'c5',
        contractorName: 'ChinaFreight Co.',
        amount: 4200,
        currency: 'USD',
        transitDays: 18,
        comment: 'Прямой маршрут через Казахстан',
        status: 'winner',
        respondedAt: '2026-04-13T10:00:00Z',
      },
    ],
    winnerId: 'resp3',
  },
  {
    id: 'r3',
    token: 'tok-ghi-789',
    from: 'Стамбул',
    to: 'Алматы',
    transportType: 'auto',
    weight: 3000,
    volume: 15,
    loadingDate: '2026-05-01',
    deadline: '2026-04-25',
    comment: '',
    status: 'open',
    createdAt: '2026-04-15',
    invitedContractors: ['c4', 'c7'],
    responses: [],
  },
];

export const TRANSPORT_LABELS: Record<TransportType, string> = {
  auto: 'Авто',
  rail: 'Ж/Д',
  air: 'Авиа',
  sea: 'Море',
};

export const COUNTRY_LIST = [
  'Россия', 'Казахстан', 'Узбекистан', 'Германия', 'Китай', 'Турция',
  'Беларусь', 'Кыргызстан', 'Азербайджан', 'Грузия',
];
