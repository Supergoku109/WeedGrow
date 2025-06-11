import React from 'react';
import { StyleSheet, TouchableOpacity, Image, View, Animated } from 'react-native';
import { IconButton, Snackbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/ui/ThemedView';
import { ThemedText } from '@/ui/ThemedText';
import { Plant } from '@/firestoreModels';
import { calendarGreen } from '@/constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getPlantAdviceWithReason, PlantAdviceContext } from '@/lib/weather/getPlantAdvice';
import InfoTooltip from '@/ui/InfoTooltip';
import { addPlantLog } from '@/lib/logs/addPlantLog';
import { LinearGradient } from 'expo-linear-gradient';

export interface PlantCardProps {
  plant: Plant & { id: string };
  weather?: Partial<PlantAdviceContext>;
}

export function PlantCard({ plant, weather }: PlantCardProps) {
  const router = useRouter();

  const [snackVisible, setSnackVisible] = React.useState(false);
  const [snackMessage, setSnackMessage] = React.useState('');

  // Animation for card mount
  const scaleAnim = React.useRef(new Animated.Value(0.92)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 7,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // If weather is missing or incomplete, show a friendly message
  const noWeather = !weather || Object.keys(weather).length < 5;

  let advice = '';
  let reason = '';
  if (!noWeather) {
    try {
      const ctx: PlantAdviceContext = weather as PlantAdviceContext;
      const result = getPlantAdviceWithReason(ctx);
      advice = result.advice;
      reason = result.reason;
    } catch (e) {
      advice = '';
      reason = '';
    }
  }

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

  const env = (plant as any).environment ?? 'indoor';
  const envIcon = env === 'indoor' ? 'home' : env === 'outdoor' ? 'weather-sunny' : 'greenhouse';

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
        <Animated.View style={{
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        }}>
          <ThemedView style={[styles.card, { borderLeftColor: borderColor }]}> 
            <LinearGradient
              colors={["#00c853", "#151718"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientBg}
            />
            <View style={styles.topRow}>
              <View style={styles.envBadgeTopLeftSmall}>
                <MaterialCommunityIcons name={envIcon} size={12} color="#fff" />
                <ThemedText style={styles.envBadgeTextSmall}>{env.charAt(0).toUpperCase() + env.slice(1)}</ThemedText>
              </View>
              <ThemedText style={styles.plantNameTopTight}>{plant.name}</ThemedText>
              <IconButton
                icon="water"
                size={26} // restore original size
                mode="contained"
                iconColor="#fff"
                containerColor="#1e90ff"
                style={styles.waterButtonTopCorner}
                onPress={handleWater}
                accessibilityLabel="Log watering"
              />
            </View>
            <View style={styles.cardContentRow}>
              {(plant as any).imageUri ? (
                <View style={styles.imageTallWrapper}>
                  <Image source={{ uri: (plant as any).imageUri }} style={styles.imageTall} />
                </View>
              ) : (
                <View style={styles.imageTallWrapper}>
                  <MaterialCommunityIcons name="leaf" size={54} color="#00c853" />
                </View>
              )}
              <View style={styles.infoColRight}>
                <ThemedText style={styles.strainText}>{(plant as any).strain}</ThemedText>
                <View style={styles.statusRow}>
                  <MaterialCommunityIcons name="progress-clock" size={15} color="#a3e635" style={{ marginRight: 2 }} />
                  <ThemedText style={styles.statusText}>{plant.status}</ThemedText>
                </View>
                <View style={styles.suggestionRow}>
                  {noWeather ? (
                    <View style={[styles.suggestionChip, { backgroundColor: '#9CA3AF' }]}> 
                      <ThemedText style={styles.suggestionText}>No weather info available</ThemedText>
                    </View>
                  ) : (
                    <View style={[styles.suggestionChip, { backgroundColor: suggestionColor }]}> 
                      <ThemedText style={styles.suggestionText}>{advice}</ThemedText>
                    </View>
                  )}
                  {!noWeather && <InfoTooltip message={reason} />}
                </View>
              </View>
            </View>
          </ThemedView>
        </Animated.View>
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
    marginBottom: 20,
    padding: 10,
    borderRadius: 16,
    // Use a green-to-black vertical gradient background
    backgroundColor: 'transparent',
    borderLeftWidth: 5,
    borderLeftColor: '#00c853',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  gradientBg: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    zIndex: 0,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginBottom: 4,
    minHeight: 32,
    position: 'relative',
  },
  envBadgeTopLeftSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00c853',
    borderRadius: 7,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginRight: 8,
    position: 'absolute',
    top: 0, // move higher
    left: 2, // move more left
    zIndex: 2,
  },
  envBadgeTextSmall: {
    color: '#fff',
    fontSize: 11,
    marginLeft: 3,
    fontWeight: '600',
  },
  plantNameTopTight: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    marginTop: 2,
  },
  waterButtonTopCorner: {
    position: 'absolute',
    top: -10, // move higher
    right: -10, // move more right
    elevation: 2,
  },
  cardContentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 13,
  },
  imageTallWrapper: {
    height: 120,
    width: 120,
    borderRadius: 20,
    backgroundColor: '#222',
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00c853',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  imageTall: {
    height: '100%',
    width: '100%',
    borderRadius: 20,
    resizeMode: 'cover',
  },
  infoColRight: {
    flex: 1,
    flexDirection: 'column',
    gap: 4,
    minWidth: 0,
  },
  strainText: {
    color: '#a3e635',
    fontSize: 14,
    marginBottom: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  statusText: {
    color: '#e0e7ef',
    fontSize: 13,
    fontWeight: '600',
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  suggestionChip: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    minHeight: 26,
    justifyContent: 'center',
    backgroundColor: '#00c853',
    shadowColor: '#00c853',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  suggestionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
});

export default PlantCard;
