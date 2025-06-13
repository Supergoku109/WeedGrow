import React, { useEffect, useState } from 'react';
import { View, FlatList, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { ThemedText } from '@/ui/ThemedText';

interface ProgressPic {
  id: string;
  imageUrl: string;
  timestamp: any;
  caption?: string;
}

export default function ProgressGallery() {
  const { plantId } = useLocalSearchParams<{ plantId: string }>();
  const [pics, setPics] = useState<ProgressPic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!plantId) return;
    (async () => {
      const snap = await getDocs(collection(db, 'plants', String(plantId), 'progressPics'));
      const arr: ProgressPic[] = snap.docs.map((d) => ({ id: d.id, ...d.data() } as any));
      arr.sort((a, b) => (b.timestamp?.toMillis?.() || 0) - (a.timestamp?.toMillis?.() || 0));
      setPics(arr);
      setLoading(false);
    })();
  }, [plantId]);

  const numColumns = 3;
  const size = Math.floor(Dimensions.get('window').width / numColumns) - 8;

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', padding: 8 }}>
      <ThemedText style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 12 }}>Progress Gallery</ThemedText>
      {loading ? (
        <ThemedText>Loading...</ThemedText>
      ) : (
        <FlatList
          data={pics}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          renderItem={({ item }) => (
            <TouchableOpacity style={{ margin: 4 }}>
              <Image source={{ uri: item.imageUrl }} style={{ width: size, height: size, borderRadius: 10, backgroundColor: '#e0e7ef' }} />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
