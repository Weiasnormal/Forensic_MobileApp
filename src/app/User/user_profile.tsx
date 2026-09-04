import GroupedCard from '@/_components/common/GroupedCard';
import Avatar from '@/_components/common/Avatar';
import SectionLabel from '@/_components/common/SectionLabel';
import SettingsRow from '@/_components/common/SettingsRow';
import ToggleRow from '@/_components/common/ToggleRow';
import Divider from '@/_components/common/Divider';
import SignOutButton from '@/_components/common/SignOutButton';
import SecondaryButton from '@/_components/common/SecondaryButton';
import LogoutModal from '@/_components/modals/logout';
import { ScreenStatusBar } from '@/_components/common/ScreenStatusBar';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';
import { useUser } from '@/store/userStore';
import { getCaseSummary, useCaseStore } from '@/store/caseStore';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Bell, Eye, EyeOff, FileText, Grid, Info, Lock, Upload, User, UserX } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import DangerRow from '@/_components/admin/DangerRow';
import DeleteAccountModal from '@/_components/modals/delete_account';
import { useAuthStore } from '@/store/authStore';
import ErrorModal from '@/_components/modals/error_modal';
import SuccessModal from '@/_components/modals/success_modal';
import { useFeedbackStore } from '@/store/feedbackStore';

export default function UserProfileScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { user, load } = useUser();
	const logout = useAuthStore((state) => state.logout);
	const cases = useCaseStore((state) => state.cases);
	const resetMockDatabase = useCaseStore((state) => state.resetMockDatabase);
	const allowUploadSourceChoice = useCaseStore((state) => state.allowUploadSourceChoice);
	const setAllowUploadSourceChoice = useCaseStore((state) => state.setAllowUploadSourceChoice);
	const { totalCases, genuineCount, suspectCount } = getCaseSummary(cases);

	useFocusEffect(
		useCallback(() => {
			load();
		}, [load]),
	);
	const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
	const [isDeletingAccount, setIsDeletingAccount] = useState(false);
	const [deleteSuccess, setDeleteSuccess] = useState(false);

	const [notificationsEnabled, setNotificationsEnabled] = useState(true);
	const [autoExportEnabled, setAutoExportEnabled] = useState(false);
	const [logoutModalVisible, setLogoutModalVisible] = useState(false);

	const hiddenSavedCases = useCaseStore((s) => s.hiddenSavedCases);
	const stashSavedCases = useCaseStore((s) => s.stashSavedCases);
	const restoreSavedCases = useCaseStore((s) => s.restoreSavedCases);

	const initials = getInitials(user.firstName, user.lastName);

	const [deleteError, setDeleteError] = useState(false);

	const handleToggleNotifications = (value: boolean) => {
	setNotificationsEnabled(value);
	useFeedbackStore.getState().showToast(
		value ? 'Notifications enabled' : 'Notifications disabled',
		'successLight',
	);
	};

	const handleToggleAutoExport = (value: boolean) => {
	setAutoExportEnabled(value);
	useFeedbackStore.getState().showToast(
		value ? 'Auto-export reports enabled' : 'Auto-export reports disabled',
		'successLight',
	);
	};

	const handleConfirmSignOut = async () => {
	setLogoutModalVisible(false);
	await logout();
	router.replace('/_login/SignInPage');};

	return (
		<SafeAreaView edges = {['left', 'right']} style={styles.safeArea}>
			<ScreenStatusBar variant ="onBrand"  />

			<View style={[styles.header, { paddingTop: insets.top }]}>
				<View style={styles.headerGlow} />

				<View style={styles.headerTopRow}>
					<Avatar initials={initials} size={64} variant="onDark" />
					<View style={styles.headerCopy}>
						<Text allowFontScaling={false} style={styles.name}>{user.firstName} {user.lastName}</Text>
						<Text allowFontScaling={false} style={styles.subtitle} numberOfLines={1} ellipsizeMode="tail">
							{user.role} • {user.organization}
						</Text>
					</View>
				</View>

				<View style={styles.heroStats}>
					<HeroStat value={String(totalCases)} label="CASES" />
					<HeroStat value={String(genuineCount)} label="GENUINE" />
					<HeroStat value={String(suspectCount)} label="SUSPECTED" last />
				</View>
			</View>

			<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollArea}>
				<SectionLabel label="Account" />
				<GroupedCard>
					<SettingsRow icon={User} title="Edit Profile" onPress={() => router.push('/User/pages/setupAccount')} />
					<Divider />
					<SettingsRow icon={Lock} title="Change Password" onPress={() => router.push('/User/pages/ChangePasswordScreen')} />
				</GroupedCard>

				<SectionLabel label="Preferences" />
				<GroupedCard>
					<ToggleRow
						icon={Bell}
						title="Notifications"
						value={notificationsEnabled}
						onValueChange={handleToggleNotifications}
					/>
					<Divider />
					<SettingsRow icon={Grid} title="Default Result View" rightText="Heatmap" />
					<Divider />
					<ToggleRow
						icon={Upload}
						title="Auto-Export Reports"
						value={autoExportEnabled}
						onValueChange={handleToggleAutoExport}
					/>
				</GroupedCard>

				<SectionLabel label="About" />
				<GroupedCard>
					<SettingsRow icon={Info} title="Help & Support" />
					<Divider />
					<SettingsRow icon={FileText} title="App Version" rightText="v1.0.0" showChevron={false} />
				</GroupedCard>

				<SectionLabel label="Data" />
				<GroupedCard>
					<ToggleRow
						icon={hiddenSavedCases ? EyeOff : Eye}
						title={hiddenSavedCases ? 'Saved Cases Hidden' : 'Hide Saved Cases'}
						subtitle={hiddenSavedCases ? 'Tap to restore them to your dashboard' : 'Temporarily hide saved cases from the dashboard'}
						value={!!hiddenSavedCases}
						onValueChange={() => {
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
							<Divider />
							<ToggleRow
								icon={Upload}
								title="Choose Camera or Gallery"
								subtitle="When enabled, uploads let you pick between the camera and the image library."
								value={allowUploadSourceChoice}
								onValueChange={setAllowUploadSourceChoice}
							/>
				</GroupedCard>

				<SecondaryButton
					label="Reset Test Data"
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
					backgroundColor={colors.dangerLight}
					borderColor={colors.dangerBorder}
					textColor={colors.danger}
					style={styles.resetSpacing}
				/>

				<SignOutButton style={styles.signOutSpacing} onPress={() => setLogoutModalVisible(true)} />
			<LogoutModal
				visible={logoutModalVisible}
				onCancel={() => setLogoutModalVisible(false)}
				onLogout={handleConfirmSignOut}
			/>
			<Divider />
				<DangerRow
					icon={UserX}
					title="Delete Account"
					subtitle="Permanently remove your login access"
					onPress={() => setShowDeleteAccountModal(true)}
					/>
				<DeleteAccountModal
					visible={showDeleteAccountModal}
					isDeleting={isDeletingAccount}
					onCancel={() => setShowDeleteAccountModal(false)}
					onConfirm={async () => {
					setIsDeletingAccount(true);
					try {
						await useAuthStore.getState().deleteAccount();
						setShowDeleteAccountModal(false);
						setDeleteSuccess(true);
						router.replace('/_login/SignInPage');
					} catch {
						setShowDeleteAccountModal(false);
						setDeleteError(true);
					} finally {
						setIsDeletingAccount(false);
					}
					}}/>
				<ErrorModal
					visible={deleteError}
					title="Error"
					message="Unable to delete account. Please try again."
					onPrimaryPress={() => setDeleteError(false)}
					/>
				<SuccessModal
					visible={deleteSuccess}
					title="Account Deleted"
					message="Your login access has been removed. Any case records you submitted are retained for chain-of-custody purposes."
					primaryLabel="Done"
					onPrimaryPress={() => {
						setDeleteSuccess(false);
						router.replace('/_login/SignInPage');
					}}
					/>
			</ScrollView>
		</SafeAreaView>
	);
}

function getInitials(first = '', last = '') {
	return ((first[0] || '') + (last[0] || '')).toUpperCase();
}

function HeroStat({ value, label, last }: { value: string; label: string; last?: boolean }) {
	return (
		<View style={[styles.heroStat, last && styles.heroStatLast]}>
			<Text allowFontScaling={false} style={styles.heroStatValue}>{value}</Text>
			<Text allowFontScaling={false} style={styles.heroStatLabel}>{label}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: colors.background,
	},
	header: {
		position: 'relative',
		backgroundColor: colors.primary,
		borderBottomLeftRadius: 28,
		borderBottomRightRadius: 28,
		overflow: 'hidden',
		paddingHorizontal: 24,
		paddingBottom: 20,
	},
	headerGlow: {
		position: 'absolute',
		right: -100,
		bottom: -170,
		width: 232,
		height: 232,
		borderRadius: 116,
		backgroundColor: 'rgba(255, 255, 255, 0.08)',
	},
	headerTopRow: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	headerCopy: {
		marginLeft: 18,
		flex: 1,
	},
	name: {
		...getTypographyStyle('t1Title', 'bold'),
		color: colors.primaryText,
	},
	subtitle: {
		...getTypographyStyle('c1Caption'),
		color: 'rgba(255, 255, 255, 0.8)',
		marginTop: 2,
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
		...getTypographyStyle('t3Title', 'bold'),
		fontSize: 19,
		color: colors.primaryText,
		letterSpacing: -0.3,
	},
	heroStatLabel: {
		...getTypographyStyle('c3Caption', 'bold'),
		marginTop: 3,
		color: 'rgba(255,255,255,0.64)',
		letterSpacing: 0.5,
	},
	scrollArea: {
		paddingHorizontal: 16,
		paddingTop: 25,
		paddingBottom: 18,
		backgroundColor: colors.background,
	},
	resetSpacing: {
		marginTop: 4,
	},
	signOutSpacing: {
		marginTop: 12,
	},
});