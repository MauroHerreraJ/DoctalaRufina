import { View, StyleSheet, Text, Pressable } from "react-native";

function SaveButton({ onPress, isEnabled = true, label = "Guardar" }) {
  return (
    <View style={styles.buttonOuterContainer}>
      <Pressable
        style={[
          styles.buttonInnerContainer,
          !isEnabled && styles.buttonInnerContainerDisabled,
        ]}
        onPress={isEnabled ? onPress : null}
        android_ripple={{ color: "#222266" }}
      >
        <Text style={styles.buttonText}>{label}</Text>
      </Pressable>
    </View>
  );
}
export default SaveButton;

const styles = StyleSheet.create({
  buttonOuterContainer: {
    borderRadius: 10,
    margin: 4,
    overflow: "hidden",
  },
  buttonInnerContainer: {
    backgroundColor: "#0d47a1",
    paddingVertical: 18,
    paddingHorizontal: 80,
  },
  buttonInnerContainerDisabled: {
    backgroundColor: "#9bb5da",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 18,
  },
});