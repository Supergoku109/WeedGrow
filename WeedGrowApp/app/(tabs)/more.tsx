import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Collapsible } from '@/components/Collapsible';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors[theme].background }}>
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
    </SafeAreaView>
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
