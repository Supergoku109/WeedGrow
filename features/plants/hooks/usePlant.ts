import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { Plant } from '@/firestoreModels';

export function usePlant(id?: string) {
  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setPlant(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const ref = doc(db, 'plants', id);
    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        setPlant(snap.exists() ? (snap.data() as Plant) : null);
        setLoading(false);
      },
      () => {
        setPlant(null);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [id]);

  return { plant, loading };
}
