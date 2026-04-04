import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

const FilterChips = ({ title, options, selectedValue, onSelect }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {options.map((option) => {
          const active = option.id === selectedValue;
          return (
            <TouchableOpacity
              key={option.id}
              style={[styles.chip, active && styles.activeChip]}
              onPress={() => onSelect(option.id)}
            >
              <Text style={[styles.chipText, active && styles.activeChipText]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  row: {
    alignItems: 'center',
    paddingBottom: 4,
  },
  chip: {
    marginRight: 10,
    backgroundColor: '#f1f3f5',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipText: {
    fontSize: 13,
    color: '#4a4a4a',
  },
  activeChip: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  activeChipText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default FilterChips;
