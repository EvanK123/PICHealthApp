import { StyleSheet, Alert, View, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons';
import React from 'react'


const Disclaimer = ({description}) => {
  return (
    <View style={styles.iconContainer}>
        <TouchableOpacity 
          onPress={() => {
            Alert.alert('Discalimer:', description);
          }}
        >
          <Icon
            name='information-circle-outline'
            size={25}
            color='white'
          />
        </TouchableOpacity>
    </View>
  )
}

export default Disclaimer

const styles = StyleSheet.create({
    iconContainer: {
        paddingRight: 5,
    }
})
