import type { PlantSummary, WateringInsight } from './wateringSuggestions';
import type { SuggestionAlgorithmContext, SuggestionCard, SuggestionKind, SuggestionSeverity } from './types';
import { evaluatePowderyMildewAlgorithm } from './algorithms/powderyMildewAlgorithm';
import { evaluateRootRotAlgorithm } from './algorithms/rootRotAlgorithm';
import { evaluateWateringAlgorithm } from './algorithms/wateringAlgorithm';

type SuggestionEvalOptions = Partial<{
  lookbackDays: number;
  rainfallThresholdMm: number;
}>;

export interface PlantSuggestionResult {
  plantId: string;
  plantName: string;
  insight: WateringInsight;
  cards: SuggestionCard[];
}

type SuggestionAlgorithm = (context: SuggestionAlgorithmContext) => SuggestionCard;

const ALGORITHMS: SuggestionAlgorithm[] = [
  evaluateWateringAlgorithm,
  evaluatePowderyMildewAlgorithm,
  evaluateRootRotAlgorithm,
];

const SEVERITY_RANK: Record<SuggestionSeverity, number> = {
  info: 0,
  watch: 1,
  warn: 2,
  critical: 3,
};

const KIND_RANK: Record<SuggestionKind, number> = {
  watering: 0,
  powderyMildew: 1,
  rootRot: 2,
};

function sortCards(cards: SuggestionCard[]): SuggestionCard[] {
  return cards.slice().sort((left, right) => {
    const severityDelta = SEVERITY_RANK[right.severity] - SEVERITY_RANK[left.severity];
    if (severityDelta !== 0) return severityDelta;
    return KIND_RANK[left.kind] - KIND_RANK[right.kind];
  });
}

export function buildSuggestionCardsFromInsight(
  insight: WateringInsight,
  now = new Date(),
): SuggestionCard[] {
  const context: SuggestionAlgorithmContext = { insight, now };
  const cards = ALGORITHMS
    .map((algorithm) => algorithm(context))
    .filter((card) => card.active);

  return sortCards(cards);
}

export async function evaluateSuggestionCardsForPlants(
  plants: PlantSummary[],
  options?: SuggestionEvalOptions,
): Promise<PlantSuggestionResult[]> {
  const { evaluateWateringInsights } = await import('./wateringSuggestions');
  const insights = await evaluateWateringInsights(plants, options);
  return insights.map((insight) => ({
    plantId: insight.plantId,
    plantName: insight.plantName,
    insight,
    cards: buildSuggestionCardsFromInsight(insight),
  }));
}

export async function evaluateSuggestionCardsForPlant(
  plant: PlantSummary,
  options?: SuggestionEvalOptions,
): Promise<PlantSuggestionResult | null> {
  const [result] = await evaluateSuggestionCardsForPlants([plant], options);
  return result ?? null;
}

export type { SuggestionCard, SuggestionConfidence, SuggestionKind, SuggestionSeverity } from './types';
