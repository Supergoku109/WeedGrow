import React from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { ThemedText } from './ThemedText';

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

export function SuggestionCatalog({ suggestions }: SuggestionCatalogProps) {
  return (
    <View style={styles.catalogContainer}>
      <FlatList
        data={suggestions}
        keyExtractor={s => s.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToAlignment="center"
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 8 }}
        renderItem={({ item }) => (
          <View style={[styles.card, { width: CARD_WIDTH }]}>
            <View style={styles.headerRow}>
              <ThemedText style={styles.icon}>{item.icon}</ThemedText>
              <ThemedText style={styles.title}>{item.title}</ThemedText>
            </View>
            {item.description && <ThemedText style={styles.description}>{item.description}</ThemedText>}
            <View style={styles.affectedRow}>
              {item.affected.slice(0, 3).map((name, idx) => (
                <ThemedText key={name} style={styles.affectedName}>{name}{idx < item.affected.length - 1 && idx < 2 ? ', ' : ''}</ThemedText>
              ))}
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
    backgroundColor: '#1a2e22',
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
