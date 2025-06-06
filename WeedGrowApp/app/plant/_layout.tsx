import { withLayoutContext } from 'expo-router';
import { createSharedElementStackNavigator } from 'react-navigation-shared-element';
import React from 'react';

const Stack = createSharedElementStackNavigator();
const PlantStack = withLayoutContext(Stack.Navigator);

export default function PlantLayout() {
  return <PlantStack screenOptions={{ headerShown: false }} />;
}
