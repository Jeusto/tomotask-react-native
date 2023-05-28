import { Group } from '../layout/Group';
import { Stack } from '../layout/Stack';

import { Text, StyleSheet, View } from 'react-native';

type Props = {};

export const TodoHeader = ({}: Props) => {
  return (
    <Stack>
      <Group justify="space-between" style={styles.container}>
        <Text style={styles.sectionTitle}>Tasks</Text>
      </Group>
      <View style={styles.dividerLine} />
    </Stack>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 350,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  dividerLine: {
    width: 350,
    height: 1,
    backgroundColor: '#eee',
  },
});