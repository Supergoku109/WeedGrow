import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'cache_';
const CACHE_EXPIRATION = 1000 * 60 * 60; // 1 hour

export const setCachedData = async (key: string, data: any) => {
  try {
    const item = {
      data,
      timestamp: new Date().getTime(),
    };
    await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item));
  } catch (error) {
    console.error(`Failed to cache data for key ${key}:`, error);
  }
};

export const getCachedData = async (key: string) => {
  try {
    const item = await AsyncStorage.getItem(CACHE_PREFIX + key);
    if (item === null) {
      return null;
    }

    const cached = JSON.parse(item);
    if (new Date().getTime() - cached.timestamp > CACHE_EXPIRATION) {
      await AsyncStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }

    return cached.data;
  } catch (error) {
    console.error(`Failed to retrieve cached data for key ${key}:`, error);
    return null;
  }
};
