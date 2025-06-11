import React from 'react';
import { TextInput } from 'react-native-paper';
import { useWeedGrowInputStyle } from './WeedGrowInputStyle';

export function WeedGrowTextInput({
  icon,
  ...props
}: {
  icon?: string;
  [key: string]: any;
}) {
  const { inputStyle, menuInputStyle, iconStyle } = useWeedGrowInputStyle();
  // Remove outlineColor and activeOutlineColor to prevent double border
  return (
    <TextInput
      mode="outlined"
      style={[inputStyle, menuInputStyle, props.style]}
      contentStyle={{ minHeight: 56, height: 56, paddingTop: 0, paddingBottom: 0 }}
      outlineColor="transparent"
      underlineColor="transparent"
      left={icon ? <TextInput.Icon icon={icon} size={24} style={iconStyle} /> : undefined}
      {...props}
    />
  );
}
