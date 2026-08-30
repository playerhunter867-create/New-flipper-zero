import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import InputField from '../components/InputField';
import ProgressBar from '../components/ProgressBar';
import { scanAll } from '../api/scannerApi';
import theme from '../styles/theme';

export default function HomeScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [fio, setFio] = useState('');
  const [plate, setPlate] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleScan = async () => {
    if (!phone && !fio && !plate && !username) {
      Alert.alert('Ошибка', 'Заполни хотя бы одно поле');
      return;
    }

    setIsLoading(true);
    setProgress(0);

    try {
      // Эмуляция прогресса
      const interval = setInterval(() => {
        setProgress(prev => Math.min(prev + 0.1, 0.95));
      }, 200);

      const results = await scanAll({ phone, fio, plate, username });
      clearInterval(interval);
      setProgress(1);

      setTimeout(() => {
        navigation.navigate('Result', { results, query: { phone, fio, plate, username } });
        setIsLoading(false);
        setProgress(0);
      }, 500);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось выполнить сканирование: ' + error.message);
      setIsLoading(false);
      setProgress(0);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>DOPPLER OSINT</Text>
        <Text style={styles.subtitle}>Введи данные для сканирования</Text>
      </View>

      <InputField
        label="Номер телефона"
        placeholder="+7 903 123 45 67"
        value={phone}
        onChangeText={setPhone}
        icon="phone"
        keyboardType="phone-pad"
      />

      <InputField
        label="ФИО"
        placeholder="Иванов Иван Иванович"
        value={fio}
        onChangeText={setFio}
        icon="account"
      />

      <InputField
        label="Госномер авто"
        placeholder="А123ВВ77"
        value={plate}
        onChangeText={setPlate}
        icon="car"
        autoCapitalize="characters"
      />

      <InputField
        label="Username (TG / TikTok / Instagram)"
        placeholder="@username"
        value={username}
        onChangeText={setUsername}
        icon="account-search"
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.scanButton, isLoading && styles.scanButtonDisabled]}
          onPress={handleScan}
          disabled={isLoading}
        >
          <Text style={styles.scanButtonText}>
            {isLoading ? 'СКАНИРУЮ...' : '🚀 ЗАПУСТИТЬ СКАНИРОВАНИЕ'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.settingsButtonText}>⚙️ Настройки</Text>
        </TouchableOpacity>
      </View>

      {isLoading && <ProgressBar progress={progress} style={styles.progressBar} />}

      <View style={styles.hintContainer}>
        <Text style={styles.hintText}>
          💡 Введи хотя бы одно поле. Чем больше данных — тем глубже анализ.
        </Text>
        <Text style={styles.hintText}>
          🔍 Результаты будут отсортированы по типу информации.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 5,
  },
  buttonContainer: {
    marginTop: 20,
    gap: 12,
  },
  scanButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 4,
  },
  scanButtonDisabled: {
    backgroundColor: theme.colors.primaryDark,
    opacity: 0.7,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  settingsButton: {
    backgroundColor: theme.colors.surface,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  settingsButtonText: {
    color: theme.colors.text,
    fontSize: 16,
  },
  progressBar: {
    marginTop: 20,
  },
  hintContainer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    marginBottom: 40,
  },
  hintText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginVertical: 3,
  },
});
