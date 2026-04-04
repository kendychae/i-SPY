import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import api from '../services/api';
import FilterChips from '../components/FilterChips';

const CATEGORY_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'theft', label: 'Theft' },
  { id: 'vandalism', label: 'Vandalism' },
  { id: 'assault', label: 'Assault' },
  { id: 'suspicious_activity', label: 'Suspicious' },
  { id: 'traffic_violation', label: 'Traffic' },
  { id: 'noise_complaint', label: 'Noise' },
  { id: 'fire', label: 'Fire' },
  { id: 'medical_emergency', label: 'Medical' },
  { id: 'other', label: 'Other' },
];

const STATUS_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Open' },
  { id: 'submitted', label: 'Submitted' },
  { id: 'under_review', label: 'In Review' },
  { id: 'resolved', label: 'Resolved' },
  { id: 'closed', label: 'Closed' },
];

const DATE_RANGE_OPTIONS = [
  { id: 'all', label: 'All time' },
  { id: '7', label: 'Last 7 days' },
  { id: '30', label: 'Last 30 days' },
  { id: '90', label: 'Last 90 days' },
];

const HomeScreen = ({ navigation }) => {
  const [searchVisible, setSearchVisible] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRange, setSelectedRange] = useState('all');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [keyword]);

  const filterDates = useMemo(() => {
    if (selectedRange === 'all') {
      return {};
    }

    const now = new Date();
    const from = new Date(now);
    from.setDate(now.getDate() - parseInt(selectedRange, 10));

    return {
      dateFrom: from.toISOString(),
      dateTo: now.toISOString(),
    };
  }, [selectedRange]);

  const queryParams = useMemo(() => {
    const params = {};

    if (debouncedKeyword) {
      params.q = debouncedKeyword;
    }

    if (selectedCategory !== 'all') {
      params.category = selectedCategory;
    }

    if (selectedStatus !== 'all') {
      params.status = selectedStatus === 'open'
        ? 'submitted,under_review'
        : selectedStatus;
    }

    if (filterDates.dateFrom) {
      params.dateFrom = filterDates.dateFrom;
      params.dateTo = filterDates.dateTo;
    }

    return params;
  }, [debouncedKeyword, selectedCategory, selectedStatus, filterDates]);

  const loadReports = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/reports', {
        params: queryParams,
      });

      if (response.data && response.data.success) {
        setReports(response.data.data || []);
      } else {
        setReports([]);
      }
    } catch (fetchError) {
      console.error('HomeScreen fetch error:', fetchError);
      setError('Unable to load reports. Please try again.');
      setReports([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadReports();
  }, [queryParams]);

  const handleToggleSearch = () => {
    setSearchVisible((prev) => !prev);
  };

  const handleClearFilters = () => {
    setKeyword('');
    setDebouncedKeyword('');
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSelectedRange('all');
  };

  const handleSearchSubmit = () => {
    setDebouncedKeyword(keyword.trim());
  };

  const noResultsMessage = keyword
    ? `No results found for '${keyword.trim()}'`
    : 'No reports match the selected filters.';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerBar}>
          <View>
            <Text style={styles.title}>Welcome to VIGILUX</Text>
            <Text style={styles.subtitle}>Your neighborhood watch companion</Text>
          </View>

          <TouchableOpacity style={styles.searchToggle} onPress={handleToggleSearch}>
            <Text style={styles.searchIcon}>🔍</Text>
          </TouchableOpacity>
        </View>

        {searchVisible && (
          <View style={styles.searchPanel}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by keyword"
              placeholderTextColor="#999"
              value={keyword}
              onChangeText={setKeyword}
              returnKeyType="search"
              onSubmitEditing={handleSearchSubmit}
              autoCorrect={false}
              autoCapitalize="none"
            />

            <FilterChips
              title="Category"
              options={CATEGORY_OPTIONS}
              selectedValue={selectedCategory}
              onSelect={setSelectedCategory}
            />

            <FilterChips
              title="Status"
              options={STATUS_OPTIONS}
              selectedValue={selectedStatus}
              onSelect={setSelectedStatus}
            />

            <FilterChips
              title="Date Range"
              options={DATE_RANGE_OPTIONS}
              selectedValue={selectedRange}
              onSelect={setSelectedRange}
            />

            <TouchableOpacity style={styles.clearButton} onPress={handleClearFilters}>
              <Text style={styles.clearButtonText}>Clear all filters</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reports</Text>

          {loading && (
            <View style={styles.loadingState}>
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={styles.loadingText}>Loading reports...</Text>
            </View>
          )}

          {!loading && reports.length === 0 && (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>{noResultsMessage}</Text>
            </View>
          )}

          {!loading && reports.length > 0 && (
            <View style={styles.reportList}>
              {reports.map((report) => (
                <View key={report.id} style={styles.reportCard}>
                  <View style={styles.reportRow}>
                    <Text style={styles.reportTitle}>{report.title}</Text>
                    <Text style={styles.reportStatus}>{report.status.replace('_', ' ').toUpperCase()}</Text>
                  </View>
                  <Text style={styles.reportCategory}>{report.incident_type.replace('_', ' ').toUpperCase()}</Text>
                  <Text style={styles.reportDescription} numberOfLines={2}>
                    {report.description}
                  </Text>
                  <Text style={styles.reportMeta}>{new Date(report.created_at).toLocaleDateString()}</Text>
                </View>
              ))}
            </View>
          )}

          {error ? (
            <View style={styles.errorBlock}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Report')}
          >
            <Text style={styles.actionIcon}>📝</Text>
            <Text style={styles.actionTitle}>Submit Report</Text>
            <Text style={styles.actionSubtitle}>Report an incident</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Map')}
          >
            <Text style={styles.actionIcon}>🗺️</Text>
            <Text style={styles.actionTitle}>View Map</Text>
            <Text style={styles.actionSubtitle}>See nearby reports</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 20,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  searchToggle: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  searchIcon: {
    fontSize: 20,
  },
  searchPanel: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  searchInput: {
    height: 48,
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
    color: '#1a1a1a',
  },
  clearButton: {
    marginTop: 4,
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  clearButtonText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  placeholder: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  placeholderText: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
  },
  loadingState: {
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  reportList: {
    marginBottom: 12,
  },
  reportCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  reportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  reportStatus: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    backgroundColor: '#007AFF',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    overflow: 'hidden',
  },
  reportCategory: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  reportDescription: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 10,
  },
  reportMeta: {
    fontSize: 12,
    color: '#9ca3af',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
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
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  errorBlock: {
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fee2e2',
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 14,
  },
});

export default HomeScreen;
