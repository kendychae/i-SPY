/**
 * FilterChips.js
 * Issue #63 — W6: Advanced Search UI — Search Bar & Filter Chips
 *
 * Horizontal scrollable row of chip buttons for Category and Status filters.
 */
import React from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';

const CATEGORY_CHIPS = [
  { id: 'theft',              label: 'Theft' },
  { id: 'vandalism',          label: 'Vandalism' },
  { id: 'assault',            label: 'Assault' },
  { id: 'suspicious_activity',label: 'Suspicious' },
  { id: 'traffic_violation',  label: 'Traffic' },
  { id: 'noise_complaint',    label: 'Noise' },
  { id: 'fire',               label: 'Fire' },
  { id: 'medical_emergency',  label: 'Medical' },
  { id: 'other',              label: 'Other' },
];

const STATUS_CHIPS = [
  { id: 'submitted',     label: 'Submitted' },
  { id: 'under_review',  label: 'Under Review' },
  { id: 'investigating', label: 'Investigating' },
  { id: 'resolved',      label: 'Resolved' },
];

/**
 * FilterChips renders two rows of chips:
 *  1. Category chips
 *  2. Status chips
 *
 * Props:
 *  selectedCategory {string | null}
 *  selectedStatus   {string | null}
 *  onCategoryChange {(id: string | null) => void}
 *  onStatusChange   {(id: string | null) => void}
 */
const FilterChips = ({
  selectedCategory,
  selectedStatus,
  onCategoryChange,
  onStatusChange,
}) => {
  const toggle = (current, id, setter) => {
    setter(current === id ? null : id);
  };

  return (
    <>
      {/* Category chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.row}
        contentContainerStyle={styles.rowContent}
      >
        {CATEGORY_CHIPS.map(chip => {
          const active = selectedCategory === chip.id;
          return (
            <TouchableOpacity
              key={chip.id}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => toggle(selectedCategory, chip.id, onCategoryChange)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                {chip.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Status chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.row}
        contentContainerStyle={styles.rowContent}
      >
        {STATUS_CHIPS.map(chip => {
          const active = selectedStatus === chip.id;
          return (
            <TouchableOpacity
              key={chip.id}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => toggle(selectedStatus, chip.id, onStatusChange)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                {chip.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    marginBottom: 6,
  },
  rowContent: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  chip: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#B0BEC5',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  chipLabel: {
    fontSize: 13,
    color: '#424242',
    fontWeight: '500',
  },
  chipLabelActive: {
    color: '#fff',
    fontWeight: '700',
  },
});

export default FilterChips;
