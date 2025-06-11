import React from 'react';
import { TextInput, Menu } from 'react-native-paper';
import { useWeedGrowInputStyle } from './WeedGrowInputStyle';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export function WeedGrowDropdownInput({
  icon,
  value,
  label,
  options,
  onSelect,
  menuVisible,
  setMenuVisible,
  placeholder,
  rightIcon = 'menu-down',
  ...props
}: {
  icon?: string;
  value: string;
  label: string;
  options: Array<{ label: string; value: string; icon?: string }>;
  onSelect: (value: string) => void;
  menuVisible: boolean;
  setMenuVisible: (v: boolean) => void;
  placeholder?: string;
  rightIcon?: string;
  [key: string]: any;
}) {
  const { inputStyle, menuInputStyle, iconStyle } = useWeedGrowInputStyle();
  const theme = (useColorScheme() ?? 'dark') as keyof typeof Colors;
  return (
    <Menu
      visible={menuVisible}
      onDismiss={() => setMenuVisible(false)}
      anchor={
        <TextInput
          mode="outlined"
          style={[inputStyle, menuInputStyle, props.style]}
          contentStyle={{ minHeight: 56, height: 56, paddingTop: 0, paddingBottom: 0 }}
          outlineColor="transparent"
          underlineColor="transparent"
          label={label}
          value={value}
          editable={false}
          left={icon ? <TextInput.Icon icon={icon} size={24} style={iconStyle} /> : undefined}
          right={<TextInput.Icon icon={rightIcon} size={24} style={iconStyle} onPress={() => setMenuVisible(true)} />}
          placeholder={placeholder}
          theme={{ colors: { background: inputStyle.backgroundColor } }}
          {...props}
        />
      }
    >
      {options.map((opt) => (
        <Menu.Item
          key={opt.value}
          onPress={() => {
            onSelect(opt.value);
            setMenuVisible(false);
          }}
          title={opt.label}
          leadingIcon={opt.icon}
        />
      ))}
    </Menu>
  );
}
