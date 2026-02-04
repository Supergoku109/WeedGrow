import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Collapsible } from '@/ui/Collapsible';
import { ThemedText } from '@/ui/ThemedText';
import { ThemedView } from '@/ui/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import HomeBackground from '@/features/home/components/HomeBackground';

const SECTIONS = [
  {
    title: 'Account & Security',
    items: [
      'Profile',
      'Change Password',
      'App Lock (PIN/Biometrics)',
      'Language & Region',
    ],
  },
  {
    title: 'Preferences',
    items: [
      'Theme & Appearance',
      'Units',
      'Default Environment',
      'Notifications',
      'Reminder Schedule',
    ],
  },
  {
    title: 'Plant Management',
    items: [
      'My Shared Plants',
      'Watering Calendar',
      'Progress Gallery',
      'Data Export',
      'Backup & Restore',
    ],
  },
  {
    title: 'Community & Help',
    items: ['Support / Feedback', 'FAQ', 'Share the App'],
  },
  {
    title: 'Legal & About',
    items: ['About WeedGrow', 'Terms of Service', 'Privacy Policy', 'Open Source'],
  },
  {
    title: 'Account Actions',
    items: ['Rate & Review', 'Sign Out', 'Delete Account'],
  },
];

export default function MoreScreen() {
  const theme = (useColorScheme() ?? 'dark') as keyof typeof Colors;
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors[theme].background,
        paddingTop: insets.top,
      }}
    >
      <HomeBackground />
      <ScrollView contentContainerStyle={styles.container}>
        {SECTIONS.map((section, index) => (
          <React.Fragment key={section.title}>
            <Collapsible title={section.title}>
              {section.items.map((item) => (
                <ThemedText key={item} style={styles.itemText}>
                  {'\u2022'} {item}
                </ThemedText>
              ))}
            </Collapsible>
            {index < SECTIONS.length - 1 && (
              <ThemedView
                style={[styles.divider, { backgroundColor: Colors[theme].gray }]}
              />
            )}
          </React.Fragment>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 24,
  },
  itemText: {
    marginBottom: 8,
    fontSize: 18,
  },
  divider: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
    marginVertical: 12,
  },
});
