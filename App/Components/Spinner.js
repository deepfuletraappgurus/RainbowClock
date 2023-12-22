import React from 'react';
import {ActivityIndicator} from 'react-native';

const Spinner = ({color, size}) => {
  return <ActivityIndicator size={size} color={color} />;
};
export default Spinner;
