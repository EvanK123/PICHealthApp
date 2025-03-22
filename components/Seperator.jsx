import { View, StyleSheet } from 'react-native';

const Seperator = () => {
  return(
    <View style={styles.seperator} />
  )
}

export default Seperator;

const styles = StyleSheet.create({
  seperator: {
    flex: 1,
    alignSelf: 'center',
    borderWidth: .5,
    borderColor: 'black',
    width: 75,
  }
})
