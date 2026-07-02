import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearAllAppData } from '../util/Api';

function GrabarBorrar() {
  const navigation = useNavigation();
  
  const licencia = {
    storagelicencia: 'nppepe',
    storegeCuenta: '9999'
  };

  const token = '1234'

  const Grabar = async () => {
    try {
      await AsyncStorage.setItem("Cuenta", JSON.stringify({ licencia, token }));
      Alert.alert('Éxito', 'Datos guardados correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudieron guardar los datos');
    }
  };

  const Borrar = async () => {
    Alert.alert(
      '⚠️ Confirmar Borrado',
      '¿Está seguro que desea borrar todos los datos de la aplicación? Esto lo llevará a la pantalla de configuración inicial.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Borrar',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await clearAllAppData();
              
              if (success) {
                
                // Redirigir a la pantalla Welcome
                try {
                  // Obtener la navegación del Stack principal
                  let rootNavigation = navigation;
                  const parent = navigation.getParent();
                  if (parent) {
                    rootNavigation = parent;
                    const grandParent = parent.getParent();
                    if (grandParent) {
                      rootNavigation = grandParent;
                    }
                  }
                  
                  // Resetear la navegación y redirigir a Secondary (que contiene Welcome)
                  rootNavigation.dispatch(
                    CommonActions.reset({
                      index: 0,
                      routes: [{ name: 'Secondary' }],
                    })
                  );
                } catch (navError) {
                  // Si falla, intentar navegar directamente
                  try {
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [{ name: 'Secondary' }],
                      })
                    );
                  } catch (fallbackError) {
                    Alert.alert(
                      'Datos Borrados',
                      'Todos los datos han sido borrados. Por favor, cierre y vuelva a abrir la aplicación.',
                      [{ text: 'OK' }]
                    );
                  }
                }
              } else {
                Alert.alert('Error', 'Hubo un problema al borrar algunos datos. Por favor, intente nuevamente.');
              }
            } catch (error) {
              Alert.alert('Error', 'No se pudieron borrar todos los datos. Por favor, intente nuevamente.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Opciones de Licencia</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.buttonSave} onPress={Grabar}>
          <Text style={styles.buttonText}>Grabar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonDelete} onPress={Borrar}>
          <Text style={styles.buttonText}>Borrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default GrabarBorrar;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9fa8da',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 40,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  buttonSave: {
    width: '80%',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#3639f4',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  buttonDelete: {
    width: '80%',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f44336',
    alignItems: 'center',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
