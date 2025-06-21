import HomeScreen from '@/features/home/screens/HomeScreen';
import { useLocalSearchParams } from 'expo-router';

export default function TabsIndex() {
  const { tabIndex } = useLocalSearchParams();
  return <HomeScreen initialTabIndex={tabIndex ? Number(tabIndex) : 0} />;
}