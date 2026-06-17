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
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as Contacts from "expo-contacts";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { useContactStore } from "../store/contactStore";
import { COLORS } from "../theme/colors";

type Contact = {
  id: string;
  name: string;
  phone: string;
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "?";
}

function avatarColor(name: string) {
  const colors = ["#DBEAFE", "#DCFCE7", "#FEF3C7", "#FCE7F3", "#EDE9FE"];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

export default function ContactsScreen({ navigation }: any) {
  const contacts = useContactStore((state) => state.contacts);
  const loadContacts = useContactStore((state) => state.loadContacts);
  const addContactStore = useContactStore((state) => state.addContact);
  const removeContactStore = useContactStore((state) => state.removeContact);

  const [phoneContacts, setPhoneContacts] = useState<Contact[]>([]);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [manualVisible, setManualVisible] = useState(false);
  const [addMenuVisible, setAddMenuVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [manualName, setManualName] = useState("");
  const [manualPhone, setManualPhone] = useState("");

  useFocusEffect(
    useCallback(() => {
      loadContacts();
    }, [loadContacts])
  );

  const loadPhoneContacts = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Allow contacts access to import from your phone.");
      return false;
    }

    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.PhoneNumbers],
    });

    const formatted: Contact[] = data
      .filter((c) => c.name && c.phoneNumbers?.length)
      .map((c) => ({
        id: c.id,
        name: c.name!,
        phone: c.phoneNumbers?.[0]?.number || "",
      }));

    setPhoneContacts(formatted);
    return true;
  };

  const openPhonePicker = async () => {
    setAddMenuVisible(false);
    const ok = await loadPhoneContacts();
    if (ok) {
      setSearch("");
      setPickerVisible(true);
    }
  };

  const addContact = async (contact: Contact) => {
    const exists = contacts.some(
      (c) => c.phone.replace(/\D/g, "") === contact.phone.replace(/\D/g, "")
    );

    if (exists) {
      Alert.alert("Already added", "This contact is already in your emergency list.");
      return;
    }

    await addContactStore(contact);
  };

  const addManualContact = async () => {
    const name = manualName.trim();
    const phone = manualPhone.trim();

    if (!name) {
      Alert.alert("Name required", "Enter a contact name.");
      return;
    }
    if (!phone || phone.replace(/\D/g, "").length < 7) {
      Alert.alert("Phone required", "Enter a valid phone number.");
      return;
    }

    await addContact({
      id: `manual-${Date.now()}`,
      name,
      phone,
    });

    setManualName("");
    setManualPhone("");
    setManualVisible(false);
  };

  const showContactMenu = (contact: Contact) => {
    Alert.alert(contact.name, contact.phone, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Call",
        onPress: () => callContact(contact.phone),
      },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => deleteContact(contact.id),
      },
    ]);
  };

  const deleteContact = (id: string) => {
    Alert.alert("Remove contact", "Remove this emergency contact?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => removeContactStore(id),
      },
    ]);
  };

  const callContact = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() =>
      Alert.alert("Error", "Cannot open dialer")
    );
  };

  const filteredPhoneContacts = phoneContacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const renderContact = ({ item }: { item: Contact }) => (
    <View style={styles.contactCard}>
      <View
        style={[styles.avatar, { backgroundColor: avatarColor(item.name) }]}
      >
        <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
      </View>

      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.contactPhone}>{item.phone}</Text>
      </View>

      <TouchableOpacity
        style={styles.iconBtn}
        onPress={() => callContact(item.phone)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="call-outline" size={22} color={COLORS.buttonBlue} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.iconBtn}
        onPress={() => showContactMenu(item)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="ellipsis-vertical" size={20} color="#64748B" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={26} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trusted Contacts</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>
          These contacts will be notified during emergencies.
        </Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setAddMenuVisible(true)}
        >
          <Ionicons name="add" size={20} color={COLORS.buttonBlue} />
          <Text style={styles.addButtonText}>Add Contact</Text>
        </TouchableOpacity>

        {contacts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No contacts yet</Text>
            <Text style={styles.emptyText}>
              Add family or friends who should receive your SOS alerts.
            </Text>
          </View>
        ) : (
          <FlatList
            data={contacts}
            keyExtractor={(item) => item.id}
            renderItem={renderContact}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          disabled={contacts.length === 0}
          style={[
            styles.continueButton,
            contacts.length === 0 && styles.continueDisabled,
          ]}
          onPress={() => navigation.navigate("MainTabs")}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>

      {/* Add contact options */}
      <Modal visible={addMenuVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setAddMenuVisible(false)}
        >
          <View style={styles.addMenu}>
            <Text style={styles.addMenuTitle}>Add emergency contact</Text>
            <TouchableOpacity
              style={styles.addMenuItem}
              onPress={() => {
                setAddMenuVisible(false);
                setManualVisible(true);
              }}
            >
              <Ionicons name="create-outline" size={22} color={COLORS.buttonBlue} />
              <Text style={styles.addMenuItemText}>Enter name & phone</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addMenuItem} onPress={openPhonePicker}>
              <Ionicons name="phone-portrait-outline" size={22} color={COLORS.buttonBlue} />
              <Text style={styles.addMenuItemText}>Import from phone</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addMenuCancel}
              onPress={() => setAddMenuVisible(false)}
            >
              <Text style={styles.addMenuCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Manual entry */}
      <Modal visible={manualVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.manualSheet}>
            <Text style={styles.manualTitle}>New contact</Text>
            <TextInput
              style={styles.input}
              placeholder="Name (e.g. Mother)"
              value={manualName}
              onChangeText={setManualName}
              autoCapitalize="words"
            />
            <TextInput
              style={styles.input}
              placeholder="Phone (e.g. +220 700 1234)"
              value={manualPhone}
              onChangeText={setManualPhone}
              keyboardType="phone-pad"
            />
            <TouchableOpacity style={styles.saveBtn} onPress={addManualContact}>
              <Text style={styles.saveBtnText}>Save contact</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setManualVisible(false)}>
              <Text style={styles.cancelLink}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Phone contact picker */}
      <Modal visible={pickerVisible} animationType="slide">
        <View style={styles.pickerContainer}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Select from phone</Text>
            <TouchableOpacity onPress={() => setPickerVisible(false)}>
              <Ionicons name="close" size={28} color={COLORS.text} />
            </TouchableOpacity>
          </View>

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
                <View style={styles.pickerRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.contactName}>{item.name}</Text>
                    <Text style={styles.contactPhone}>{item.phone}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.pickerAddBtn, exists && styles.pickerAddDisabled]}
                    disabled={exists}
                    onPress={async () => {
                      await addContact(item);
                    }}
                  >
                    <Text style={styles.pickerAddText}>
                      {exists ? "Added" : "Add"}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            }}
            ListEmptyComponent={
              <Text style={styles.emptyPicker}>No contacts found on this device.</Text>
            }
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },

  header: {
    backgroundColor: "#FFFFFF",
    paddingTop: Platform.OS === "web" ? 20 : 56,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },

  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },

  headerSpacer: { width: 40 },

  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },

  subtitle: {
    textAlign: "center",
    color: "#64748B",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
    paddingHorizontal: 12,
  },

  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: COLORS.buttonBlue,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 20,
  },

  addButtonText: {
    color: COLORS.buttonBlue,
    fontWeight: "700",
    fontSize: 16,
  },

  listContent: { paddingBottom: 16 },

  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  avatarText: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.buttonBlue,
  },

  contactInfo: { flex: 1 },

  contactName: { fontSize: 16, fontWeight: "700", color: COLORS.text },

  contactPhone: { fontSize: 14, color: "#64748B", marginTop: 2 },

  iconBtn: {
    padding: 8,
    marginLeft: 4,
  },

  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 80,
    paddingHorizontal: 24,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },

  emptyText: {
    textAlign: "center",
    color: "#64748B",
    fontSize: 15,
    lineHeight: 22,
  },

  footer: {
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 32 : 20,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },

  continueButton: {
    backgroundColor: COLORS.buttonBlue,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  continueDisabled: { backgroundColor: "#94A3B8" },

  continueButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },

  addMenu: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 32,
  },

  addMenuTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 16,
    textAlign: "center",
  },

  addMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  addMenuItemText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },

  addMenuCancel: {
    marginTop: 16,
    alignItems: "center",
    paddingVertical: 12,
  },

  addMenuCancelText: { color: "#64748B", fontSize: 16, fontWeight: "600" },

  manualSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 32,
  },

  manualTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    color: COLORS.text,
  },

  input: {
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: "#F8FAFC",
  },

  saveBtn: {
    backgroundColor: COLORS.buttonBlue,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },

  saveBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 16 },

  cancelLink: {
    textAlign: "center",
    color: "#64748B",
    marginTop: 16,
    fontSize: 15,
  },

  pickerContainer: { flex: 1, backgroundColor: "#F8FAFC", paddingTop: 56 },

  pickerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 12,
  },

  pickerTitle: { fontSize: 20, fontWeight: "700", color: COLORS.text },

  search: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 12,
    fontSize: 16,
  },

  pickerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },

  pickerAddBtn: {
    backgroundColor: COLORS.buttonBlue,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },

  pickerAddDisabled: { backgroundColor: "#94A3B8" },

  pickerAddText: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },

  emptyPicker: {
    textAlign: "center",
    color: "#64748B",
    marginTop: 40,
    paddingHorizontal: 24,
  },
});
