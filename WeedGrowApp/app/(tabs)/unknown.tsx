// File: app/(tabs)/unknown.tsx

import React, { useEffect, useState } from "react";
import { StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";

import { collection, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";

interface TestDoc {
  id: string;
  Plant: string;
  Status: string;
}

export default function UnknownScreen() {
  const [docs, setDocs] = useState<TestDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTestDocs = async () => {
      try {
        const testCol = collection(db, "test");
        const snapshot = await getDocs(testCol);
        const items: TestDoc[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as any;
          return {
            id: docSnap.id,
            Plant: data.Plant,
            Status: data.Status,
          };
        });
        setDocs(items);
      } catch (e: any) {
        console.error("Error fetching test docs:", e);
        setError(e.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchTestDocs();
  }, []);

  return (
    // 1) Wrap in SafeAreaView so header isn't under the status bar
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          Firestore Test
        </ThemedText>

        {loading && <ThemedText>Loading data…</ThemedText>}

        {error && (
          <ThemedText type="error" style={styles.errorText}>
            ❌ Error: {error}
          </ThemedText>
        )}

        {!loading && !error && docs.length === 0 && (
          <ThemedText>No test documents found.</ThemedText>
        )}

        {!loading && !error && docs.length > 0 && (
          <FlatList
            data={docs}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ThemedView style={styles.cardDark} key={item.id}>
                <ThemedText>
                  <ThemedText type="bold">ID:</ThemedText> {item.id}
                </ThemedText>
                <ThemedText>
                  <ThemedText type="bold">Plant:</ThemedText> {item.Plant}
                </ThemedText>
                <ThemedText>
                  <ThemedText type="bold">Status:</ThemedText> {item.Status}
                </ThemedText>
              </ThemedView>
            )}
          />
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000", // match dark background so it doesn’t flash white
  },
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    textAlign: "center",
    marginBottom: 20,
  },
  errorText: {
    color: "red",
    marginTop: 10,
  },
  cardDark: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#333", // dark gray so the default white text is visible
    borderRadius: 8,
  },
});
