import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';
import FilterChips from '../components/FilterChips';

const DEBOUNCE_MS = 300;

const HomeScreen = ({ navigation }) => {
  const [searchVisible, setSearchVisible] = useState(false);
  const [query, setQuery]                 = useState('');
  const [category, setCategory]           = useState(null);
  const [status, setStatus]               = useState(null);
  const [reports, setReports]             = useState([]);
  const [loading, setLoading]             = useState(false);
  const [searched, setSearched]           = useState(false);
  const [latestReports, setLatestReports] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(false);

  const fetchLatestReports = useCallback(async () => {
    try {
      setLoadingRecent(true);
      const response = await api.get('/reports', {
        params: { limit: 3, sort: 'created_at', order: 'desc' },
      });
      if (response.data?.success) {
        setLatestReports(response.data.data || []);
      }
    } catch (_) {
      setLatestReports([]);
    } finally {
      setLoadingRecent(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchLatestReports();
    }, [fetchLatestReports])
  );

  const debounceTimer = useRef(null);
  const searchBarHeight = useRef(new Animated.Value(0)).current;

  // Toggle search panel
  const toggleSearch = () => {
    if (searchVisible) {
      // Collapse
      Animated.timing(searchBarHeight, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start(() => setSearchVisible(false));
      setQuery('');
      setCategory(null);
      setStatus(null);
      setReports([]);
      setSearched(false);
    } else {
      setSearchVisible(true);
      Animated.timing(searchBarHeight, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const fetchReports = useCallback(async (q, cat, stat) => {
    if (!q && !cat && !stat) {
      setReports([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams();
      if (q)    params.append('q', q);
      if (cat)  params.append('incident_type', cat);
      if (stat) params.append('status', stat);
      params.append('limit', '30');
      const response = await api.get(`/reports?${params.toString()}`);
      if (response.data.success) {
        setReports(response.data.data || []);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search on query change
  useEffect(() => {
    if (!searchVisible) return;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchReports(query, category, status);
    }, DEBOUNCE_MS);
    return () => clearTimeout(debounceTimer.current);
  }, [query, category, status, searchVisible, fetchReports]);

  const handleClear = () => {
    setQuery('');
    setCategory(null);
    setStatus(null);
    setReports([]);
    setSearched(false);
  };

  const renderReportItem = ({ item }) => (
    <TouchableOpacity
      style={styles.reportCard}
      onPress={() => navigation.navigate('ReportDetail', { id: item.id })}
      activeOpacity={0.85}
    >
      <View style={styles.reportCardHeader}>
        <Text style={styles.reportTitle} numberOfLines={1}>{item.title}</Text>
        <View style={[styles.priorityDot, { backgroundColor: PRIORITY_COLORS[item.priority] || '#607D8B' }]} />
      </View>
      <Text style={styles.reportType}>
        {(item.incident_type || '').replace(/_/g, ' ').toUpperCase()}
      </Text>
      <Text style={styles.reportDesc} numberOfLines={2}>{item.description}</Text>
      <Text style={styles.reportDate}>
        {item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}
      </Text>
    </TouchableOpacity>
  );

  const filtersActive = !!(query || category || status);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header row */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>VIGILUX</Text>
          <Text style={styles.subtitle}>Neighborhood Watch</Text>
        </View>
        <TouchableOpacity onPress={toggleSearch} style={styles.searchToggle}>
          <Ionicons
            name={searchVisible ? 'close' : 'search'}
            size={24}
            color="#007AFF"
          />
        </TouchableOpacity>
      </View>

      {/* Search panel */}
      {searchVisible && (
        <View style={styles.searchPanel}>
          <View style={styles.inputRow}>
            <Ionicons name="search-outline" size={18} color="#9E9E9E" style={styles.inputIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search reports..."
              placeholderTextColor="#9E9E9E"
              value={query}
              onChangeText={setQuery}
              autoFocus
              returnKeyType="search"
            />
            {filtersActive && (
              <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
                <Text style={styles.clearBtnText}>Clear all</Text>
              </TouchableOpacity>
            )}
          </View>
          <FilterChips
            selectedCategory={category}
            selectedStatus={status}
            onCategoryChange={setCategory}
            onStatusChange={setStatus}
          />
        </View>
      )}

      {/* Main content */}
      {searchVisible && searched ? (
        loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        ) : reports.length === 0 ? (
          <View style={styles.centered}>
            <Ionicons name="search-outline" size={48} color="#B0BEC5" />
            <Text style={styles.emptyTitle}>
              {query ? `No results for "${query}"` : 'No results found'}
            </Text>
            <Text style={styles.emptySubtitle}>Try different keywords or filters.</Text>
          </View>
        ) : (
          <FlatList
            data={reports}
            keyExtractor={item => String(item.id)}
            renderItem={renderReportItem}
            contentContainerStyle={styles.reportList}
          />
        )
      ) : !searchVisible ? (
        /* Default home content */
        <FlatList
          data={[]}
          ListHeaderComponent={
            <View style={styles.homeContent}>
              <View style={styles.quickActions}>
                <TouchableOpacity
                  style={styles.actionCard}
                  onPress={() => navigation.navigate('Report')}
                >
                  <Ionicons name="create-outline" size={36} color="#007AFF" />
                  <Text style={styles.actionTitle}>Submit Report</Text>
                  <Text style={styles.actionSubtitle}>Report an incident</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionCard}
                  onPress={() => navigation.navigate('Map')}
                >
                  <Ionicons name="map-outline" size={36} color="#007AFF" />
                  <Text style={styles.actionTitle}>View Map</Text>
                  <Text style={styles.actionSubtitle}>See nearby reports</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                {loadingRecent ? (
                  <View style={styles.placeholder}>
                    <ActivityIndicator size="small" color="#007AFF" />
                  </View>
                ) : latestReports.length === 0 ? (
                  <View style={styles.placeholder}>
                    <Text style={styles.placeholderText}>No recent reports</Text>
                  </View>
                ) : (
                  latestReports.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.recentCard}
                      onPress={() => navigation.navigate('ReportDetail', { id: item.id })}
                      activeOpacity={0.85}
                    >
                      <View style={styles.reportCardHeader}>
                        <Text style={styles.reportTitle} numberOfLines={1}>{item.title}</Text>
                        <View style={[styles.priorityDot, { backgroundColor: PRIORITY_COLORS[item.priority] || '#607D8B' }]} />
                      </View>
                      <Text style={styles.reportType}>
                        {(item.incident_type || '').replace(/_/g, ' ').toUpperCase()}
                      </Text>
                      <Text style={styles.reportDate}>
                        {item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            </View>
          }
          renderItem={null}
          keyExtractor={() => 'empty'}
        />
      ) : null}
    </SafeAreaView>
  );
};

const PRIORITY_COLORS = {
  urgent: '#D32F2F',
  high:   '#F57C00',
  medium: '#F9A825',
  low:    '#388E3C',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#007AFF',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 1,
  },
  searchToggle: {
    padding: 6,
  },

  // Search panel
  searchPanel: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingTop: 10,
    paddingBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F5F5F5',
  },
  inputIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    paddingVertical: 10,
  },
  clearBtn: {
    paddingLeft: 8,
  },
  clearBtnText: {
    color: '#007AFF',
    fontSize: 13,
    fontWeight: '600',
  },

  // Home content
  homeContent: {
    padding: 20,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 10,
    marginBottom: 4,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  placeholder: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  placeholderText: {
    color: '#9E9E9E',
    fontSize: 14,
  },

  // Search results
  reportList: {
    padding: 12,
  },
  reportCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  reportCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  reportTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginRight: 8,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  reportType: {
    fontSize: 10,
    color: '#9E9E9E',
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  reportDesc: {
    fontSize: 13,
    color: '#424242',
    lineHeight: 18,
    marginBottom: 6,
  },
  reportDate: {
    fontSize: 11,
    color: '#B0BEC5',
  },
  recentCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  // Empty state
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#424242',
    marginTop: 16,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#9E9E9E',
    textAlign: 'center',
  },
});

export default HomeScreen;

