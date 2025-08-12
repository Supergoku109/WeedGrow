import React from 'react';
import { StyleSheet, TouchableOpacity, View, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { Row } from '@/design-system/components/Row/Row';
import { ColorTokens, Typography, Spacing } from '@/design-system/tokens';
import { useColorScheme } from '@/hooks/useColorScheme';
import ThemedText from '@/ui/ThemedText';

// Helper to get environment icon and label
const getEnvIconLabel = (env: string) => {
  switch (env) {
    case 'outdoor':
    case 'Outdoor':
      return { icon: 'weather-sunny', label: 'Outdoor', color: ColorTokens.environment.outdoor };
    case 'greenhouse':
    case 'Greenhouse':
      return { icon: 'greenhouse', label: 'Greenhouse', color: ColorTokens.environment.greenhouse };
    case 'indoor':
    case 'Indoor':
      return { icon: 'home-city', label: 'Indoor', color: ColorTokens.environment.indoor };
    default:
      return { icon: 'help-circle-outline', label: env, color: ColorTokens.text.secondary };
  }
};

interface GroupHeaderProps {
  name: string;
  environment: string;
  weather?: { temperature: number; rain: number; humidity: number };
  totalPlants: number;
  onMoreOptions?: (action: 'edit' | 'delete') => void;
}

const GroupDetailHeader: React.FC<GroupHeaderProps> = ({
  name,
  environment,
  weather,
  totalPlants,
  onMoreOptions,
}) => {
  const theme = (useColorScheme() ?? 'dark') as 'dark' | 'light';
  const { icon, label, color } = getEnvIconLabel(environment);
  const [menuVisible, setMenuVisible] = React.useState(false);

  const handleEdit = () => {
    setMenuVisible(false);
    if (onMoreOptions) onMoreOptions('edit');
  };
  const handleDelete = () => {
    setMenuVisible(false);
    if (onMoreOptions) onMoreOptions('delete');
  };

  return (
    <LinearGradient
      colors={['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.02)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, theme === 'dark' ? styles.cardDark : styles.cardLight]}
    >
      {/* Accent gradient sweep */}
      <LinearGradient
        colors={['rgba(16,185,129,0.22)', 'rgba(59,130,246,0.16)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.accent}
      />

      {/* Top row: env pill + menu */}
      <Row justify="space-between" align="center" style={{ marginBottom: Spacing.xs }}>
        <View style={styles.envPill}>
          <MaterialCommunityIcons name={icon as any} size={16} color={color} />
          <ThemedText style={[styles.envPillText, { color }]}>{label}</ThemedText>
        </View>
        <TouchableOpacity onPress={() => setMenuVisible((v) => !v)} style={styles.moreBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="more-horizontal" size={22} color={ColorTokens.text.secondary} />
        </TouchableOpacity>
      </Row>

      {/* Custom glassy popup menu */}
      {menuVisible && (
        <View style={styles.menuOverlay} pointerEvents="box-none">
          {/* Dismiss on outside press (inside card) */}
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setMenuVisible(false)} />
          <View style={[styles.menuCard, theme === 'dark' ? styles.menuCardDark : styles.menuCardLight]}>
            <LinearGradient
              colors={['rgba(16,185,129,0.18)', 'rgba(59,130,246,0.12)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.menuAccent}
            />
            <Pressable onPress={handleEdit} style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]} accessibilityRole="button" accessibilityLabel="Edit Group">
              <MaterialCommunityIcons name="pencil" size={18} color={theme === 'dark' ? '#e5e7eb' : '#111827'} />
              <ThemedText style={styles.menuText}>Edit Group</ThemedText>
            </Pressable>
            <View style={styles.menuDivider} />
            <Pressable onPress={handleDelete} style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]} accessibilityRole="button" accessibilityLabel="Delete Group">
              <MaterialCommunityIcons name="delete-outline" size={18} color="#f87171" />
              <ThemedText style={[styles.menuText, { color: '#fecaca', fontWeight: '700' }]}>Delete Group</ThemedText>
            </Pressable>
          </View>
        </View>
      )}

      {/* Title */}
      <ThemedText type="title" style={styles.title}>{name}</ThemedText>

      {/* Stats and weather chips */}
      <Row align="center" gap="sm" style={{ marginTop: 8, flexWrap: 'wrap' }}>
        <View style={styles.statPill}>
          <MaterialCommunityIcons name="sprout" size={14} color="#a7f3d0" />
          <ThemedText style={styles.statText}>{totalPlants} {totalPlants === 1 ? 'plant' : 'plants'}</ThemedText>
        </View>
        {weather && (
          <>
            <View style={styles.chip}>
              <Feather name="thermometer" size={13} color="#93c5fd" />
              <ThemedText style={styles.chipText}>{weather.temperature}°C</ThemedText>
            </View>
            <View style={styles.chip}>
              <Feather name="cloud-rain" size={13} color="#93c5fd" />
              <ThemedText style={styles.chipText}>{weather.rain}%</ThemedText>
            </View>
            <View style={styles.chip}>
              <Feather name="droplet" size={13} color="#93c5fd" />
              <ThemedText style={styles.chipText}>{weather.humidity}%</ThemedText>
            </View>
          </>
        )}
      </Row>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16, // match PlantCard radius
    paddingHorizontal: 16, // match PlantCard horizontal spacing
    paddingTop: Spacing.headerPadding.vertical,
    paddingBottom: Spacing.headerPadding.vertical,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  cardDark: {
    backgroundColor: 'rgba(17,24,39,0.55)',
    borderColor: 'rgba(255,255,255,0.06)',
  },
  cardLight: {
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderColor: 'rgba(0,0,0,0.06)',
  },
  accent: {
    position: 'absolute',
    top: -40,
    right: -60,
    width: 240,
    height: 160,
    transform: [{ rotate: '20deg' }],
    borderRadius: 120,
  },
  title: {
    ...Typography.styles.h1,
    color: ColorTokens.text.primary,
    letterSpacing: 0.3,
  },
  envPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  envPillText: {
    ...Typography.styles.label,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(16,185,129,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.25)',
  },
  statText: {
    ...Typography.styles.label,
    color: '#d1fae5',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(59,130,246,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.22)',
  },
  chipText: {
    ...Typography.styles.label,
    color: '#dbeafe',
  },
  moreBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  // Menu styles
  menuOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    // Covers the entire header card area
  },
  menuCard: {
    position: 'absolute',
    top: 36, // just below the top row / more button
    right: 6,
    minWidth: 180,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
    zIndex: 10,
  },
  menuCardDark: {
    backgroundColor: 'rgba(17,24,39,0.9)',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  menuCardLight: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderColor: 'rgba(0,0,0,0.06)',
  },
  menuAccent: {
    position: 'absolute',
    top: -20,
    right: -40,
    width: 160,
    height: 100,
    transform: [{ rotate: '18deg' }],
    borderRadius: 80,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  menuItemPressed: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  menuText: {
    ...Typography.styles.body,
    color: ColorTokens.text.primary,
  },
  menuDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
});

export default GroupDetailHeader;
