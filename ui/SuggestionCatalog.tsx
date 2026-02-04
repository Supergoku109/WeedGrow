import React from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { Text, Container, Card } from '@/design-system';
import { ColorTokens, Spacing, BorderRadius } from '@/design-system/tokens';
import GradientOverlay from './GradientOverlay';

export interface Suggestion {
  key: string;
  icon: string; // emoji or icon name
  title: string;
  description?: string;
  affected: string[]; // plant or group names
  onExpand?: () => void;
}

interface SuggestionCatalogProps {
  suggestions: Suggestion[];
}

const CARD_WIDTH = Math.min(Dimensions.get('window').width - 32, 340);

// Color codes for suggestion types
const SUGGESTION_COLORS = {
  watering: 'rgb(15, 69, 161)', // blue
  mildew: 'rgba(139, 9, 9, 0.93)',  // red
  weather: 'rgb(189, 138, 17)', // orange
  fertilizer: 'rgb(34, 142, 77)', // green
  default: ColorTokens.brand.primary,
};

const getCardColor = (suggestion: Suggestion) => {
  const title = suggestion.title.toLowerCase();
  if (title.includes('water')) return SUGGESTION_COLORS.watering;
  if (title.includes('mildew') || title.includes('risk')) return SUGGESTION_COLORS.mildew;
  if (title.includes('storm') || title.includes('weather') || title.includes('hail') || title.includes('wind')) return SUGGESTION_COLORS.weather;
  if (title.includes('fertilizer')) return SUGGESTION_COLORS.fertilizer;
  return SUGGESTION_COLORS.default;
};

export function SuggestionCatalog({ suggestions }: SuggestionCatalogProps) {
  return (
    <Container style={styles.catalogContainer}>
      <FlatList
        data={suggestions}
        keyExtractor={s => s.key}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + Spacing.sm}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: Spacing.xs }}
        renderItem={({ item }) => (
          <Container 
            style={[
              styles.card, 
              { 
                width: CARD_WIDTH, 
                backgroundColor: getCardColor(item),
                overflow: 'hidden'
              }
            ]}
          > 
            <GradientOverlay color={getCardColor(item)} />
            <Container direction="row" align="center" style={{ marginBottom: Spacing.xs }}>
              <Text style={styles.icon}>{item.icon}</Text>
              <Text style={styles.title}>{item.title}</Text>
            </Container>
            {item.description && (
              <Text style={styles.description}>{item.description}</Text>
            )}
            <Container 
              direction="row" 
              align="center" 
              style={{ marginTop: Spacing.xs, flexWrap: 'wrap' }}
            >
              <Text style={styles.affectedName}>
                {item.affected.slice(0, 3).join(', ')}
              </Text>
              {item.affected.length > 3 && item.onExpand && (
                <TouchableOpacity onPress={item.onExpand}>
                  <Text style={styles.expandText}>+{item.affected.length - 3} more</Text>
                </TouchableOpacity>
              )}
            </Container>
          </Container>
        )}
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  catalogContainer: {
    width: '100%',
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginHorizontal: Spacing.xs,
    alignSelf: 'center',
  },
  icon: {
    fontSize: 22,
    marginRight: Spacing.xs,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  description: {
    color: '#b5e0c7',
    fontSize: 13,
    marginBottom: Spacing.xs,
  },
  affectedName: {
    color: '#fff',
    fontSize: 13,
  },
  expandText: {
    color: '#4fc3f7',
    fontSize: 13,
    marginLeft: Spacing.xs,
    fontWeight: 'bold',
  },
});

export default SuggestionCatalog;
