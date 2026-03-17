import React from 'react';
import { StyleSheet, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { Text } from '@/design-system';
import { BorderRadius, ColorTokens, Spacing } from '@/design-system/tokens';
import GradientOverlay from './GradientOverlay';

export interface Suggestion {
  key: string;
  icon: string;
  title: string;
  description?: string;
  affected: string[];
  onExpand?: () => void;
}

interface SuggestionCatalogProps {
  suggestions: Suggestion[];
}

const MAX_CARD_WIDTH = 420;
const MIN_MULTI_COLUMN_CARD_WIDTH = 280;

const SUGGESTION_COLORS = {
  watering: 'rgb(15, 69, 161)',
  mildew: 'rgba(139, 9, 9, 0.93)',
  weather: 'rgb(189, 138, 17)',
  fertilizer: 'rgb(34, 142, 77)',
  default: ColorTokens.brand.primary,
};

const getCardColor = (suggestion: Suggestion) => {
  const title = suggestion.title.toLowerCase();
  if (title.includes('water')) return SUGGESTION_COLORS.watering;
  if (title.includes('mildew') || title.includes('risk')) return SUGGESTION_COLORS.mildew;
  if (
    title.includes('storm') ||
    title.includes('weather') ||
    title.includes('hail') ||
    title.includes('wind')
  ) {
    return SUGGESTION_COLORS.weather;
  }
  if (title.includes('fertilizer')) return SUGGESTION_COLORS.fertilizer;
  return SUGGESTION_COLORS.default;
};

function getColumnCount(width: number, itemCount: number): number {
  if (itemCount <= 1) return 1;
  if (width >= 1320) return Math.min(itemCount, 3);
  if (width >= 860) return Math.min(itemCount, 2);
  return 1;
}

export function SuggestionCatalog({ suggestions }: SuggestionCatalogProps) {
  const { width } = useWindowDimensions();

  if (!suggestions.length) {
    return null;
  }

  const columnCount = getColumnCount(width, suggestions.length);
  const isSingleCard = suggestions.length === 1;
  const horizontalPadding = 12;
  const gridGap = Spacing.sm;
  const usableWidth = Math.max(width - horizontalPadding * 2 - gridGap * (columnCount - 1), 0);
  const calculatedWidth = columnCount > 1 ? usableWidth / columnCount : usableWidth;
  const cardWidth = isSingleCard
    ? undefined
    : Math.max(MIN_MULTI_COLUMN_CARD_WIDTH, Math.min(MAX_CARD_WIDTH, calculatedWidth));
  const gridMaxWidth =
    columnCount > 1 && cardWidth
      ? columnCount * cardWidth + (columnCount - 1) * gridGap
      : undefined;

  return (
    <View style={styles.catalogContainer}>
      <View style={[styles.grid, gridMaxWidth ? { maxWidth: gridMaxWidth } : undefined]}>
        {suggestions.map((item) => (
          <View
            key={item.key}
            style={[
              styles.card,
              {
                backgroundColor: getCardColor(item),
                width: isSingleCard ? '100%' : cardWidth,
              },
            ]}
          >
            <GradientOverlay color={getCardColor(item)} />
            <View style={styles.headerRow}>
              <Text style={styles.icon}>{item.icon}</Text>
              <Text style={styles.title}>{item.title}</Text>
            </View>
            {item.description ? <Text style={styles.description}>{item.description}</Text> : null}
            <View style={styles.affectedRow}>
              <Text style={styles.affectedName}>{item.affected.slice(0, 3).join(', ')}</Text>
              {item.affected.length > 3 && item.onExpand ? (
                <TouchableOpacity onPress={item.onExpand}>
                  <Text style={styles.expandText}>+{item.affected.length - 3} more</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  affectedName: {
    color: '#fff',
    fontSize: 13,
  },
  affectedRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  card: {
    alignSelf: 'stretch',
    borderRadius: BorderRadius.lg,
    minHeight: 120,
    overflow: 'hidden',
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  catalogContainer: {
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
    paddingHorizontal: 12,
    width: '100%',
  },
  description: {
    color: '#b5e0c7',
    fontSize: 13,
    marginBottom: Spacing.xs,
  },
  expandText: {
    color: '#4fc3f7',
    fontSize: 13,
    fontWeight: 'bold',
  },
  grid: {
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    width: '100%',
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  icon: {
    fontSize: 22,
    marginRight: Spacing.xs,
  },
  title: {
    color: '#fff',
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SuggestionCatalog;
