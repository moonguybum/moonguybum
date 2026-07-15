import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ProfileProvider } from './src/context/ProfileContext';
import EditCardScreen from './src/screens/EditCardScreen';
import ReceiveScreen from './src/screens/ReceiveScreen';
import SendScreen from './src/screens/SendScreen';
import { colors } from './src/theme';

const Tab = createBottomTabNavigator();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    primary: colors.primary,
  },
};

function TabLabel({ label, focused }) {
  return (
    <Text style={{ color: focused ? colors.primary : colors.muted, fontSize: 12, fontWeight: '600' }}>
      {label}
    </Text>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ProfileProvider>
        <NavigationContainer theme={navTheme}>
          <StatusBar style="light" />
          <Tab.Navigator
            screenOptions={{
              headerStyle: { backgroundColor: colors.surface },
              headerTintColor: colors.text,
              tabBarStyle: {
                backgroundColor: colors.surface,
                borderTopColor: colors.border,
              },
            }}
          >
            <Tab.Screen
              name="Edit"
              component={EditCardScreen}
              options={{
                title: '명함핑 · 내 명함',
                tabBarLabel: ({ focused }) => <TabLabel label="내 명함" focused={focused} />,
              }}
            />
            <Tab.Screen
              name="Send"
              component={SendScreen}
              options={{
                title: '명함핑 · 송신',
                tabBarLabel: ({ focused }) => <TabLabel label="송신" focused={focused} />,
              }}
            />
            <Tab.Screen
              name="Receive"
              component={ReceiveScreen}
              options={{
                title: '명함핑 · 수신',
                tabBarLabel: ({ focused }) => <TabLabel label="수신" focused={focused} />,
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </ProfileProvider>
    </SafeAreaProvider>
  );
}
