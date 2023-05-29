import type { RootStackParamList } from '../App';

import { View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface SettingsViewProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Settings'>;
}

export function Settings({ navigation }: SettingsViewProps) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <StatusBar style="dark" />
      <Text>Settings</Text>
    </View>
  );
}
