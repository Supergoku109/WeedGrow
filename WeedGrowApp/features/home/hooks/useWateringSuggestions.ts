import { useEffect, useMemo, useState } from 'react';
import type { PlantWithId } from '@/features/groups/hooks/useGroupDetail';
import logger from '@/lib/logger';
import {
  evaluateWateringInsights,
  type PlantSummary,
  type WateringInsight,
} from '@/lib/suggestions/wateringSuggestions';
import type { Suggestion } from '@/ui/SuggestionCatalog';

interface WateringSuggestionState {
  loading: boolean;
  error: string | null;
  suggestions: Suggestion[];
  insights: WateringInsight[];
  plantsNeedingWater: WateringInsight[];
}

export function useWateringSuggestions(plants: PlantWithId[]): WateringSuggestionState {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insights, setInsights] = useState<WateringInsight[]>([]);

  useEffect(() => {
    let cancelled = false;

    if (!plants.length) {
      setInsights([]);
      setError(null);
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setLoading(true);

    (async () => {
      try {
        const summaries = plants as PlantSummary[];
        const computed = await evaluateWateringInsights(summaries);
        if (!cancelled) {
          setInsights(computed);
          setError(null);
        }
      } catch (err) {
        if (cancelled) return;
        logger.error('Unable to evaluate watering suggestions', err);
        setError('Unable to evaluate watering suggestions');
        setInsights([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [plants]);

  const plantsNeedingWater = useMemo(
    () => insights.filter((insight) => insight.needsWater),
    [insights]
  );

  const suggestions = useMemo<Suggestion[]>(() => {
    if (!plantsNeedingWater.length) return [];

    const uniqueNames = Array.from(
      new Set(plantsNeedingWater.map((insight) => insight.plantName))
    );

    const description =
      plantsNeedingWater.length === 1
        ? plantsNeedingWater[0].reason
        : `${plantsNeedingWater.length} plants flagged. ${plantsNeedingWater[0].reason}`;

    return [
      {
        key: 'watering',
        icon: '💧',
        title: 'Plants that need watering today',
        description,
        affected: uniqueNames,
      },
    ];
  }, [plantsNeedingWater]);

  return {
    loading,
    error,
    suggestions,
    insights,
    plantsNeedingWater,
  };
}


