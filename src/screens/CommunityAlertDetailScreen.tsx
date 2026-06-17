import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import AlertMap from "../components/AlertMap";
import LocationPinMap from "../components/LocationPinMap";
import {
  getTownCenter,
  MapCoordinate,
} from "../data/gambiaLocations";
import { getCurrentUserId } from "../services/authService";
import { getFirebaseAuth } from "../services/firebase";
import {
  deleteCommunityAlert,
  isCommunityAlertOwner,
  updateCommunityAlert,
} from "../services/incidentService";
import { CommunityAlert } from "../types/emergency";

export default function CommunityAlertDetailScreen({ navigation, route }: any) {
  const initialAlert: CommunityAlert | undefined = route.params?.alert;
  const startEditing = Boolean(route.params?.edit);

  const [alert, setAlert] = useState<CommunityAlert | undefined>(initialAlert);
  const [editing, setEditing] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [ownershipReady, setOwnershipReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [location, setLocation] = useState(initialAlert?.location ?? "");
  const [description, setDescription] = useState(initialAlert?.description ?? "");
  const [mapCenter, setMapCenter] = useState<MapCoordinate>(
    initialAlert?.latitude != null && initialAlert?.longitude != null
      ? { latitude: initialAlert.latitude, longitude: initialAlert.longitude }
      : getTownCenter(initialAlert?.location ?? "")
  );
  const [pin, setPin] = useState<MapCoordinate | null>(
    initialAlert?.latitude != null && initialAlert?.longitude != null
      ? { latitude: initialAlert.latitude, longitude: initialAlert.longitude }
      : null
  );
  const [centerRevision, setCenterRevision] = useState(0);

  useFocusEffect(
    useCallback(() => {
      if (!initialAlert) return;

      let active = true;

      (async () => {
        const userId = await getCurrentUserId();
        const firebaseUid = getFirebaseAuth()?.currentUser?.uid ?? null;
        const owned = isCommunityAlertOwner(initialAlert, userId, firebaseUid);

        if (!active) return;

        setIsOwner(owned);
        setOwnershipReady(true);
        setEditing(owned && startEditing);
      })();

      return () => {
        active = false;
      };
    }, [initialAlert, startEditing])
  );

  useEffect(() => {
    if (ownershipReady && !isOwner) {
      setEditing(false);
    }
  }, [isOwner, ownershipReady]);

  const mapCoordinate = useMemo(() => {
    if (pin) return pin;
    if (alert?.latitude != null && alert?.longitude != null) {
      return { latitude: alert.latitude, longitude: alert.longitude };
    }
    return getTownCenter(alert?.location ?? "");
  }, [alert, pin]);

  const hasExactPin = pin != null || (alert?.latitude != null && alert?.longitude != null);

  if (!alert) {
    return (
      <View style={styles.center}>
        <Text>Alert not found</Text>
      </View>
    );
  }

  const handleSave = async () => {
    if (!isOwner) return;

    if (!location.trim()) {
      Alert.alert("Error", "Please enter a location");
      return;
    }

    setIsSaving(true);
    try {
      const updated = await updateCommunityAlert(alert.id, {
        location: location.trim(),
        description: description.trim() || alert.description,
        latitude: pin?.latitude ?? alert.latitude,
        longitude: pin?.longitude ?? alert.longitude,
      });

      if (!updated) {
        Alert.alert("Error", "Could not update this alert.");
        return;
      }

      setAlert(updated);
      setEditing(false);
      Alert.alert("Updated", "Your report has been updated.");
    } catch {
      Alert.alert("Error", "Could not update this alert.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!isOwner) return;

    Alert.alert(
      "Delete report?",
      "This will remove your report from the community feed.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const ok = await deleteCommunityAlert(alert.id);
            if (!ok) {
              Alert.alert("Error", "Could not delete this alert.");
              return;
            }
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#001F3F" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Alert Details</Text>
        {isOwner && !editing ? (
          <TouchableOpacity onPress={() => setEditing(true)}>
            <Text style={styles.headerAction}>Edit</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{alert.severity.toUpperCase()}</Text>
        </View>

        <Text style={styles.title}>{alert.title}</Text>

        {isOwner && editing ? (
          <>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={(text) => {
                setLocation(text);
                setMapCenter(getTownCenter(text));
                setCenterRevision((value) => value + 1);
              }}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <Text style={styles.label}>Pin location</Text>
            <LocationPinMap
              center={mapCenter}
              pin={pin}
              onPinChange={setPin}
              centerRevision={centerRevision}
            />
          </>
        ) : (
          <>
            <Text style={styles.location}>{alert.location}</Text>
            {alert.description ? (
              <Text style={styles.description}>{alert.description}</Text>
            ) : null}
          </>
        )}

        <View style={styles.mapSection}>
          <Text style={styles.mapLabel}>
            {hasExactPin ? "Incident location" : "Approximate area"}
          </Text>
          <AlertMap coordinate={editing && pin ? pin : mapCoordinate} />
        </View>

        {isOwner && editing ? (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => {
                setEditing(false);
                setLocation(alert.location);
                setDescription(alert.description ?? "");
                setPin(
                  alert.latitude != null && alert.longitude != null
                    ? { latitude: alert.latitude, longitude: alert.longitude }
                    : null
                );
                setMapCenter(
                  alert.latitude != null && alert.longitude != null
                    ? { latitude: alert.latitude, longitude: alert.longitude }
                    : getTownCenter(alert.location)
                );
              }}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : null}

        {isOwner && !editing ? (
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Text style={styles.deleteText}>Delete my report</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    backgroundColor: "#001F3F",
    paddingTop: 50,
    paddingBottom: 18,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backArrow: { fontSize: 28, color: "#fff", marginRight: 12 },
  headerTitle: { flex: 1, fontSize: 20, color: "#fff", fontWeight: "700" },
  headerAction: { color: "#93C5FD", fontWeight: "700", fontSize: 15 },
  headerSpacer: { width: 40 },
  content: { padding: 20, paddingBottom: 40 },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#0F172A",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  badgeText: { color: "#fff", fontWeight: "800", fontSize: 12 },
  title: { fontSize: 22, fontWeight: "800", color: "#0F172A", marginBottom: 6 },
  location: { fontSize: 15, color: "#64748B", marginBottom: 10 },
  description: { fontSize: 15, color: "#334155", lineHeight: 22, marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "600", color: "#334155", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  textArea: { minHeight: 90, textAlignVertical: "top" },
  mapSection: { marginTop: 8, marginBottom: 16 },
  mapLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  actionRow: { flexDirection: "row", gap: 10, marginTop: 8 },
  cancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    alignItems: "center",
  },
  cancelText: { color: "#64748B", fontWeight: "700" },
  saveBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#001F3F",
    alignItems: "center",
  },
  saveText: { color: "#fff", fontWeight: "700" },
  deleteBtn: {
    marginTop: 20,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
  },
  deleteText: { color: "#DC2626", fontWeight: "700" },
});
