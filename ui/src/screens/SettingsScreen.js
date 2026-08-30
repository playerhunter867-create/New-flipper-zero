import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import theme from '../styles/theme';

export default function SettingsScreen() {
  const [proxy, setProxy] = useState('http://192.168.1.1:8080');
  const [timeout, setTimeout] = useState('10');
  const [threads, setThreads] = useState('20');

  const saveSettings = () => {
    // Здесь будет вызов Python-функции для обновления конфига
    alert('Настройки сохранены (эмуляция)');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>⚙️ Настройки сканера</Text>

      <View style={styles.settingGroup}>
        <Text style={styles.label}>Прокси-сервер (ротация)</Text>
        <TextInput
          style={styles.input}
          value={proxy}
          onChangeText={setProxy}
          placeholder="http://ip:port"
        />
        <Text style={styles.hint}>Оставь пустым для прямых запросов</Text>
      </View>

      <View style={styles.settingGroup}>
        <Text style={styles.label}>Таймаут (сек)</Text>
        <TextInput
          style={styles.input}
          value={timeout}
          onChangeText={setTimeout}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.settingGroup}>
        <Text style={styles.label}>Максимум потоков</Text>
        <TextInput
          style={styles.input}
          value={threads}
          onChangeText={setThreads}
          keyboardType="numeric"
        />
        <Text style={styles.hint}>Чем выше — тем быстрее, но выше риск блокировки</Text>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
        <Text style={styles.saveButtonText}>💾 СОХРАНИТЬ</Text>
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>🔐 Все данные хранятся локально в кеше.</Text>
        <Text style={styles.infoText}>🔄 Для очистки кеша переустанови приложение.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 30,
  },
  settingGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.text,
  },
  hint: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoBox: {
    marginTop: 30,
    padding: 15,
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b6b',
  },
  infoText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginVertical: 3,
  },
});
