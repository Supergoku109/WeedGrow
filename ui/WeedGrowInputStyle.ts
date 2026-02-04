import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export function useWeedGrowInputStyle() {
  // Use moderate borderRadius and overflow: 'hidden' to prevent border gaps
  return {
    inputStyle: {
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      backgroundColor: '#1a2e22',
      borderColor: '#fff',
      borderWidth: 1.5,
      borderStyle: 'solid',
      overflow: 'hidden',
    },
    menuInputStyle: {
      marginBottom: 14,
      height: 56,
    },
    menuContentStyle: {
      minHeight: 56,
      height: 56,
      paddingTop: 0,
      paddingBottom: 0,
    },
    iconStyle: {
      marginTop: 20,
      marginBottom: 0,
    },
  };
}
