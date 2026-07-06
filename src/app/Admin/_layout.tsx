import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AdminLayout() {
	const insets = useSafeAreaInsets();

	return (
		<View style={styles.root}>
			<View pointerEvents="none" style={[styles.statusBarFill, { height: insets.top }]} />
			<StatusBar style="light" translucent backgroundColor="#2D72D1" />
			<Stack screenOptions={{ headerShown: false }} />
		</View>
	);
}

const styles = StyleSheet.create({
	root: {
		flex: 1,
		backgroundColor: '#FFFFFF',
	},
	statusBarFill: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		backgroundColor: '#2D72D1',
	},
});