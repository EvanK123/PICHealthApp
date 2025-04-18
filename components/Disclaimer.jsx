import { StyleSheet, View, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons';
import React, { useState } from 'react'
import DisclaimerModal from './DisclaimerModal';

const Disclaimer = ({description}) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.iconContainer}>
        <TouchableOpacity 
          onPress={() => {
            setModalVisible(true);
          }}
        >
          <Icon
            name='information-circle-outline'
            size={25}
            color='white'
          />
        </TouchableOpacity>
        
        <DisclaimerModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          title="Disclaimer"
          message={description}
        />
    </View>
  )
}

export default Disclaimer

const styles = StyleSheet.create({
    iconContainer: {
        paddingRight: 5,
    }
})