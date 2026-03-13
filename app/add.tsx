import { useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";

export default function AddScreen() {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");

  function handleSave() {
    const newItem = {
      id: Date.now().toString(),
      title,
      type,
      status
    };

    console.log("New item:", newItem);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>

        <Text style={styles.title}>Add Learning Item</Text>

        <TextInput
          placeholder="Title"
          placeholderTextColor="#94a3b8"
          style={styles.input}
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          placeholder="Type (course, book, certification)"
          placeholderTextColor="#94a3b8"
          style={styles.input}
          value={type}
          onChangeText={setType}
        />

        <TextInput
          placeholder="Status (planned, in-progress, complete)"
          placeholderTextColor="#94a3b8"
          style={styles.input}
          value={status}
          onChangeText={setStatus}
        />

        <Pressable style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Save Item</Text>
        </Pressable>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  content: {
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#f8fafc",
  },
  input: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 12,
    color: "#f8fafc",
  },
  button: {
    backgroundColor: "#38bdf8",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    fontWeight: "600",
    color: "#0f172a",
  },
});