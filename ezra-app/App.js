import React from 'react';
import { StatusBar, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen      from './src/screens/HomeScreen';
import ChapterScreen   from './src/screens/ChapterScreen';
import PlaygroundScreen from './src/screens/PlaygroundScreen';
import SupportScreen   from './src/screens/SupportScreen';
import { COLORS } from './src/theme';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

function LearnStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.brandBg, elevation: 0, shadowOpacity: 0, borderBottomWidth: 1, borderBottomColor: COLORS.brandBorder },
        headerTintColor: COLORS.brand,
        headerTitleStyle: { fontWeight: '700', color: COLORS.text },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Ezra Language', headerShown: true }} />
      <Stack.Screen
        name="Chapter"
        component={ChapterScreen}
        options={({ route }) => ({
          title: `Chapter ${route.params?.chapterId}`,
          headerShown: true,
        })}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.brandBg} />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            const icons = {
              Learn:      focused ? 'book'       : 'book-outline',
              Playground: focused ? 'code-slash' : 'code-slash-outline',
              Support:    focused ? 'help-circle': 'help-circle-outline',
            };
            return <Ionicons name={icons[route.name] || 'ellipse'} size={size} color={color} />;
          },
          tabBarActiveTintColor:   COLORS.brand,
          tabBarInactiveTintColor: COLORS.text3,
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopColor: COLORS.border,
            borderTopWidth: 1,
            elevation: 8,
            height: Platform.OS === 'ios' ? 84 : 60,
            paddingBottom: Platform.OS === 'ios' ? 24 : 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Learn"      component={LearnStack}       options={{ title: 'Learn' }} />
        <Tab.Screen name="Playground" component={PlaygroundScreen} options={{ title: 'Playground', headerShown: true, headerStyle: { backgroundColor: '#161b22', elevation: 0, shadowOpacity: 0, borderBottomWidth: 1, borderBottomColor: '#30363d' }, headerTitleStyle: { color: '#e6edf3', fontWeight: '700' } }} />
        <Tab.Screen name="Support"    component={SupportScreen}    options={{ title: 'Support',    headerShown: true, headerStyle: { backgroundColor: COLORS.brandBg, elevation: 0, shadowOpacity: 0, borderBottomWidth: 1, borderBottomColor: COLORS.brandBorder }, headerTitleStyle: { color: COLORS.text, fontWeight: '700' } }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
