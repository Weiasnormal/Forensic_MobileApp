import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

const statsBars = [
	{ label: 'Mon', genuine: 44, forged: 34 },
	{ label: 'Tue', genuine: 52, forged: 28 },
	{ label: 'Wed', genuine: 38, forged: 41 },
	{ label: 'Thu', genuine: 61, forged: 22 },
	{ label: 'Fri', genuine: 68, forged: 19 },
	{ label: 'Sat', genuine: 49, forged: 29 },
	{ label: 'Sun', genuine: 57, forged: 24 },
];

export default function UserStatsScreen() {
	return (
		<SafeAreaView style={styles.screen}>
			<ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
				<Text style={styles.pageTitle}>Stats</Text>
				<Text style={styles.pageSubtitle}>Track trends, confidence, and throughput</Text>

				<View style={styles.heroStrip}>
					<View style={styles.heroStatCard}>
						<Text style={styles.heroStatValue}>128</Text>
						<Text style={styles.heroStatLabel}>Total scans</Text>
					</View>
					<View style={styles.heroStatCard}>
						<Text style={styles.heroStatValue}>91%</Text>
						<Text style={styles.heroStatLabel}>Detection accuracy</Text>
					</View>
				</View>

				<View style={styles.metricCardWide}>
					<View style={styles.metricRow}>
						<View>
							<Text style={styles.metricLabel}>Processing load</Text>
							<Text style={styles.metricValue}>42 active files</Text>
						</View>
						<View style={styles.metricBadge}>
							<Ionicons name="pulse-outline" size={14} color="#16A34A" />
							<Text style={styles.metricBadgeText}>Stable</Text>
						</View>
					</View>
				</View>

				<View style={styles.chartCard}>
					<Text style={styles.cardTitle}>Weekly verdict split</Text>
					<View style={styles.barChart}>
						{statsBars.map((bar) => (
							<View key={bar.label} style={styles.barWrap}>
								<View style={styles.barStack}>
									<View style={[styles.bar, styles.barForged, { height: `${bar.forged}%` }]} />
									<View style={[styles.bar, styles.barGenuine, { height: `${bar.genuine}%` }]} />
								</View>
								<Text style={styles.barLabel}>{bar.label}</Text>
							</View>
						))}
					</View>

					<View style={styles.legendRow}>
						<LegendItem color="#16A34A" label="Genuine" />
						<LegendItem color="#E24B4A" label="Forged" />
					</View>
				</View>

				<View style={styles.chartCard}>
					<Text style={styles.cardTitle}>Recent accuracy</Text>
					<View style={styles.ringRow}>
						<View style={styles.ringOuter}>
							<View style={styles.ringInner}>
								<Text style={styles.ringValue}>94%</Text>
							</View>
						</View>
						<View style={styles.ringTextBlock}>
							<Text style={styles.ringTitle}>Strong confidence window</Text>
							<Text style={styles.ringSubtitle}>Your average result confidence remains high across the last 30 scans.</Text>
						</View>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

function LegendItem({ color, label }: { color: string; label: string }) {
	return (
		<View style={styles.legendItem}>
			<View style={[styles.legendDot, { backgroundColor: color }]} />
			<Text style={styles.legendText}>{label}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: '#F8FAFC',
	},
	content: {
		padding: 16,
		paddingBottom: 18,
	},
	pageTitle: {
		color: '#0F172A',
		fontSize: 25,
		fontWeight: '900',
		letterSpacing: -0.6,
		marginTop: 15,
		marginBottom: 2,
		paddingHorizontal: 2,
	},
	pageSubtitle: {
		color: '#64748B',
		fontSize: 12,
		fontWeight: '600',
		marginBottom: 12,
		paddingHorizontal: 2,
	},
	heroStrip: {
		flexDirection: 'row',
		gap: 10,
		marginBottom: 12,
	},
	heroStatCard: {
		flex: 1,
		backgroundColor: '#FFFFFF',
		borderRadius: 16,
		borderWidth: 1,
		borderColor: '#D9E3EF',
		padding: 16,
	},
	heroStatValue: {
		color: '#0F172A',
		fontSize: 24,
		fontWeight: '900',
		letterSpacing: -0.6,
	},
	heroStatLabel: {
		marginTop: 3,
		color: '#64748B',
		fontSize: 11,
		fontWeight: '600',
	},
	metricCardWide: {
		backgroundColor: '#FFFFFF',
		borderRadius: 18,
		borderWidth: 1,
		borderColor: '#D9E3EF',
		padding: 16,
		marginBottom: 12,
	},
	metricRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	metricLabel: {
		color: '#64748B',
		fontSize: 10,
		fontWeight: '800',
		letterSpacing: 1.1,
		textTransform: 'uppercase',
	},
	metricValue: {
		color: '#0F172A',
		fontSize: 17,
		fontWeight: '900',
		marginTop: 4,
	},
	metricBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 5,
		backgroundColor: '#F0FDF4',
		borderWidth: 1,
		borderColor: '#BBF7D0',
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 999,
	},
	metricBadgeText: {
		color: '#16A34A',
		fontSize: 11,
		fontWeight: '800',
	},
	chartCard: {
		backgroundColor: '#FFFFFF',
		borderRadius: 18,
		borderWidth: 1,
		borderColor: '#D9E3EF',
		padding: 16,
		marginBottom: 12,
	},
	cardTitle: {
		color: '#0F172A',
		fontSize: 12,
		fontWeight: '800',
		marginBottom: 14,
	},
	barChart: {
		flexDirection: 'row',
		alignItems: 'flex-end',
		gap: 7,
		height: 126,
	},
	barWrap: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'flex-end',
	},
	barStack: {
		width: '100%',
		height: 100,
		justifyContent: 'flex-end',
		gap: 3,
	},
	bar: {
		width: '100%',
		borderRadius: 8,
	},
	barForged: {
		backgroundColor: '#E24B4A',
	},
	barGenuine: {
		backgroundColor: '#16A34A',
	},
	barLabel: {
		marginTop: 6,
		fontSize: 10,
		color: '#94A3B8',
		fontWeight: '600',
	},
	legendRow: {
		flexDirection: 'row',
		gap: 14,
		marginTop: 10,
	},
	legendItem: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	legendDot: {
		width: 8,
		height: 8,
		borderRadius: 2,
	},
	legendText: {
		color: '#64748B',
		fontSize: 11,
		fontWeight: '600',
	},
	ringRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 16,
	},
	ringOuter: {
		width: 88,
		height: 88,
		borderRadius: 44,
		borderWidth: 8,
		borderColor: '#185FA5',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#F8FAFC',
	},
	ringInner: {
		width: 66,
		height: 66,
		borderRadius: 33,
		backgroundColor: '#FFFFFF',
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
		borderColor: '#D9E3EF',
	},
	ringValue: {
		color: '#0F172A',
		fontSize: 18,
		fontWeight: '900',
	},
	ringTextBlock: {
		flex: 1,
	},
	ringTitle: {
		color: '#0F172A',
		fontSize: 12,
		fontWeight: '800',
		marginBottom: 4,
	},
	ringSubtitle: {
		color: '#64748B',
		fontSize: 11,
		lineHeight: 17,
		fontWeight: '500',
	},
});
