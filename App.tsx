import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import type { RootStackParamList } from './src/navigation';
import { StoreProvider } from './src/store';
import { colors } from './src/theme';

import HomeScreen from './src/screens/HomeScreen';
import ConfigurarRutinaScreen from './src/screens/ConfigurarRutinaScreen';
import EditorRutinaScreen from './src/screens/EditorRutinaScreen';
import SelectorEjerciciosScreen from './src/screens/SelectorEjerciciosScreen';
import ComenzarRutinaScreen from './src/screens/ComenzarRutinaScreen';
import DiaEntrenamientoScreen from './src/screens/DiaEntrenamientoScreen';
import PersonalizadoScreen from './src/screens/PersonalizadoScreen';
import PersonalizadoDetalleScreen from './src/screens/PersonalizadoDetalleScreen';
import EntrenarPlanScreen from './src/screens/EntrenarPlanScreen';
import EjercicioDetalleScreen from './src/screens/EjercicioDetalleScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.bg,
    text: colors.text,
    border: colors.border,
    primary: colors.primary,
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <StatusBar style="light" />
        <NavigationContainer
          ref={navigationRef}
          theme={navTheme}
          onReady={() => {
            if (typeof globalThis !== 'undefined') (globalThis as any).__nav = navigationRef;
          }}
        >
          <Stack.Navigator
            screenOptions={{
              headerStyle: { backgroundColor: colors.bg },
              headerTintColor: colors.primary,
              headerTitleStyle: { fontWeight: '900', color: colors.text },
              headerShadowVisible: false,
              headerTitleAlign: 'center',
              contentStyle: { backgroundColor: colors.bg },
            }}
          >
            <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Stack.Screen
              name="ConfigurarRutina"
              component={ConfigurarRutinaScreen}
              options={{ title: 'Configurar rutina' }}
            />
            <Stack.Screen
              name="EditorRutina"
              component={EditorRutinaScreen}
              options={{ title: 'Editar rutina' }}
            />
            <Stack.Screen
              name="SelectorEjercicios"
              component={SelectorEjerciciosScreen}
              options={{ title: 'Agregar ejercicios' }}
            />
            <Stack.Screen
              name="ComenzarRutina"
              component={ComenzarRutinaScreen}
              options={{ title: 'Comenzar rutina' }}
            />
            <Stack.Screen
              name="DiaEntrenamiento"
              component={DiaEntrenamientoScreen}
              options={{ title: 'Entrenamiento' }}
            />
            <Stack.Screen
              name="Personalizado"
              component={PersonalizadoScreen}
              options={{ title: 'Entrenamiento personalizado' }}
            />
            <Stack.Screen
              name="PersonalizadoDetalle"
              component={PersonalizadoDetalleScreen}
              options={{ title: 'Plan' }}
            />
            <Stack.Screen
              name="EntrenarPlan"
              component={EntrenarPlanScreen}
              options={{ title: 'Sesión extra' }}
            />
            <Stack.Screen
              name="EjercicioDetalle"
              component={EjercicioDetalleScreen}
              options={{ title: 'Ejercicio' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </StoreProvider>
    </SafeAreaProvider>
  );
}
