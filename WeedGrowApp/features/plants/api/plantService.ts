import { db } from '@/services/firebase';
import { doc, deleteDoc, collection, getDocs, writeBatch } from 'firebase/firestore';

// Main delete function for entire plant + subcollections
export async function deletePlantAndSubcollections(id: string) {
  const plantRef = doc(db, 'plants', id);

  const deleteSubcollection = async (sub: string) => {
    const subSnap = await getDocs(collection(db, 'plants', id, sub));
    const batch = writeBatch(db);
    subSnap.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
  };

  await Promise.all([
    deleteSubcollection('logs'),
    deleteSubcollection('weatherCache'),
    deleteSubcollection('progressPics'),
  ]);

  await deleteDoc(plantRef);
}
