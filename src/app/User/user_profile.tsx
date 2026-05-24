import DraftSavedModal from '@/_components/modals/draft_saved';
import { useUser } from '@/store/userStore';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getCaseSummary, useCaseStore } from '../../store/caseStore';

export default function UserProfileScreen() {
	const router = useRouter();
	const { user, load } = useUser();
	const cases = useCaseStore((state) => state.cases);
	const resetMockDatabase = useCaseStore((state) => state.resetMockDatabase);
	const { totalCases, genuineCount, suspectCount } = getCaseSummary(cases);

	useFocusEffect(
		useCallback(() => {
			load();
		}, [load])
	);
	const [notificationsEnabled, setNotificationsEnabled] = useState(true);
	const [autoExportEnabled, setAutoExportEnabled] = useState(false);
	const [showSignOutModal, setShowSignOutModal] = useState(false);

	const hiddenSavedCases = useCaseStore((s) => s.hiddenSavedCases);
	const stashSavedCases = useCaseStore((s) => s.stashSavedCases);
	const restoreSavedCases = useCaseStore((s) => s.restoreSavedCases);

	return (
		<View style={styles.screen}>
			<StatusBar style="light" translucent backgroundColor="#2D72D1" />

		<View style={styles.heroCard}>
				<View style={styles.heroTopRow}>
{user.avatarUri ? (
					<Image source={{ uri: user.avatarUri }} style={styles.avatarCircle} />
				) : (
					<View style={styles.avatarCircle}>
						<Text style={styles.avatarText}>{getInitials(user.firstName, user.lastName)}</Text>
					</View>
				)}

					<View style={styles.heroCopy}>
						<Text style={styles.name}>{user.firstName} {user.lastName}</Text>
						<Text style={styles.subtitle}>{user.role} • {user.organization}</Text>
					</View>
				</View>

				<View style={styles.heroStats}>
					<HeroStat value={String(totalCases)} label="CASES" />
					<HeroStat value={String(genuineCount)} label="GENUINE" />
					<HeroStat value={String(suspectCount)} label="SUSPECTED" last />
				</View>
			</View>

			<ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
				<SectionLabel title="Account" />
				<CardShell>
					<ActionRow icon="person-outline" label="Edit Profile" onPress={() => router.push('/User/pages/setupAccount')} />
					<ActionRow icon="lock-closed-outline" label="Change Password" />
				</CardShell>

				<SectionLabel title="Preferences" />
				<CardShell>
					<ToggleRow
						icon="notifications-outline"
						label="Notifications"
						value={notificationsEnabled}
						onToggle={() => setNotificationsEnabled((value) => !value)}
					/>
					<ActionRow icon="grid-outline" label="Default Result View" value="Heatmap" />
					<ToggleRow
						icon="share-outline"
						label="Auto-Export Reports"
						value={autoExportEnabled}
						onToggle={() => setAutoExportEnabled((value) => !value)}
					/>
				</CardShell>

				<SectionLabel title="About" />
				<CardShell>
					<ActionRow icon="information-circle-outline" label="Help & Support" />
					<ActionRow icon="document-text-outline" label="App Version" value="v1.0.0" showChevron={false} />
				</CardShell>

				<SectionLabel title="Data" />
				<ToggleRow
					icon={hiddenSavedCases ? 'eye-off-outline' : 'eye-outline'}
					label={hiddenSavedCases ? 'Saved Cases Hidden (Restore)' : 'Hide Saved Cases'}
					value={!!hiddenSavedCases}
					onToggle={() => {
						if (!hiddenSavedCases) {
							Alert.alert(
								'Hide saved cases',
								'This will temporarily hide saved cases from the dashboard. Continue?',
								[
									{ text: 'Cancel', style: 'cancel' },
									{ text: 'Hide', style: 'destructive', onPress: () => stashSavedCases() },
								],
							);
						} else {
							restoreSavedCases();
						}
					}}
				/>
				<TouchableOpacity
					style={styles.resetButton}
					activeOpacity={0.88}
					onPress={() => {
						Alert.alert(
							'Reset test data',
							'This will remove the mock cases and drafts from the app. Continue?',
							[
								{ text: 'Cancel', style: 'cancel' },
								{ text: 'Reset', style: 'destructive', onPress: () => resetMockDatabase() },
							],
						);
					}}
				>
					<Text style={styles.resetButtonText}>Reset Test Data</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={styles.signOutButton}
					activeOpacity={0.88}
					onPress={() => setShowSignOutModal(true)}
				>
					<Text style={styles.signOutText}>Sign out</Text>
				</TouchableOpacity>
			</ScrollView>

			<DraftSavedModal
				visible={showSignOutModal}
				title="Sign out?"
				message="Are you sure you want to sign out?"
				primaryLabel="Sign out"
				secondaryLabel="No"
				onContinue={() => {
					setShowSignOutModal(false);
					router.replace('/_login/SignInPage');
				}}
				onDismiss={() => setShowSignOutModal(false)}
			/>
		</View>
	);
}

function getInitials(first = '', last = '') {
	return ((first[0] || '') + (last[0] || '')).toUpperCase();
}

function HeroStat({ value, label, last }: { value: string; label: string; last?: boolean }) {
	return (
		<View style={[styles.heroStat, last && styles.heroStatLast]}>
			<Text style={styles.heroStatValue}>{value}</Text>
			<Text style={styles.heroStatLabel}>{label}</Text>
		</View>
	);
}

function SectionLabel({ title }: { title: string }) {
	return <Text style={styles.sectionLabel}>{title}</Text>;
}

function CardShell({ children }: { children: React.ReactNode }) {
	return <View style={styles.card}>{children}</View>;
}

function ActionRow({
	icon,
	label,
	value,
	showChevron = true,
	onPress,
}: {
	icon: keyof typeof Ionicons.glyphMap;
	label: string;
	value?: string;
	showChevron?: boolean;
	onPress?: () => void;
}) {
	return (
		<TouchableOpacity style={styles.row} activeOpacity={0.86} onPress={onPress}>
			<View style={styles.rowLeft}>
				<Ionicons name={icon} size={20} color="#111827" />
				<Text style={styles.rowLabel}>{label}</Text>
			</View>

			<View style={styles.rowRight}>
				{value ? <Text style={styles.rowValue}>{value}</Text> : null}
				{showChevron ? <Ionicons name="chevron-forward" size={18} color="#94A3B8" /> : null}
			</View>
		</TouchableOpacity>
	);
}

function ToggleRow({
	icon,
	label,
	value,
	onToggle,
}: {
	icon: keyof typeof Ionicons.glyphMap;
	label: string;
	value: boolean;
	onToggle: () => void;
}) {
	return (
		<View style={styles.row}>
			<View style={styles.rowLeft}>
				<Ionicons name={icon} size={20} color="#111827" />
				<Text style={styles.rowLabel}>{label}</Text>
			</View>

			<TouchableOpacity
				style={[styles.toggle, value ? styles.toggleOn : styles.toggleOff]}
				onPress={onToggle}
				activeOpacity={0.9}
			>
				<View style={[styles.toggleKnob, value ? styles.toggleKnobOn : styles.toggleKnobOff]} />
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: '#F4F7FB',
	},
	content: {
		paddingHorizontal: 16,
		paddingTop: 12,
		paddingBottom: 28,
	},
 	heroCard: {
 		backgroundColor: '#2D72D1',
 		paddingHorizontal: 16,
 		paddingTop: 20,
 		paddingBottom: 20,
 		borderBottomLeftRadius: 25,
 		borderBottomRightRadius: 25,
 		overflow: 'hidden',
 	},
	heroTopRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 14,
	},
	avatarCircle: {
		width: 64,
		height: 64,
		borderRadius: 32,
		borderWidth: 2,
		borderColor: 'rgba(255,255,255,0.35)',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(255,255,255,0.12)',
	},
	avatarText: {
		color: '#FFFFFF',
		fontSize: 18,
		fontWeight: '900',
		letterSpacing: 0.2,
	},
	heroCopy: {
		flex: 1,
	},
	name: {
		color: '#FFFFFF',
		fontSize: 22,
		fontWeight: '900',
		letterSpacing: -0.5,
	},
 	subtitle: {
 		marginTop: 2,
 		color: 'rgba(233, 241, 255, 0.9)',
 		fontSize: 11,
 		fontWeight: '600',
 	},
	heroStats: {
		flexDirection: 'row',
		marginTop: 18,
		borderRadius: 14,
		overflow: 'hidden',
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.16)',
		backgroundColor: 'rgba(255,255,255,0.08)',
	},
	heroStat: {
		flex: 1,
		paddingVertical: 14,
		alignItems: 'center',
		borderRightWidth: 1,
		borderRightColor: 'rgba(255,255,255,0.16)',
	},
	heroStatLast: {
		borderRightWidth: 0,
	},
	heroStatValue: {
		color: '#FFFFFF',
		fontSize: 19,
		fontWeight: '900',
		letterSpacing: -0.3,
	},
	heroStatLabel: {
		marginTop: 3,
		color: 'rgba(255,255,255,0.64)',
		fontSize: 10,
		fontWeight: '700',
		letterSpacing: 0.5,
	},
	sectionLabel: {
		color: '#A3B0C4',
		fontSize: 14,
		fontWeight: '800',
		marginTop: 2,
		marginBottom: 10,
	},
	card: {
		backgroundColor: '#FFFFFF',
		borderRadius: 18,
		borderWidth: 1,
		borderColor: '#E3EAF3',
		overflow: 'hidden',
		marginBottom: 20,
	},
	row: {
		minHeight: 56,
		paddingHorizontal: 16,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		borderBottomWidth: 1,
		borderBottomColor: '#E9EEF5',
	},
	rowLeft: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		flex: 1,
	},
	rowLabel: {
		color: '#111827',
		fontSize: 14,
		fontWeight: '700',
	},
	rowRight: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
	},
	rowValue: {
		color: '#64748B',
		fontSize: 13,
		fontWeight: '700',
	},
	toggle: {
		width: 36,
		height: 22,
		borderRadius: 999,
		padding: 2,
		justifyContent: 'center',
	},
	toggleOn: {
		backgroundColor: '#1F6FE5',
	},
	toggleOff: {
		backgroundColor: '#D7DEE9',
	},
	toggleKnob: {
		width: 18,
		height: 18,
		borderRadius: 9,
		backgroundColor: '#FFFFFF',
	},
	toggleKnobOn: {
		alignSelf: 'flex-end',
	},
	toggleKnobOff: {
		alignSelf: 'flex-start',
	},
	signOutButton: {
		marginTop: 4,
		borderWidth: 1,
		borderColor: '#FFB5B5',
		backgroundColor: '#FFF5F5',
		borderRadius: 16,
		paddingVertical: 15,
		alignItems: 'center',
	},
	resetButton: {
		marginTop: 2,
		borderWidth: 1,
		borderColor: '#FECACA',
		backgroundColor: '#FEF2F2',
		borderRadius: 16,
		paddingVertical: 15,
		alignItems: 'center',
	},
	resetButtonText: {
		color: '#B91C1C',
		fontSize: 15,
		fontWeight: '900',
	},
	signOutText: {
		color: '#EF4444',
		fontSize: 15,
		fontWeight: '900',
	},
});
