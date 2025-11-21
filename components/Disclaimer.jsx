import { StyleSheet, View, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons';
import React, { useState, useContext } from 'react'
import DisclaimerModal from './DisclaimerModal';
import { TranslationContext } from '../context/TranslationContext';

const Disclaimer = ({description}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const { t } = useContext(TranslationContext);

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
          title={t('popup.disclaimer')}
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
