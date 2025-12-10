import React, { useContext, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { TranslationContext } from '../context/TranslationContext';
import { normalize, spacing, isTablet, iconSizes } from '../utils/responsive';

const CalendarSelector = ({
  selectedCalendars = [],
  setSelectedCalendars,
  calendarOptions = [],
  style,
}) => {
  const { t } = useContext(TranslationContext);
  const scrollViewRef = useRef(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const toggleCalendar = (calendarKey) => {
    setSelectedCalendars((prev) =>
      prev.includes(calendarKey)
        ? prev.filter((id) => id !== calendarKey)
        : [...prev, calendarKey]
    );
  };

  const selectAll = () => {
    setSelectedCalendars(calendarOptions.map((cal) => cal.key));
  };

  const clearAll = () => {
    setSelectedCalendars([]);
  };

  const handleScroll = (event) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    setCanScrollUp(contentOffset.y > 0);
    setCanScrollDown(contentOffset.y < contentSize.height - layoutMeasurement.height);
  };

  const scrollUp = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const scrollDown = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const showArrows = calendarOptions.length > 2;

  return (
    <View style={[styles.container, style]}>


      {/* Calendar chips with arrows */}
      <View style={styles.chipSection}>
        {showArrows && (
          <View style={styles.arrowContainer}>
            {canScrollUp && (
              <TouchableOpacity onPress={scrollUp} style={styles.arrowButton}>
                <Icon name="chevron-up" size={iconSizes.sm} color="#ffffff" />
              </TouchableOpacity>
            )}
            {canScrollDown && (
              <TouchableOpacity onPress={scrollDown} style={styles.arrowButton}>
                <Icon name="chevron-down" size={iconSizes.sm} color="#ffffff" />
              </TouchableOpacity>
            )}
          </View>
        )}
        <ScrollView 
          ref={scrollViewRef}
          style={[styles.scrollContainer, showArrows && styles.scrollWithArrows]}
          contentContainerStyle={styles.chipContainer}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
        {calendarOptions.map((calendar) => {
          const isSelected = selectedCalendars.includes(calendar.key);
          return (
            <TouchableOpacity
              key={calendar.key}
              onPress={() => toggleCalendar(calendar.key)}
              style={[styles.chip, isSelected && styles.chipSelected]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.chipText,
                  isSelected && styles.chipTextSelected,
                ]}
              >
                {calendar.value}
              </Text>
            </TouchableOpacity>
          );
        })}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2d4887',
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },

  chipSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowContainer: {
    justifyContent: 'center',
    position: 'absolute',
    left: 0,
    zIndex: 1,
  },
  arrowButton: {
    padding: spacing.xs,
    marginVertical: normalize(2),
  },
  scrollContainer: {
    maxHeight: normalize(isTablet() ? 100 : 80),
  },
  scrollWithArrows: {
    flex: 1,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    marginTop: spacing.xs,
    paddingBottom: spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    borderRadius: normalize(20),
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    width: isTablet() ? '30%' : '42%',
    minWidth: normalize(isTablet() ? 120 : 100),
    height: normalize(isTablet() ? 40 : 32),
  },
  chipSelected: {
    backgroundColor: '#0EA5B5',
    borderColor: '#0EA5B5',
  },
  chipText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: normalize(isTablet() ? 14 : 12),
    fontWeight: '600',
    textAlign: 'center',
    adjustsFontSizeToFit: true,
    numberOfLines: 1,
    minimumFontScale: 0.8,
  },
  chipTextSelected: {
    color: '#ffffff',
  },
  checkIcon: {
    marginLeft: spacing.xs,
  },
});

export default CalendarSelector;
