import HomeScreen from '@/features/groups/screens/HomeScreen';
import { useLocalSearchParams } from 'expo-router';

export default function TabsIndex() {
  const { tabIndex } = useLocalSearchParams();
  return <HomeScreen initialTabIndex={tabIndex ? Number(tabIndex) : 0} />;
}