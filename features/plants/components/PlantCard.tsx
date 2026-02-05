import React from 'react';
import { StyleSheet, TouchableOpacity, Image, View, Animated, Easing } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/ui/ThemedText';
import { Plant } from '@/firestoreModels';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { WeedGrowEnvBadge } from '@/ui/WeedGrowEnvBadge';
import { ThemedView } from '@/ui/ThemedView';

export interface PlantCardProps {
  plant: Plant & { id: string };
  onAddLog?: (type?: string) => void;
  wateredToday?: boolean;
  waterLoading?: boolean;
  onPress?: () => void;
}

export function PlantCard({ plant, onAddLog, wateredToday = false, waterLoading = false, onPress }: PlantCardProps) {
  const router = useRouter();

  // Animation for card mount
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;
  // Set initial opacity and scale before rendering
  React.useLayoutEffect(() => {
    scaleAnim.setValue(0); // Start scale at 0
    opacityAnim.setValue(0); // Start opacity at 0

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 5, // Reduced friction for smoother bounce
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 800, // Reduced duration to 800ms for faster animation
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacityAnim, scaleAnim]);

  const env = (plant as any).environment ?? 'indoor';

  const isWatered = wateredToday;

  const handleWater = async (e: any) => {
    e.stopPropagation();
    if (isWatered || waterLoading) return;
    if (typeof onAddLog === 'function') {
      await onAddLog('watering');
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress ?? (() => router.push({ pathname: '/plant/[id]', params: { id: plant.id } }))}
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
              icon={waterLoading ? 'progress-clock' : isWatered ? 'water-check' : 'water'}
              size={24}
              mode="contained"
              iconColor={isWatered ? '#94a3b8' : '#fff'}
              containerColor={isWatered ? 'rgba(148,163,184,0.25)' : '#1e90ff'}
              style={styles.waterButtonCompact}
              onPress={handleWater}
              accessibilityLabel="Log watering"
              disabled={isWatered || waterLoading}
            />
          </View>
        </ThemedView>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 14,
    padding: 2,
    borderRadius: 16,
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
