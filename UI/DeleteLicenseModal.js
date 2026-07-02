import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  TextInput,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Pressable,
  Keyboard,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { maskLicenseCode } from "../util/Api";

function DeleteLicenseModal({
  visible,
  onClose,
  licenseCode,
  onConfirmDelete,
  isDeleting,
}) {
  const [suffix, setSuffix] = useState("");

  const expectedSuffix = licenseCode ? licenseCode.trim().slice(-4).toLowerCase() : "";
  const isValid =
    suffix.length === 4 && suffix.toLowerCase() === expectedSuffix;
  const maskedLicense = maskLicenseCode(licenseCode);

  useEffect(() => {
    if (!visible) {
      setSuffix("");
    }
  }, [visible]);

  const handleClose = () => {
    if (isDeleting) {
      return;
    }
    Keyboard.dismiss();
    setSuffix("");
    onClose();
  };

  const handleDelete = () => {
    if (!isValid || isDeleting) {
      return;
    }
    Keyboard.dismiss();
    onConfirmDelete();
  };

  return (
    <Modal
      visible={visible}
      onRequestClose={handleClose}
      transparent
      animationType="fade"
    >
      <Pressable style={styles.modalContainer} onPress={handleClose}>
        <KeyboardAwareScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          bottomOffset={56}
          extraKeyboardSpace={32}
          enableOnAndroid
          showsVerticalScrollIndicator={false}
        >
          <Pressable style={styles.modalContent} onPress={(event) => event.stopPropagation()}>
            <Text style={styles.modalTitle}>Confirmar eliminación</Text>
            <Text style={styles.modalDescription}>
              Ingresá los últimos 4 caracteres de tu código de licencia para
              confirmar.
            </Text>

            <View style={styles.licenseCodeBox}>
              <Text style={styles.licenseCodeLabel}>Código de licencia</Text>
              <Text style={styles.licenseCodeValue}>{maskedLicense}</Text>
            </View>

            <TextInput
              style={[styles.input, isValid && styles.inputValid]}
              placeholder="Últimos 4 caracteres"
              value={suffix}
              onChangeText={(text) => setSuffix(text.slice(0, 4))}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={4}
              editable={!isDeleting}
              placeholderTextColor="#888"
              returnKeyType="done"
              onSubmitEditing={isValid ? handleDelete : undefined}
            />

            <TouchableOpacity
              style={[
                styles.deleteButton,
                (!isValid || isDeleting) && styles.deleteButtonDisabled,
              ]}
              onPress={handleDelete}
              disabled={!isValid || isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.deleteButtonText}>Eliminar licencia</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              disabled={isDeleting}
            >
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </Pressable>
        </KeyboardAwareScrollView>
      </Pressable>
    </Modal>
  );
}

export default DeleteLicenseModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  modalContent: {
    width: "100%",
    maxWidth: 320,
    alignSelf: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 15,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 12,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  modalDescription: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 20,
  },
  licenseCodeBox: {
    width: "100%",
    backgroundColor: "#f4f4f4",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
    alignItems: "center",
  },
  licenseCodeLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#120438",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  licenseCodeValue: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#1E88E5",
    letterSpacing: 0.5,
  },
  input: {
    width: "100%",
    height: 44,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 16,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "#f8f8f8",
    textAlign: "center",
  },
  inputValid: {
    borderColor: "#2e7d32",
    backgroundColor: "#e8f5e9",
    color: "#1b5e20",
  },
  deleteButton: {
    backgroundColor: "#c62828",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginBottom: 10,
    width: "100%",
    alignItems: "center",
    minHeight: 48,
    justifyContent: "center",
  },
  deleteButtonDisabled: {
    backgroundColor: "#bdbdbd",
  },
  deleteButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#0d47a1",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#757575",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
