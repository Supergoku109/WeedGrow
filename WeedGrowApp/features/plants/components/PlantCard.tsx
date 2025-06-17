import React from 'react';
import { StyleSheet, TouchableOpacity, Image, View, Animated } from 'react-native';
import { IconButton, Snackbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/ui/ThemedView';
import { ThemedText } from '@/ui/ThemedText';
import { Plant } from '@/firestoreModels';
import { calendarGreen } from '@/constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { addPlantLog } from '@/lib/logs/addPlantLog';
import { LinearGradient } from 'expo-linear-gradient';
import { WeedGrowEnvBadge } from '@/ui/WeedGrowEnvBadge';

export interface PlantCardProps {
  plant: Plant & { id: string };
}

export function PlantCard({ plant }: PlantCardProps) {
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

  const env = (plant as any).environment ?? 'indoor';

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
        onPress={() => router.push({ pathname: '/plant/[id]', params: { id: plant.id } })}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }], opacity: opacityAnim }}>
          <ThemedView style={[styles.card, { flexDirection: 'row', alignItems: 'stretch', minHeight: 90 }]}> 
            {/* Left: Image, fixed width */}
            <View style={[styles.leftSection, { alignItems: 'flex-start', paddingLeft: 8 }]}> 
              {(plant as any).imageUri ? (
                <Image source={{ uri: (plant as any).imageUri }} style={styles.imageSmall} />
              ) : (
                <View style={styles.imageSmallPlaceholder}>
                  <MaterialCommunityIcons name="leaf" size={36} color="#00c853" />
                </View>
              )}
            </View>
            {/* Middle: Info */}
            <View style={styles.rightSection}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 1 }}>
                <ThemedText style={styles.plantNameTopTight} numberOfLines={1}>{plant.name}</ThemedText>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 1, gap: 6 }}>
                <WeedGrowEnvBadge environment={env} size={12} style={{ marginRight: 4, alignSelf: 'center' }} />
                <ThemedText style={styles.strainText} numberOfLines={1}>{(plant as any).strain}</ThemedText>
              </View>
              <View style={[styles.statusRow, { marginTop: 0 }]}> 
                <MaterialCommunityIcons name="progress-clock" size={15} color="#a3e635" style={{ marginRight: 2 }} />
                <ThemedText style={styles.statusText}>{plant.status}</ThemedText>
              </View>
            </View>
            {/* Right: Water Button */}
            <View style={styles.waterButtonSection}>
              <IconButton
                icon="water"
                size={24}
                mode="contained"
                iconColor="#fff"
                containerColor="#1e90ff"
                style={styles.waterButtonCompact}
                onPress={handleWater}
                accessibilityLabel="Log watering"
              />
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
    marginBottom: 14,
    padding: 2,
    borderRadius: 16,
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
    minHeight: 60,
  },
  plantNameTopTight: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
    flexShrink: 1,
  },
  leftSection: {
    width: 90, // increased from 70
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingVertical: 8,
    marginRight: 10,
    paddingLeft: 8,
  },
  rightSection: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    minWidth: 0,
    paddingVertical: 4,
    paddingLeft: 8, // add more left padding to move content right
  },
  imageSmall: {
    height: 80,
    width: 80,
    borderRadius: 16,
    resizeMode: 'cover',
    backgroundColor: '#222',
  },
  imageSmallPlaceholder: {
    height: 80,
    width: 80,
    borderRadius: 16,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waterButtonCompact: {
    marginLeft: 8,
    alignSelf: 'center',
    elevation: 2,
  },
  waterButtonSection: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
    paddingHorizontal: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  statusText: {
    color: '#e0e7ef',
    fontSize: 13,
    fontWeight: '600',
  },
  strainText: {
    color: '#a3e635',
    fontSize: 13,
    marginBottom: 2,
    marginTop: 0,
  },
});

export default PlantCard;
