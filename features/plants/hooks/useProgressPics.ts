import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase';

export function useProgressPics(id?: string) {
  const [progressPics, setProgressPics] = useState<string[]>([]);

  useEffect(() => {
    if (!id) return;

    (async () => {
      const picsSnap = await getDocs(collection(db, 'plants', id, 'progressPics'));
      setProgressPics(picsSnap.docs.map(doc => doc.data().url).filter(Boolean));
    })();
  }, [id]);

  return { progressPics };
}
