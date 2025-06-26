// GroupHeader.tsx
// This component displays the header for a group, including its name, environment icon, and edit/delete actions.
// It is used at the top of the group detail screen.

import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/ui/ThemedText';
import type { Group } from '@/firestoreModels';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface GroupHeaderProps {
  group: Group & { id: string };
  deleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

const GroupHeader = memo(function GroupHeader({ group, deleting, onEdit, onDelete }: GroupHeaderProps) {
  const theme = (useColorScheme() ?? 'dark') as keyof typeof Colors;
  const getEnvIcon = () => {
    if (group.environment === 'indoor') return 'home';
    if (group.environment === 'outdoor') return 'weather-sunny';
    return 'greenhouse';
  };
  return (
    <View style={styles.headerRow}>
      <MaterialCommunityIcons
        name={getEnvIcon()}
        size={28}
        color={Colors[theme].tint}
        style={styles.envIcon}
      />
      <ThemedText type="title" style={styles.groupName}>{group.name}</ThemedText>
      <IconButton icon="pencil" onPress={onEdit} accessibilityLabel="Edit group" />
      <IconButton icon="delete" onPress={onDelete} loading={deleting} disabled={deleting} accessibilityLabel="Delete group" />
    </View>
  );
});

export default GroupHeader;

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  envIcon: {
    marginRight: 8,
  },
  groupName: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
});
