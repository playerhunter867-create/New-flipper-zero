import React from 'react';
import { View, StyleSheet } from 'react-native';
import * as Progress from 'react-native-progress';
import theme from '../styles/theme';

export default function ProgressBar({ progress, style }) {
  return (
    <View style={[styles.container, style]}>
      <Progress.Bar
        progress={progress}
        width={null}
        height={8}
        borderRadius={4}
        color={theme.colors.primary}
        unfilledColor={theme.colors.surface}
        borderWidth={0}
        style={styles.bar}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 4,
  },
  bar: {
    marginTop: 8,
  },
});
