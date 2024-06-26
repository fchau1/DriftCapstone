import {Text, TouchableOpacity} from 'react-native';
import React from 'react';

export default function CustomButton({label, onPress, width}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: '#8fcbbc',
        padding: 20,
        borderRadius: 10,
        marginBottom: 30,
        width: width
      }}>
      <Text
        style={{
          textAlign: 'center',
          fontWeight: '700',
          fontSize: 16,
          color: '#fff',
        }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}