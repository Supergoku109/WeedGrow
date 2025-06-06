import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

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
  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        {SECTIONS.map((section) => (
          <Collapsible key={section.title} title={section.title}>
            {section.items.map((item) => (
              <ThemedText key={item} style={styles.itemText}>
                {'\u2022'} {item}
              </ThemedText>
            ))}
          </Collapsible>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  itemText: {
    marginBottom: 4,
  },
});
