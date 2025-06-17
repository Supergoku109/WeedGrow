import * as React from 'react';
import { View, StyleSheet, useWindowDimensions, Text, Pressable } from 'react-native';
import { TabView, SceneMap, SceneRendererProps, NavigationState } from 'react-native-tab-view';
import { Colors } from '@/constants/Colors';

interface SwipeTabsProps {
  tabs: { key: string; title: string; render: () => React.ReactNode }[];
  initialKey?: string;
  index?: number;
  onIndexChange?: (idx: number) => void;
}

export default function SwipeTabs({ tabs, initialKey, index: controlledIndex, onIndexChange }: SwipeTabsProps) {
  const layout = useWindowDimensions();
  const [uncontrolledIndex, setUncontrolledIndex] = React.useState(
    initialKey ? Math.max(0, tabs.findIndex(t => t.key === initialKey)) : 0
  );
  const index = controlledIndex !== undefined ? controlledIndex : uncontrolledIndex;
  const setIndex = onIndexChange || setUncontrolledIndex;
  const routes = tabs.map(({ key, title }) => ({ key, title }));
  const renderScene = SceneMap(
    Object.fromEntries(tabs.map(tab => [tab.key, tab.render]))
  );

  // Custom tab bar for pill-style tabs
  const renderTabBar = ({ navigationState, position }: SceneRendererProps & { navigationState: NavigationState<{ key: string; title: string }> }) => (
    <View style={styles.pillTabBarContainer}>
      {navigationState.routes.map((route: { key: string; title: string }, i: number) => {
        const active = index === i;
        return (
          <Pressable
            key={route.key}
            onPress={() => setIndex(i)}
            style={[styles.pillTab, active && styles.pillTabActive]}
          >
            <Text style={[styles.pillTabLabel, active && styles.pillTabLabelActive]}>{route.title}</Text>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
      renderTabBar={renderTabBar}
      swipeEnabled
    />
  );
}

const styles = StyleSheet.create({
  pillTabBarContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30,40,36,0.85)',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    marginTop: 2,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  pillTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'transparent',
    transitionDuration: '150ms',
  },
  pillTabActive: {
    backgroundColor: Colors.light.tint,
  },
  pillTabLabel: {
    color: '#bbb',
    fontWeight: '700',
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  pillTabLabelActive: {
    color: '#fff',
  },
});
