import DraftSavedModal from '@/_components/modals/draft_saved';
import FormField from '@/_components/common/FormField';
import ScreenHeader from '@/_components/common/ScreenHeader';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@/store/userStore';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import ErrorModal from '@/_components/modals/error_modal';
import ErrorBanner from '@/_components/common/ErrorBanner';
import { useFeedbackStore } from '@/store/feedbackStore';

interface EditProfileScreenProps {
  onBackPress?: () => void;
  onEditAvatarPress?: () => void;
  onSavePress?: () => void;
}

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({
  onBackPress,
  onEditAvatarPress,
  onSavePress,
}) => {
  const router = useRouter();
  const { user, setUser } = useUser();
  const insets = useSafeAreaInsets();
  const [firstName, setFirstName] = useState(user.firstName ?? '');
  const [lastName, setLastName] = useState(user.lastName ?? '');
  const [email, setEmail] = useState(user.email ?? '');
  const [role] = useState(user.role ?? '');
  const [organization] = useState(user.organization ?? '');
  const [avatarUri, setAvatarUri] = useState<string | null>(user.avatarUri ?? null);
  const [showSaveProfileModal, setShowSaveProfileModal] = useState(false);

  const canContinue = firstName.trim().length > 1 && lastName.trim().length > 1 && email.trim().length > 3;

  const [saveError, setSaveError] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);

 const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.status !== 'granted') {
        setAvatarError('Photo library access was denied. Enable it in your device settings to change your avatar.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.7,
        allowsEditing: true,
        aspect: [1, 1],
      });

      if (!result.canceled) {
        const uri = result.assets?.[0]?.uri;
        if (!uri) return;
        setAvatarUri(uri);
        setAvatarError(null);
      }
    } catch {
      setAvatarError('Unable to open your photo library. Please try again.');
    }
  };
  const handleSave = async () => {
    try {
      await setUser({
        firstName,
        lastName,
        email,
        role,
        organization,
        avatarUri: avatarUri || undefined,
      });

      useFeedbackStore.getState().showToast('Profile updated successfully', 'success');

      if (onSavePress) {
        onSavePress();
        return;
      }

      router.back();
    } catch {
      setSaveError('Unable to save your profile changes. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" translucent backgroundColor="transparent" />

      <ScreenHeader title="Edit Profile" onBackPress={onBackPress ?? router.back} />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(140, insets.bottom + 120) }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable style={styles.avatarWrap} onPress={onEditAvatarPress ?? pickImage}>
          <View style={styles.avatarCircle}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarInitials}>{getInitials(firstName, lastName)}</Text>
            )}
          </View>
          <View style={styles.editBadge}>
            <Ionicons name="pencil" size={14} color={colors.primaryText} />
          </View>
        </Pressable>

        <ErrorBanner message={avatarError} />

        <View style={styles.field}>
          <FormField
            label="First name"
            value={firstName}
            onChangeText={setFirstName}
            style={styles.formField}
          />
        </View>

        <View style={styles.field}>
          <FormField
            label="Last name"
            value={lastName}
            onChangeText={setLastName}
            style={styles.formField}
          />
        </View>

        <View style={styles.field}>
          <FormField
            label="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.formField}
          />
        </View>

        <View style={styles.field}>
          <FormField
            label="Role"
            value={role}
            style={styles.formField}
            disabled
          />
        </View>

        <View style={styles.field}>
          <FormField
            label="Organization"
            value={organization}
            style={styles.formField}
            disabled
          />
        </View>
      </ScrollView>

      <View style={[styles.buttonContainer, { bottom: insets.bottom, zIndex: 50 }]}> 
        <Pressable
          onPress={() => setShowSaveProfileModal(true)}
          disabled={!canContinue}
          style={[styles.primaryButton, !canContinue && styles.disabledButton]}
        >
          <Text style={styles.primaryButtonText}>Save</Text>
        </Pressable>
      </View>

      <DraftSavedModal
        visible={showSaveProfileModal}
        title="Save profile?"
        message="Do you want to save these profile changes?"
        saveLabel="Save profile"
        discardLabel="No"
        goBackLabel="Cancel"
        onSaveDraft={() => {
          setShowSaveProfileModal(false);
          void handleSave();
        }}
        onDiscard={() => setShowSaveProfileModal(false)}
        onGoBack={() => setShowSaveProfileModal(false)}
      />

      <ErrorModal
        visible={!!saveError}
        title="Save Failed"
        message={saveError ?? ''}
        onPrimaryPress={() => setSaveError(null)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background2,
  },
  topBarWrapper: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: colors.background,
  },
  backButton: {
    padding: 4,
  },
  backButtonBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    flex: 1,
    ...getTypographyStyle('t3Title'),
    color: colors.textPrimary,
    textAlign: 'center',
  },
  topBarSpacer: {
    width: 48,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 36,
    paddingBottom: 140,
  },
  avatarWrap: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 87,
    height: 87,
    borderRadius: 48,
  },
  avatarInitials: {
    ...getTypographyStyle('t1Title'),
    color: colors.primaryText,
  },
  editBadge: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.background,
    borderWidth: 2,
  },
  field: {
    marginBottom: 14,
  },
  formField: {
    marginBottom: 0,
  },
  buttonContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: colors.background2,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  primaryButton: {
    borderRadius: 12,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: colors.disabledBackground,
    opacity: 1,
  },
  primaryButtonText: {
    ...getTypographyStyle('b1Button'),
    color: colors.primaryText,
  },
});

function getInitials(first = '', last = '') {
  return ((first[0] || '') + (last[0] || '')).toUpperCase();
}

export default EditProfileScreen;
