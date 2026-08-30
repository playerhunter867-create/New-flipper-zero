import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import theme from '../styles/theme';

export default function ResultScreen({ route }) {
  const { results, query } = route.params;
  const [activeTab, setActiveTab] = useState('phone');

  const renderPhoneResults = () => {
    const data = results.phone || {};
    return (
      <View style={styles.resultCard}>
        <Text style={styles.resultTitle}>📱 Номер телефона</Text>
        <Text style={styles.resultItem}>📌 Оператор: {data.operator || 'Неизвестно'}</Text>
        <Text style={styles.resultItem}>📌 Telegram: {data.telegram?.exists ? '✅ Найден' : '❌ Не найден'}</Text>
        {data.telegram?.url && (
          <TouchableOpacity onPress={() => Linking.openURL(data.telegram.url)}>
            <Text style={styles.link}>🔗 Открыть в TG</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.resultItem}>🔓 Утечки: {data.leaks?.found ? '🔴 Найдены' : '🟢 Не найдены'}</Text>
        {data.leaks?.passwords?.length > 0 && (
          <View style={styles.passwordBox}>
            <Text style={styles.passwordTitle}>Пароли:</Text>
            {data.leaks.passwords.map((pwd, idx) => (
              <Text key={idx} style={styles.passwordItem}>{pwd}</Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderFioResults = () => {
    const data = results.fio || {};
    return (
      <View style={styles.resultCard}>
        <Text style={styles.resultTitle}>👤 ФИО</Text>
        <Text style={styles.resultItem}>📌 VK профили: {data.vk?.length || 0}</Text>
        {data.vk?.map((profile, idx) => (
          <TouchableOpacity key={idx} onPress={() => Linking.openURL(`https://vk.com/id${profile.id}`)}>
            <Text style={styles.link}>🔗 {profile.name} (ID: {profile.id})</Text>
          </TouchableOpacity>
        ))}
        <Text style={styles.resultItem}>📌 Долги ФССП: {data.fssp?.debts || 0} шт. на сумму {data.fssp?.amount || 0} ₽</Text>
      </View>
    );
  };

  const renderVehicleResults = () => {
    const data = results.vehicle || {};
    return (
      <View style={styles.resultCard}>
        <Text style={styles.resultTitle}>🚗 Транспорт</Text>
        <Text style={styles.resultItem}>📌 Номер: {data.plate}</Text>
        <Text style={styles.resultItem}>📌 Регион: {data.region}</Text>
        <Text style={styles.resultItem}>📌 Штрафы: {data.fines} шт.</Text>
        <Text style={styles.resultItem}>📌 Статус регистрации: {data.registered ? '✅ Активен' : '❌ Не найден'}</Text>
      </View>
    );
  };

  const renderUsernameResults = () => {
    const data = results.username || {};
    return (
      <View style={styles.resultCard}>
        <Text style={styles.resultTitle}>🌐 Username</Text>
        {Object.keys(data).map((platform) => (
          <View key={platform} style={styles.platformRow}>
            <Text style={styles.platformName}>{platform.toUpperCase()}</Text>
            <Text style={data[platform]?.exists ? styles.found : styles.notFound}>
              {data[platform]?.exists ? '✅ Найден' : '❌ Не найден'}
            </Text>
            {data[platform]?.url && (
              <TouchableOpacity onPress={() => Linking.openURL(data[platform].url)}>
                <Text style={styles.link}>🔗 Открыть</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    );
  };

  const tabs = [
    { key: 'phone', label: 'Телефон', icon: 'phone' },
    { key: 'fio', label: 'ФИО', icon: 'account' },
    { key: 'vehicle', label: 'Авто', icon: 'car' },
    { key: 'username', label: 'Username', icon: 'account-search' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Icon name={tab.icon} size={20} color={activeTab === tab.key ? theme.colors.primary : theme.colors.textSecondary} />
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.activeTabLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scrollArea}>
        {activeTab === 'phone' && renderPhoneResults()}
        {activeTab === 'fio' && renderFioResults()}
        {activeTab === 'vehicle' && renderVehicleResults()}
        {activeTab === 'username' && renderUsernameResults()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: theme.colors.primary,
  },
  tabLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  activeTabLabel: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  scrollArea: {
    padding: 16,
  },
  resultCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 12,
  },
  resultItem: {
    fontSize: 15,
    color: theme.colors.text,
    marginVertical: 4,
  },
  link: {
    color: theme.colors.primary,
    fontSize: 14,
    marginVertical: 2,
    textDecorationLine: 'underline',
  },
  passwordBox: {
    marginTop: 8,
    padding: 10,
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
  },
  passwordTitle: {
    color: '#ff6b6b',
    fontWeight: 'bold',
  },
  passwordItem: {
    color: '#ffd93d',
    fontFamily: 'monospace',
  },
  platformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  platformName: {
    flex: 1,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  found: {
    color: '#4CAF50',
    marginRight: 10,
  },
  notFound: {
    color: '#f44336',
    marginRight: 10,
  },
});
