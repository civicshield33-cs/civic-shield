import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from "react-native";

const feedData = [
  {
    id: 1,
    icon: "🚨",
    title: "Armed Robbery",
    location: "Serrekunda, West Coast Region",
    time: "2 mins ago",
    severity: "CRITICAL"
  },
  {
    id: 2,
    icon: "👨‍👩‍👧",
    title: "Domestic Violence",
    location: "Kanifing Municipal",
    time: "5 mins ago",
    severity: "CRITICAL"
  },
  {
    id: 3,
    icon: "🚗",
    title: "Traffic Accident",
    location: "Brikama Highway",
    time: "8 mins ago",
    severity: "HIGH"
  },
  {
    id: 4,
    icon: "🌊",
    title: "Flood Alert",
    location: "Banjul, Low Lying Areas",
    time: "15 mins ago",
    severity: "MEDIUM"
  },
  {
    id: 5,
    icon: "🔥",
    title: "Fire Incident",
    location: "Serrekunda Market",
    time: "28 mins ago",
    severity: "HIGH"
  },
];

export default function IncidentFeedScreen({ navigation }: any) {
  const handleRespond = (item: any) => {
    Alert.alert(
      `Respond to ${item.title}`,
      `${item.location}\nTime: ${item.time}\nSeverity: ${item.severity}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "🚑 Dispatch Units",
          onPress: () => {
            Alert.alert(
              "✅ Units Dispatched!",
              `Emergency teams have been sent to ${item.location}.\n\nETA: 8-12 minutes`,
              [{ text: "OK" }]
            );
          }
        },
        {
          text: "📋 View Full Details",
          onPress: () => navigation.navigate("ReportIncident", { incidentId: item.id })
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#001F3F" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Incident Feed</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subtitle}>Live Updates • {feedData.length} Active Reports</Text>

        {feedData.map((item) => (
          <View key={item.id} style={styles.feedCard}>
            <Text style={styles.feedIcon}>{item.icon}</Text>
            
            <View style={styles.feedInfo}>
              <Text style={styles.feedTitle}>{item.title}</Text>
              <Text style={styles.feedLocation}>{item.location}</Text>
              <Text style={styles.feedTime}>
                {item.time} • 
                <Text style={[
                  styles.severityText,
                  { color: item.severity === "CRITICAL" ? "#EF4444" : "#F59E0B" }
                ]}>
                  {' '}{item.severity}
                </Text>
              </Text>
            </View>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleRespond(item)}
            >
              <Text style={styles.actionText}>Respond</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F8FAFC" 
  },
  header: {
    backgroundColor: "#001F3F",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: { 
    paddingRight: 15 
  },
  backArrow: { 
    fontSize: 28, 
    color: "#FFFFFF", 
    fontWeight: "bold" 
  },
  headerTitle: { 
    fontSize: 22, 
    fontWeight: "600", 
    color: "#FFFFFF" 
  },

  scrollContent: { 
    padding: 20, 
    paddingBottom: 40 
  },
  subtitle: { 
    fontSize: 16, 
    color: "#6B7280", 
    marginBottom: 20 
  },

  feedCard: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 18,
    borderRadius: 16,
    marginBottom: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  feedIcon: { 
    fontSize: 38, 
    marginRight: 18, 
    width: 45 
  },
  feedInfo: { 
    flex: 1 
  },
  feedTitle: { 
    fontSize: 18, 
    fontWeight: "600", 
    color: "#1F2937", 
    marginBottom: 4 
  },
  feedLocation: { 
    fontSize: 15, 
    color: "#6B7280", 
    marginBottom: 6 
  },
  feedTime: { 
    fontSize: 14, 
    color: "#6B7280" 
  },
  severityText: { 
    fontWeight: "700" 
  },

  actionButton: {
    backgroundColor: "#001F3F",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 95,
  },
  actionText: {
    color: "white",
    fontWeight: "700",
    fontSize: 15,
  },
});