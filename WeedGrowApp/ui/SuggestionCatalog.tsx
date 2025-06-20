import React from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { ThemedText } from './ThemedText';
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

// Color codes for suggestion types (edit here)
const SUGGESTION_COLORS = {
  watering: 'rgb(15, 69, 161)', // blue
  mildew: 'rgba(139, 9, 9, 0.93)',  // red
  weather: 'rgb(189, 138, 17)', // orange
  fertilizer: 'rgb(34, 142, 77)', // green
  default: 'rgba(26,46,34,1)',
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
    <View style={styles.catalogContainer}>
      <FlatList
        data={suggestions}
        keyExtractor={s => s.key}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 12} // Add this
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 8 }}
        renderItem={({ item }) => (
          <View style={[styles.card, { width: CARD_WIDTH, backgroundColor: getCardColor(item), overflow: 'hidden' }]}> 
            <GradientOverlay color={getCardColor(item)} />
            <View style={styles.headerRow}>
              <ThemedText style={styles.icon}>{item.icon}</ThemedText>
              <ThemedText style={styles.title}>{item.title}</ThemedText>
            </View>
            {item.description && <ThemedText style={styles.description}>{item.description}</ThemedText>}
            <View style={styles.affectedRow}>
              <ThemedText style={styles.affectedName}>
                {item.affected.slice(0, 3).join(', ')}
              </ThemedText>
              {item.affected.length > 3 && item.onExpand && (
                <TouchableOpacity onPress={item.onExpand}>
                  <ThemedText style={styles.expandText}>+{item.affected.length - 3} more</ThemedText>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  catalogContainer: {
    width: '100%',
    marginTop: 8,
    marginBottom: 8,
  },
  card: {
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginHorizontal: 6,
    alignSelf: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  icon: {
    fontSize: 22,
    marginRight: 8,
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
    marginBottom: 4,
  },
  affectedRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 2,
  },
  affectedName: {
    color: '#fff',
    fontSize: 13,
  },
  expandText: {
    color: '#4fc3f7',
    fontSize: 13,
    marginLeft: 4,
    fontWeight: 'bold',
  },
});

export default SuggestionCatalog;
