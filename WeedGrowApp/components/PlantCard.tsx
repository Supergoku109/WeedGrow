import React from 'react';
import { StyleSheet, TouchableOpacity, Image, View } from 'react-native';
import { IconButton, Snackbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Plant } from '@/firestoreModels';
import { calendarGreen } from '@/constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getPlantAdviceWithReason, PlantAdviceContext } from '@/lib/weather/getPlantAdvice';
import { InfoTooltip } from '@/components/InfoTooltip';
import { addPlantLog } from '@/lib/logs/addPlantLog';

export interface PlantCardProps {
  plant: Plant & { id: string };
  weather?: Partial<PlantAdviceContext>;
}

export function PlantCard({ plant, weather }: PlantCardProps) {
  const router = useRouter();

  const [snackVisible, setSnackVisible] = React.useState(false);
  const [snackMessage, setSnackMessage] = React.useState('');

  const ctx: PlantAdviceContext = {
    rainToday: weather?.rainToday ?? false,
    rainTomorrow: weather?.rainTomorrow ?? false,
    rainYesterday: weather?.rainYesterday ?? 0,
    humidity: weather?.humidity ?? 50,
    dewPoint: weather?.dewPoint ?? 10,
    cloudCoverage: weather?.cloudCoverage ?? 40,
    windGust: weather?.windGust ?? 10,
    pop: weather?.pop ?? 0.2,
  };

  const { advice, reason } = getPlantAdviceWithReason(ctx);

  // Color-code the suggestion chip based on keywords in the advice
  const getSuggestionColor = () => {
    if (advice.includes('mildew')) return '#DC2626'; // red
    if (advice.includes('Rain')) return '#9CA3AF'; // gray
    if (advice.includes('lightly')) return '#FACC15'; // yellow
    if (advice.includes('water')) return '#3B82F6'; // blue
    return '#4B5563'; // default
  };

  // Highlight the card edge when the advice is particularly urgent
  const getBorderColor = () => {
    if (advice.includes('water your plant today')) return 'red';
    if (advice.includes('Water lightly')) return 'yellow';
    return 'transparent';
  };

  const suggestionColor = getSuggestionColor();
  const borderColor = getBorderColor();

  const envIcon = {
    indoor: 'home',
    outdoor: 'weather-sunny',
    greenhouse: 'greenhouse',
  }[(plant as any).environment ?? 'indoor'];

  const handleWater = async (e: any) => {
    e.stopPropagation();
    try {
      await addPlantLog(plant.id, {
        type: 'watering',
        description: 'Watered the plant',
        updatedBy: 'demoUser',
      });
      setSnackMessage('Watering logged');
      setSnackVisible(true);
      } catch (err: any) {
        setSnackMessage(err.message || 'Failed to log');
        setSnackVisible(true);
      }
    };


  return (
    <>
      <TouchableOpacity
        onPress={() =>
          router.push({ pathname: '/plant/[id]', params: { id: plant.id } })
        }
      >
        <ThemedView style={[styles.card, { borderLeftColor: borderColor }]}>
        <IconButton
          icon="water"
          size={28}
          mode="contained"
          iconColor="white"
          containerColor="#1e90ff"
          style={styles.waterButton}
          onPress={handleWater}
          accessibilityLabel="Log watering"
        />
        <View style={styles.row}>
          {(plant as any).imageUri && (
            <Image source={{ uri: (plant as any).imageUri }} style={styles.image} />
          )}
          <View style={styles.textContainer}>
            <ThemedText type="subtitle">{plant.name}</ThemedText>
            <ThemedText>
              {(plant as any).strain} | <MaterialCommunityIcons name={envIcon} size={14} />
            </ThemedText>
            <View style={styles.statusRow}>
              <ThemedText>{plant.status}</ThemedText>
            </View>
            <View style={styles.suggestionRow}>
              <View style={[styles.suggestionChip, { backgroundColor: suggestionColor }]}> 
                <ThemedText style={styles.suggestionText}>{advice}</ThemedText>
              </View>
            </View>
            <InfoTooltip message={reason} />
          </View>
        </View>
        </ThemedView>
      </TouchableOpacity>
      <Snackbar
        visible={snackVisible}
        onDismiss={() => setSnackVisible(false)}
        duration={3000}
      >
        {snackMessage}
      </Snackbar>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: calendarGreen,
    borderLeftWidth: 5,
    position: 'relative',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    height: 80,
    width: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    gap: 6,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  suggestionChip: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
    marginTop: 4,
  },
  suggestionText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  waterButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 5,
  },
});
