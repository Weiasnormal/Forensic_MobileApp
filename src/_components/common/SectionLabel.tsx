import { colors } from "@/constants/colors";
import React from "react";
import { StyleProp, StyleSheet, Text, TextStyle } from "react-native";
import { getTypographyStyle } from "../../constants/typography";

interface SectionLabelProps {
  label: string;
  style?: StyleProp<TextStyle>;
}

const SectionLabel: React.FC<SectionLabelProps> = ({ label, style }) => {
  return <Text style={[styles.label, style]}>{label}</Text>;
};

const styles = StyleSheet.create({
  label: {
    ...getTypographyStyle("headline"),
    color: colors.textSecondary,
    marginBottom: 10,
  },
});

export default SectionLabel;
