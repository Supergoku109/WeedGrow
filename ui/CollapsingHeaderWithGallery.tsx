import React, { useEffect, useState, useCallback } from 'react';
import { View, Image, StyleSheet, ActivityIndicator, TouchableOpacity, FlatList, Alert } from 'react-native';
import Animated, { useAnimatedStyle, interpolate, Extrapolate } from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/services/firebase';
import * as ImagePicker from 'expo-image-picker';
import { uploadProgressPic } from '@/lib/progressPics/uploadProgressPic';

interface ProgressPic {
  id: string;
  imageUrl: string;
  timestamp: string;
  notes?: string;
}

interface CollapsingHeaderWithGalleryProps {
  plantId: string;
  plantImageUri?: string;
  scrollY: Animated.SharedValue<number>;
  children?: React.ReactNode;
}

const HEADER_MAX_HEIGHT = 220;
const HEADER_MIN_HEIGHT = 100;
const AVATAR_SIZE = 72;

export default function CollapsingHeaderWithGallery({
  plantId,
  plantImageUri,
  scrollY,
  children,
}: CollapsingHeaderWithGalleryProps) {
  const [progressPics, setProgressPics] = useState<ProgressPic[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const theme = (useColorScheme() ?? 'dark') as keyof typeof Colors;

  const fetchPics = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'plants', plantId, 'progressPics'), orderBy('timestamp', 'desc'));
      const snap = await getDocs(q);
      setProgressPics(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProgressPic)));
    } catch {
      Alert.alert('Failed to load progress photos.');
    } finally {
      setLoading(false);
    }
  }, [plantId]);

  useEffect(() => {
    fetchPics();
  }, [fetchPics]);

  const handleAddPicture = async () => {
    if (uploading) return;
    try {
      setUploading(true);
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
      if (!result.canceled && result.assets?.[0]?.uri) {
        await uploadProgressPic(plantId, result.assets[0].uri);
        fetchPics();
      }
    } catch {
      Alert.alert('Failed to upload picture.');
    } finally {
      setUploading(false);
    }
  };

  // Animated style for the background image (absolute, collapses on scroll)
  const animatedBgImageStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
      [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
      Extrapolate.CLAMP
    );
    return {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      width: '100%',
      height,
      zIndex: 0,
    };
  });

  return (
    <View style={{ flex: 1 }}>
      <Animated.View style={animatedBgImageStyle}>
        {plantImageUri ? (
          <Image source={{ uri: plantImageUri }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
        ) : (
          <View style={{ width: '100%', height: '100%', backgroundColor: '#e5e7eb' }} />
        )}
      </Animated.View>
      <View style={{ flex: 1, paddingTop: HEADER_MAX_HEIGHT, zIndex: 1 }}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    // position: 'absolute', // REMOVE
    // bottom: 0, // REMOVE
    // left: 0, // REMOVE
    // right: 0, // REMOVE
  },
  avatarWrapper: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    overflow: 'hidden',
    backgroundColor: '#e5e7eb',
    borderWidth: 2,
    borderColor: '#fff',
    marginRight: 12,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  galleryWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnailWrapper: {
    marginHorizontal: 4,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#e5e7eb',
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnail: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: 12,
  },
  placeholder: {
    backgroundColor: '#e5e7eb',
  },
  addButton: {
    marginLeft: 8,
    marginRight: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
