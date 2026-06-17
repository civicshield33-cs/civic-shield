import { Audio } from "expo-av";
import { attachSosEvidence } from "./sosService";
import { getFirebaseStorage, isFirebaseConfigured } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

let recording: Audio.Recording | null = null;

export async function startEmergencyRecording() {
  try {
    const permission = await Audio.requestPermissionsAsync();
    if (!permission.granted) return null;

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const newRecording = new Audio.Recording();
    await newRecording.prepareToRecordAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );
    await newRecording.startAsync();
    recording = newRecording;
    return newRecording;
  } catch {
    return null;
  }
}

export async function stopEmergencyRecording(incidentId: string) {
  if (!recording) return null;

  try {
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    recording = null;
    if (!uri) return null;

    let audioUrl = uri;
    if (isFirebaseConfigured()) {
      const storage = getFirebaseStorage();
      if (storage) {
        const response = await fetch(uri);
        const blob = await response.blob();
        const storageRef = ref(storage, `sos/${incidentId}/audio.m4a`);
        await uploadBytes(storageRef, blob);
        audioUrl = await getDownloadURL(storageRef);
      }
    }

    await attachSosEvidence(incidentId, { audioUrl });
    return audioUrl;
  } catch {
    recording = null;
    return null;
  }
}
