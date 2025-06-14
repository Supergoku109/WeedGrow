import React from 'react';
import { FlatList, View, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Snackbar, ActivityIndicator } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/ui/ThemedText';
import GroupCard from '@/features/groups/components/GroupCard';
import EditGroupModal from '@/features/groups/components/EditGroupModal';
import { useGroupList } from '@/features/groups/hooks/useGroupList';

export default function GroupListScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const theme = (useColorScheme() ?? 'dark') as keyof typeof Colors;
  const state = useGroupList();

  return (
    <View style={{ flex: 1, backgroundColor: Colors[theme].background, paddingTop: insets.top }}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>Plant Groups</ThemedText>
        <ThemedText style={styles.subtitle}>Your grow spaces at a glance. Tap + to add a group.</ThemedText>
      </View>

      <FlatList
        data={state.groups}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          state.loading ? (
            <ActivityIndicator style={styles.loading} color={Colors[theme].tint} />
          ) : state.error ? (
            <ThemedText>❌ {state.error}</ThemedText>
          ) : (
            <ThemedText>No groups found.</ThemedText>
          )
        }
        renderItem={({ item }) => (
          <GroupCard
            group={item}
            onWaterAll={() => state.handleWaterAll(item.id)}
            waterDisabled={state.wateringId === item.id}
            onEdit={() => state.setEditGroup(item)}
          />
        )}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: insets.top + 16,
          paddingBottom: 32,
          gap: 12,
          flexGrow: 1,
        }}
      />

      <Snackbar visible={state.snackVisible} onDismiss={() => state.setSnackVisible(false)} duration={3000}>
        {state.snackMessage}
      </Snackbar>

      <TouchableOpacity
        accessibilityLabel="Add Group"
        onPress={() => router.push('/add-group')}
        style={[styles.fab, { backgroundColor: Colors[theme].tint }]}
      >
        <MaterialCommunityIcons name="plus" size={28} color={Colors[theme].white} />
      </TouchableOpacity>

      <EditGroupModal
        visible={!!state.editGroup}
        group={state.editGroup as any}
        allPlants={state.allPlants}
        onClose={() => state.setEditGroup(null)}
        onSave={state.reloadGroups}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', marginBottom: 4, marginTop: 8 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#4caf50', marginTop: 12 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 8, marginHorizontal: 8 },
  loading: { marginTop: 20 },
  fab: {
    position: 'absolute', right: 20, bottom: 20,
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center', elevation: 5,
  },
});
