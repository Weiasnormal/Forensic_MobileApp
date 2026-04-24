import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type TintKey = 'red' | 'green';
type CaseType = 'SIG' | 'HW';

interface CaseItem {
	id: string;
	type: CaseType;
	subtitle: string;
	status: string;
	icon: keyof typeof Ionicons.glyphMap;
	tint: TintKey;
}

const caseRows: CaseItem[] = [
	{ id: 'CASE-2025-0048', type: 'SIG', subtitle: 'Cheque · Mar 29', status: 'FORGED', icon: 'location-outline', tint: 'red' },
	{ id: 'CASE-2025-0047', type: 'SIG', subtitle: 'Contract · Mar 27', status: 'GENUINE', icon: 'brush-outline', tint: 'green' },
	{ id: 'CASE-2025-0046', type: 'SIG', subtitle: 'Property deed · Mar 25', status: 'FORGED', icon: 'location-outline', tint: 'red' },
	{ id: 'CASE-2025-0045', type: 'HW', subtitle: 'Document · Mar 22', status: 'GENUINE', icon: 'brush-outline', tint: 'green' },
	{ id: 'CASE-2025-0044', type: 'HW', subtitle: 'Will draft · Mar 20', status: 'GENUINE', icon: 'location-outline', tint: 'green' },
];

export default function UserCasesScreen() {
	return (
		<SafeAreaView style={styles.screen}>
			<ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
				<Text style={styles.pageTitle}>My cases</Text>

				<View style={styles.searchBar}>
					<Ionicons name="search" size={18} color="#94A3B8" />
					<TextInput placeholder="Search cases..." placeholderTextColor="#94A3B8" style={styles.searchInput} />
				</View>

				<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
					<FilterChip label="All" active />
					<FilterChip label="Signature" />
					<FilterChip label="Handwriting" />
					<FilterChip label="Forged" />
					<FilterChip label="Genuine" />
				</ScrollView>

				<View style={styles.listWrap}>
					{caseRows.map((item, index) => (
						<TouchableOpacity key={item.id} style={[styles.caseCard, index === caseRows.length - 1 && styles.caseCardLast]} activeOpacity={0.78}>
							<View style={[styles.caseIcon, item.tint === 'red' && styles.caseIconRed, item.tint === 'green' && styles.caseIconGreen]}>
								<Ionicons name={item.icon} size={17} color={item.tint === 'green' ? '#16A34A' : '#3B82F6'} />
							</View>

							<View style={styles.caseTextBlock}>
								<View style={styles.caseTitleRow}>
									<Text style={styles.caseTitle}>{item.id}</Text>
									<View style={[styles.typeChip, item.type === 'HW' && styles.typeChipHw]}>
										<Text style={[styles.typeChipText, item.type === 'HW' && styles.typeChipTextHw]}>{item.type}</Text>
									</View>
								</View>
								<Text style={styles.caseSubtitle}>{item.subtitle}</Text>
							</View>

							<View style={[styles.statusPill, item.tint === 'red' && styles.statusPillRed, item.tint === 'green' && styles.statusPillGreen]}>
								<Text style={[styles.statusPillText, item.tint === 'red' && styles.statusPillTextRed, item.tint === 'green' && styles.statusPillTextGreen]}>
									{item.status}
								</Text>
							</View>
						</TouchableOpacity>
					))}
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

function FilterChip({ label, active = false }: { label: string; active?: boolean }) {
	return (
		<TouchableOpacity style={[styles.filterChip, active && styles.filterChipActive]} activeOpacity={0.85}>
			<Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{label}</Text>
		</TouchableOpacity>
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
		fontSize: 25,
		fontWeight: '900',
		color: '#0F172A',
		letterSpacing: -0.6,
		marginTop: 15,
		marginBottom: 10,
		paddingHorizontal: 6,
	},
	searchBar: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
		backgroundColor: '#ffffff',
		borderRadius: 14,
		paddingHorizontal: 14,
		borderWidth: 1,
		borderColor: '#D9E3EF',
		marginBottom: 12,
	},
	searchInput: {
		flex: 1,
		color: '#0F172A',
		fontSize: 15,
		fontWeight: '600',
	},
	filterRow: {
		gap: 8,
		marginBottom: 12,
		paddingRight: 8,
	},
	filterChip: {
		paddingVertical: 8,
		paddingHorizontal: 16,
		borderRadius: 999,
		borderWidth: 1,
		borderColor: '#D9E3EF',
		backgroundColor: '#FFFFFF',
	},
	filterChipActive: {
		backgroundColor: '#185FA5',
		borderColor: '#185FA5',
	},
	filterChipText: {
		color: '#64748B',
		fontSize: 12,
		fontWeight: '700',
	},
	filterChipTextActive: {
		color: '#FFFFFF',
	},
	listWrap: {
		gap: 10,
	},
	caseCard: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 12,
		paddingVertical: 10,
		borderWidth: 1,
		borderColor: '#D9E3EF',
		backgroundColor: '#FFFFFF',
		borderRadius: 14,
	},
	caseCardLast: {},
	caseIcon: {
		width: 40,
		height: 40,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 12,
		borderWidth: 1,
	},
	caseIconRed: {
		backgroundColor: '#EAF3FF',
		borderColor: '#BFD1EA',
	},
	caseIconGreen: {
		backgroundColor: '#F0FDF4',
		borderColor: '#BBF7D0',
	},
	caseIconAmber: {
		backgroundColor: '#FFFBEB',
		borderColor: '#FDE68A',
	},
	caseTextBlock: {
		flex: 1,
		minWidth: 0,
	},
	caseTitleRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		marginBottom: 2,
	},
	caseTitle: {
		color: '#1F2937',
		fontSize: 13,
		fontWeight: '900',
	},
	typeChip: {
		backgroundColor: '#DCE8F7',
		borderWidth: 1,
		borderColor: '#BFD1EA',
		borderRadius: 4,
		paddingHorizontal: 5,
		paddingVertical: 1,
	},
	typeChipHw: {
		backgroundColor: '#DCF4E5',
		borderColor: '#B8E6CC',
	},
	typeChipText: {
		color: '#4372B5',
		fontSize: 9,
		fontWeight: '800',
	},
	typeChipTextHw: {
		color: '#268E55',
	},
	caseSubtitle: {
		color: '#64748B',
		fontSize: 12,
		fontWeight: '600',
	},
	statusPill: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 8,
		borderWidth: 1,
		marginLeft: 10,
	},
	statusPillRed: {
		backgroundColor: '#FEF2F2',
		borderColor: '#FECACA',
	},
	statusPillGreen: {
		backgroundColor: '#F0FDF4',
		borderColor: '#BBF7D0',
	},
	statusPillAmber: {
		backgroundColor: '#FFFBEB',
		borderColor: '#FDE68A',
	},
	statusPillText: {
		fontSize: 10,
		fontWeight: '800',
		letterSpacing: 0.3,
	},
	statusPillTextRed: {
		color: '#E24B4A',
	},
	statusPillTextGreen: {
		color: '#16A34A',
	},
	statusPillTextAmber: {
		color: '#D97706',
	},
});
