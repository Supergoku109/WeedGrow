import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './services/firebase';

function App() {
  const [count, setCount] = useState(0);
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'test'));
        const docs = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDocuments(docs);
      } catch (error) {
        console.error('Error fetching documents:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1>🌿 Welcome Grover</h1>
      <p>This is your weed grower app homepage</p>

      <button onClick={() => setCount((c) => c + 1)}>
        Count is {count}
      </button>

      <h2>🔥 Firestore Test Data</h2>
      {documents.length > 0 ? (
        <ul>
          {documents.map(doc => (
            <li key={doc.id}>{JSON.stringify(doc)}</li>
          ))}
        </ul>
      ) : (
        <p>No documents found in "test" collection</p>
      )}
    </div>
  );
}

export default App;
