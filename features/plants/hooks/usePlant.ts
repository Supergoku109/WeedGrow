import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { Plant } from '@/firestoreModels';

export function usePlant(id?: string) {
  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetch = async () => {
      const ref = doc(db, 'plants', id);
      const snap = await getDoc(ref);
      if (snap.exists()) setPlant(snap.data() as Plant);
      setLoading(false);
    };

    fetch();
  }, [id]);

  return { plant, loading };
}
