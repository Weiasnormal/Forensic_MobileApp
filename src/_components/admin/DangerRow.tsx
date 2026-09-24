import { colors } from "@/constants/colors";
import { getTypographyStyle } from "@/constants/typography";
import { ChevronRight, LucideIcon } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface DangerRowProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  color?: string;
  showChevron?: boolean;
  onPress?: () => void;
}

const DangerRow: React.FC<DangerRowProps> = ({
  icon: Icon,
  title,
  subtitle,
  color = colors.danger,
  showChevron = true,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconWrapper}>
        <Icon size={18} color={color} />
      </View>

      <View style={styles.textWrapper}>
        <Text style={[styles.title, { color }]}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      {showChevron && <ChevronRight size={18} color={colors.textTertiary} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  iconWrapper: {
    width: 32,
    marginRight: 4,
  },
  textWrapper: {
    flex: 1,
  },
  title: {
    ...getTypographyStyle("c1Caption", "semiBold"),
    color: colors.danger,
  },
  subtitle: {
    ...getTypographyStyle("c1Caption", "regular"),
    color: colors.textSecondary,
    marginTop: 2,
  },
});

export default DangerRow;
