import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  FlatList,
  Linking,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import * as Contacts from "expo-contacts";
import { useFocusEffect } from "@react-navigation/native";

// ✅ GLOBAL STORE
import { useContactStore } from "../store/contactStore";

type Contact = {
  id: string;
  name: string;
  phone: string;
};

export default function ContactsScreen({ navigation }: any) {
  // =========================
  // GLOBAL STATE (IMPORTANT)
  // =========================
  const contacts = useContactStore((state) => state.contacts);
  const loadContacts = useContactStore((state) => state.loadContacts);
  const addContactStore = useContactStore((state) => state.addContact);
  const removeContactStore = useContactStore((state) => state.removeContact);

  // =========================
  // LOCAL UI STATE
  // =========================
  const [phoneContacts, setPhoneContacts] = useState<Contact[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState("");

  // =========================
  // INIT LOAD
  // =========================
  useFocusEffect(
    useCallback(() => {
      loadContacts();
      loadPhoneContacts();
    }, [])
  );

  // =========================
  // LOAD PHONE CONTACTS
  // =========================
  const loadPhoneContacts = async () => {
    const { status } = await Contacts.requestPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Permission required", "Allow contacts access");
      return;
    }

    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.PhoneNumbers],
    });

    const formatted: Contact[] = data
      .filter((c) => c.name && c.phoneNumbers?.length)
      .map((c) => ({
        id: c.id,
        name: c.name,
        phone: c.phoneNumbers?.[0]?.number || "",
      }));

    setPhoneContacts(formatted);
  };

  // =========================
  // ADD CONTACT (GLOBAL)
  // =========================
  const addContact = async (contact: Contact) => {
    const exists = contacts.some((c) => c.id === contact.id);

    if (exists) {
      Alert.alert("Already added", "This contact is already saved");
      return;
    }

    await addContactStore(contact);
  };

  // =========================
  // DELETE CONTACT (GLOBAL)
  // =========================
  const deleteContact = (id: string) => {
    Alert.alert("Remove Contact", "Delete this emergency contact?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await removeContactStore(id);
        },
      },
    ]);
  };

  // =========================
  // CALL CONTACT
  // =========================
  const callContact = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() =>
      Alert.alert("Error", "Cannot open dialer")
    );
  };

  // =========================
  // FILTER SEARCH
  // =========================
  const filteredPhoneContacts = phoneContacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  // =========================
  // RENDER CONTACT
  // =========================
  const renderItem = ({ item }: { item: Contact }) => (
    <View style={styles.contactCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.contactPhone}>{item.phone}</Text>
      </View>

      <TouchableOpacity onPress={() => callContact(item.phone)}>
        <Text style={styles.callIcon}>📞</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => deleteContact(item.id)}>
        <Text style={styles.deleteIcon}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#001F3F" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Trusted Contacts</Text>
      </View>

      {/* CONTENT */}
      <View style={styles.content}>
        <Text style={styles.subtitle}>
          These contacts will receive SOS alerts instantly.
        </Text>

        {/* ADD BUTTON */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addText}>+ Add from Phone Contacts</Text>
        </TouchableOpacity>

        {/* LIST */}
        {contacts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 40 }}>📭</Text>
            <Text style={styles.emptyText}>
              No emergency contacts added yet
            </Text>
          </View>
        ) : (
          <FlatList
            data={contacts}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
          />
        )}
      </View>

      {/* CONTINUE */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          disabled={contacts.length === 0}
          style={[
            styles.continueButton,
            contacts.length === 0 && { backgroundColor: "#aaa" },
          ]}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>

      {/* =========================
          MODAL CONTACT PICKER
      ========================= */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Select Contact</Text>

          <TextInput
            placeholder="Search contacts..."
            value={search}
            onChangeText={setSearch}
            style={styles.search}
          />

          <FlatList
            data={filteredPhoneContacts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const exists = contacts.some((c) => c.id === item.id);

              return (
                <View style={styles.modalCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.contactName}>{item.name}</Text>
                    <Text style={styles.contactPhone}>{item.phone}</Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.addBtn,
                      exists && { backgroundColor: "#999" },
                    ]}
                    disabled={exists}
                    onPress={() => addContact(item)}
                  >
                    <Text style={styles.addText}>
                      {exists ? "Added" : "Add"}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            }}
          />

          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setModalVisible(false)}
          >
            <Text style={{ color: "#fff" }}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

/* =========================
STYLES
========================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },

  header: {
    backgroundColor: "#001F3F",
    paddingTop: 70,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },

  backArrow: { fontSize: 28, color: "#fff", marginRight: 10 },

  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "700" },

  content: { flex: 1, padding: 20 },

  subtitle: { color: "#6B7280", marginBottom: 12 },

  addButton: {
    backgroundColor: "#001F3F",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 15,
  },

  addText: { color: "#fff", fontWeight: "700" },

  contactCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: "center",
  },

  contactName: { fontSize: 16, fontWeight: "600" },

  contactPhone: { fontSize: 13, color: "#6B7280" },

  callIcon: { fontSize: 22, color: "#16A34A", marginHorizontal: 8 },

  deleteIcon: { fontSize: 22, color: "#DC2626" },

  emptyState: { marginTop: 60, alignItems: "center" },

  emptyText: { marginTop: 10, color: "#6B7280" },

  buttonContainer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#fff",
  },

  continueButton: {
    backgroundColor: "#001F3F",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  continueButtonText: { color: "#fff", fontWeight: "700" },

  modalContainer: { flex: 1, padding: 20 },

  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10 },

  search: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },

  modalCard: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  addBtn: {
    backgroundColor: "#28a745",
    padding: 8,
    borderRadius: 8,
    justifyContent: "center",
  },

  closeBtn: {
    backgroundColor: "#001F3F",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
});