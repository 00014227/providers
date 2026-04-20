import { Contractor, TransportType } from '../data/mock';

export type MatchReason = 'route' | 'transport' | 'both';

export interface MatchedContractor {
  contractor: Contractor;
  score: number;       // 0-100
  reasons: string[];
  matchType: 'auto' | 'partial' | 'manual';
}

/** Map vehicleType string → TransportType */
export function vehicleToTransportType(vehicleType: string): TransportType {
  if (['container_20', 'container_40'].includes(vehicleType)) return 'sea';
  if (vehicleType === 'air') return 'air';
  if (vehicleType === 'rail_wagon') return 'rail';
  return 'auto';
}

export function matchContractors(params: {
  fromCountry: string;
  toCountry: string;
  vehicleType: string;
  transportMode?: TransportType;
}, contractors: Contractor[]): MatchedContractor[] {
  const transport = params.transportMode ?? vehicleToTransportType(params.vehicleType);
  const from = params.fromCountry.trim().toLowerCase();
  const to = params.toCountry.trim().toLowerCase();

  return contractors
    .map(c => {
      const reasons: string[] = [];
      let score = 0;

      // Transport type match
      const supportsTransport = c.transportTypes.includes(transport);
      if (supportsTransport) {
        score += 40;
        reasons.push(`Перевозит: ${transport === 'auto' ? 'Авто' : transport === 'rail' ? 'Ж/Д' : transport === 'air' ? 'Авиа' : 'Море'}`);
      }

      // Route match
      const cRoutes = c.routes.map(r => r.toLowerCase());
      const coversFrom = from && cRoutes.some(r => r.includes(from) || from.includes(r));
      const coversTo = to && cRoutes.some(r => r.includes(to) || to.includes(r));

      if (coversFrom && coversTo) {
        score += 50;
        reasons.push(`Маршрут: ${params.fromCountry} ↔ ${params.toCountry}`);
      } else if (coversFrom) {
        score += 20;
        reasons.push(`Покрывает: ${params.fromCountry}`);
      } else if (coversTo) {
        score += 20;
        reasons.push(`Покрывает: ${params.toCountry}`);
      }

      // Rating bonus
      score += Math.round(c.rating * 2);

      // Determine match type
      let matchType: MatchedContractor['matchType'];
      if (supportsTransport && coversFrom && coversTo) {
        matchType = 'auto';
      } else if (supportsTransport || coversFrom || coversTo) {
        matchType = 'partial';
      } else {
        matchType = 'manual';
      }

      return { contractor: c, score, reasons, matchType };
    })
    .sort((a, b) => b.score - a.score);
}
