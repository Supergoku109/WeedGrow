import * as React from 'react';
import { View, StyleSheet, useWindowDimensions, Text } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
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
  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
      renderTabBar={props => (
        <TabBar
          {...props}
          indicatorStyle={{ backgroundColor: Colors.light.tint, height: 3, borderRadius: 2 }}
          style={styles.tabBar}
          activeColor={Colors.light.tint}
          inactiveColor={'#888'}
          pressColor={Colors.light.tint + '22'}
        />
      )}
      swipeEnabled
    />
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 0,
    marginBottom: 4,
  },
  tabLabel: {
    fontWeight: '600',
    fontSize: 16,
    textTransform: 'none',
    margin: 0,
    padding: 0,
  },
});
