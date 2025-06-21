// GroupHeader.tsx
// This component displays the header for a group, including its name, environment icon, and edit/delete actions.
// It is used at the top of the group detail screen.

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { IconButton, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/ui/ThemedText';
import type { Group } from '@/firestoreModels';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

// Props for the GroupHeader component
interface Props {
  group: Group & { id: string };
  deleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export default function GroupHeader({ group, deleting, onEdit, onDelete }: Props) {
  const theme = (useColorScheme() ?? 'dark') as keyof typeof Colors;

  return (
    <View style={styles.headerRow}>
      {/* Icon for group environment */}
      <MaterialCommunityIcons
        name={
          group.environment === 'indoor'
            ? 'home'
            : group.environment === 'outdoor'
            ? 'weather-sunny'
            : 'greenhouse'
        }
        size={28}
        color={Colors[theme].tint}
        style={{ marginRight: 8 }}
      />
      {/* Group name */}
      <ThemedText type="title" style={styles.groupName}>{group.name}</ThemedText>
      {/* Edit and delete buttons */}
      <IconButton icon="pencil" onPress={onEdit} />
      <IconButton icon="delete" onPress={onDelete} loading={deleting} disabled={deleting} />
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  groupName: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
});
