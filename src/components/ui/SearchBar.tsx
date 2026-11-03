import { Image } from 'expo-image';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { colors, radius, typography } from '../../theme';

interface Props {
  value: string;
  onChangeText: (value: string) => void;
  onFilterPress: () => void;
}

export function SearchBar({ value, onChangeText, onFilterPress }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.searchIcon}>
        <Image source={require('../../../assets/figma/search-circle.svg')} style={styles.searchPiece} />
        <Image source={require('../../../assets/figma/search-handle.svg')} style={styles.searchPiece} />
      </View>
      <TextInput
        accessibilityLabel="Tìm theo tòa, số phòng"
        placeholder="Tìm theo tòa, số phòng..."
        placeholderTextColor={colors.placeholder}
        value={value}
        onChangeText={onChangeText}
        style={styles.input}
      />
      <Pressable accessibilityLabel="Bộ lọc" accessibilityRole="button" onPress={onFilterPress} style={styles.filterButton}>
        <Image source={require('../../../assets/figma/filter-lines.svg')} style={styles.filterPiece} />
        <Image source={require('../../../assets/figma/filter-knobs.svg')} style={styles.filterPiece} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height: 46, borderWidth: 0.8, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: radius.button, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 11 },
  searchIcon: { width: 17, height: 17, marginRight: 8 },
  searchPiece: { position: 'absolute', width: 17, height: 17 },
  input: { flex: 1, padding: 0, color: colors.text, fontFamily: typography.regular, fontSize: 13.5 },
  filterButton: { width: 24, height: 30, alignItems: 'center', justifyContent: 'center', marginLeft: 5 },
  filterPiece: { position: 'absolute', width: 17, height: 17 },
});
