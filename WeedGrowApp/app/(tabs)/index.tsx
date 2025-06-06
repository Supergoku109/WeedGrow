import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import {
  CalendarProvider,
  ExpandableCalendar,
} from 'react-native-calendars';
import { AntDesign } from '@expo/vector-icons'; // For arrows

import ParallaxScrollView from '@/components/ParallaxScrollView';

export default function HomeScreen() {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }
    >
      <View style={styles.calendarContainer}>
        <CalendarProvider
          date={selectedDate}
          onDateChanged={setSelectedDate}
          onMonthChange={(date) => setSelectedDate(date.dateString)}
        >
          <ExpandableCalendar
            initialPosition={ExpandableCalendar.positions.CLOSED}
            firstDay={1}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            renderArrow={(direction) => (
              <AntDesign
                name={direction === 'left' ? 'left' : 'right'}
                size={20}
                color="green"
              />
            )}
            theme={{
              backgroundColor: 'white',
              calendarBackground: 'white',
              textSectionTitleColor: '#b6c1cd',
              selectedDayBackgroundColor: 'green',
              selectedDayTextColor: '#ffffff',
              todayTextColor: 'green',
              dayTextColor: '#2d4150',
              textDisabledColor: '#d9e1e8',
              arrowColor: 'green',
              monthTextColor: 'green',
              indicatorColor: 'green',
              textDayFontFamily: 'System',
              textMonthFontFamily: 'System',
              textDayHeaderFontFamily: 'System',
              textDayFontWeight: '300',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '300',
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 14,
            }}
          />
        </CalendarProvider>
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  calendarContainer: {
    marginVertical: 16,
  },
  knob: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'green',
    alignSelf: 'center',
    marginVertical: 10,
  },
});
