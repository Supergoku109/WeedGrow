import { db } from '../../firebase';

export async function updateFirestore(
  plantId: string,
  date: string,
  data: any
): Promise<void> {
  // TODO: Save parsed data per plant/date to Firestore
  console.log('updateFirestore stub', plantId, date, data);
}
