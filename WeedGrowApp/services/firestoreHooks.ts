import { useEffect, useState } from 'react';
import {
  onSnapshot,
  Query,
  CollectionReference,
  DocumentReference,
  DocumentData,
} from 'firebase/firestore';

/**
 * Subscribe to a Firestore collection or query and return an array of docs.
 * Automatically cleans up the listener on unmount.
 */
export function useFirestoreCollection<T = DocumentData>(
  ref: Query<T> | CollectionReference<T> | null
) {
  const [data, setData] = useState<Array<T & { id: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ref) {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const unsubscribe = onSnapshot(
      ref,
      snapshot => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as T),
        }));
        setData(items);
        setLoading(false);
      },
      err => {
        setError(err.message);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [ref]);

  return { data, loading, error };
}

/**
 * Subscribe to a Firestore document and return its data.
 * Automatically cleans up the listener on unmount.
 */
export function useFirestoreDocument<T = DocumentData>(ref: DocumentReference<T> | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ref) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const unsubscribe = onSnapshot(
      ref,
      snap => {
        setData(snap.exists() ? (snap.data() as T) : null);
        setLoading(false);
      },
      err => {
        setError(err.message);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [ref]);

  return { data, loading, error };
}
