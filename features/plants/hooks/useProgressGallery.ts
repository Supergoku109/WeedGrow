import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase';

export interface ProgressPic {
  id: string;
  imageUrl: string;
  timestamp: any;
  caption?: string;
}

export function useProgressGallery(plantId?: string) {
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

  return { pics, loading };
}
