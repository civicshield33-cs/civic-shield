import { Alert, Platform } from "react-native";

export function showAlert(
  title: string,
  message: string,
  onOk?: () => void
) {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
    onOk?.();
    return;
  }

  Alert.alert(title, message, [{ text: "OK", onPress: onOk }]);
}

export function confirmAlert(
  title: string,
  message: string,
  onConfirm: () => void | Promise<void>,
  confirmLabel = "Confirm"
) {
  if (Platform.OS === "web") {
    if (window.confirm(`${title}\n\n${message}`)) {
      void Promise.resolve(onConfirm());
    }
    return;
  }

  Alert.alert(title, message, [
    { text: "Cancel", style: "cancel" },
    {
      text: confirmLabel,
      style: "destructive",
      onPress: () => {
        void Promise.resolve(onConfirm());
      },
    },
  ]);
}
