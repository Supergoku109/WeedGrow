import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].background,
          borderTopWidth: 0,
          ...(Platform.OS === 'ios' ? { position: 'absolute' } : {}),
        },
      }}>
      <Tabs.Screen
        name="unknown"
        options={{
          title: 'Unknown',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="questionmark.circle" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="plants"
        options={{
          title: 'Plants',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="leaf.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Learn',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="book.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="ellipsis.circle" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
