import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { Row } from '@/design-system/components/Row/Row';
import { ColorTokens, Typography, Spacing } from '@/design-system/tokens';
import { useColorScheme } from '@/hooks/useColorScheme';
import ThemedText from '@/ui/ThemedText';
import { Menu } from 'react-native-paper';

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
    <View style={styles.container}>
      {/* Top row: Name + env icon, more menu */}
      <Row justify="space-between" align="center" style={{ marginBottom: Spacing.xs }}>
        <Row align="center" gap="sm">
          <ThemedText type="title" style={styles.title}>{name}</ThemedText>
          <MaterialCommunityIcons name={icon as any} size={18} color={color} style={{ marginLeft: 4 }} />
        </Row>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.moreBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Feather name="more-horizontal" size={24} color={ColorTokens.text.secondary} />
            </TouchableOpacity>
          }
        >
          <Menu.Item onPress={handleEdit} title="Edit Group" leadingIcon="pencil" />
          <Menu.Item onPress={handleDelete} title="Delete Group" leadingIcon="delete" />
        </Menu>
      </Row>
      {/* Environment row */}
      <ThemedText style={styles.envLabel}>Environment: {label}</ThemedText>
      {/* Weather row */}
      {weather && (
        <Row align="center" gap="md" style={{ marginTop: Spacing.xs }}>
          <Row align="center" gap="xs">
            <Feather name="thermometer" size={15} color={ColorTokens.logTypes.watering} />
            <ThemedText style={styles.weatherText}>Temp: {weather.temperature}°C</ThemedText>
          </Row>
          <Row align="center" gap="xs">
            <Feather name="cloud-rain" size={15} color={ColorTokens.logTypes.watering} />
            <ThemedText style={styles.weatherText}>Rain: {weather.rain}%</ThemedText>
          </Row>
          <Row align="center" gap="xs">
            <Feather name="droplet" size={15} color={ColorTokens.logTypes.watering} />
            <ThemedText style={styles.weatherText}>Humidity: {weather.humidity}%</ThemedText>
          </Row>
        </Row>
      )}
      {/* Plant count row */}
      <ThemedText style={styles.plantCount}>Plants in Group: {totalPlants}</ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.headerPadding.horizontal,
    paddingTop: Spacing.headerPadding.vertical,
    paddingBottom: Spacing.headerPadding.vertical,
    backgroundColor: 'transparent',
  },
  title: {
    ...Typography.styles.h2,
    color: ColorTokens.text.primary,
  },
  envLabel: {
    ...Typography.styles.label,
    color: ColorTokens.text.accent,
    marginBottom: 2,
  },
  weatherText: {
    ...Typography.styles.bodySmall,
    color: ColorTokens.text.secondary,
  },
  plantCount: {
    ...Typography.styles.label,
    color: ColorTokens.environment.greenhouse,
    marginTop: 6,
  },
  moreBtn: {
    marginLeft: 8,
    padding: 4,
  },
});

export default GroupDetailHeader;
