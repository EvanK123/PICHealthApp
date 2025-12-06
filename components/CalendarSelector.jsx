import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { TranslationContext } from '../context/TranslationContext';

const CalendarSelector = ({ 
  selectedCalendars = [], 
  setSelectedCalendars, 
  calendarOptions = [],
  style 
}) => {
  const { t } = useContext(TranslationContext);
  
  const toggleCalendar = (calendarKey) => {
    setSelectedCalendars(prev => 
      prev.includes(calendarKey) 
        ? prev.filter(id => id !== calendarKey)
        : [...prev, calendarKey]
    );
  };

  const selectAll = () => {
    setSelectedCalendars(calendarOptions.map(cal => cal.key));
  };

  const clearAll = () => {
    setSelectedCalendars([]);
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('calendar.selectCalendar')}</Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={selectAll} style={styles.actionBtn}>
            <Text style={styles.actionText}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={clearAll} style={styles.actionBtn}>
            <Text style={styles.actionText}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.chipContainer}>
        {calendarOptions.map((calendar) => {
          const isSelected = selectedCalendars.includes(calendar.key);
          return (
            <TouchableOpacity
              key={calendar.key}
              onPress={() => toggleCalendar(calendar.key)}
              style={[styles.chip, isSelected && styles.chipSelected]}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                {calendar.value}
              </Text>
              {isSelected && (
                <Icon name="checkmark" size={16} color="#ffffff" style={styles.checkIcon} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2d4887',
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
    position: 'relative',
  },
  title: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    position: 'absolute',
    right: 16,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  actionText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  chipSelected: {
    backgroundColor: '#0EA5B5',
    borderColor: '#0EA5B5',
  },
  chipText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#ffffff',
  },
  checkIcon: {
    marginLeft: 4,
  },
});

export default CalendarSelector;