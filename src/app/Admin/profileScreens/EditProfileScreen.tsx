import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '@/_components/common/ScreenHeader';
import Avatar from '@/_components/common/Avatar';
import FormField from '@/_components/common/FormField';
import PrimaryButton from '@/_components/common/PrimaryButton';
import { colors } from '@/constants/colors';

interface EditProfileScreenProps {
  initials: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  organization: string;
  onBackPress?: () => void;
  onEditAvatarPress?: () => void;
  onFirstNameChange?: (text: string) => void;
  onLastNameChange?: (text: string) => void;
  onEmailChange?: (text: string) => void;
  onSavePress?: () => void;
}

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({
  initials,
  firstName,
  lastName,
  email,
  role,
  organization,
  onBackPress,
  onEditAvatarPress,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  onSavePress,
}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Edit Profile" onBackPress={onBackPress} />

      <ScrollView contentContainerStyle={styles.content}>
        <Avatar
          initials={initials}
          size={90}
          variant="solid"
          editable
          onEditPress={onEditAvatarPress}
        />

        <FormField
          label="First name"
          value={firstName}
          onChangeText={onFirstNameChange}
          style={styles.fieldSpacing}
        />
        <FormField label="Last name" value={lastName} onChangeText={onLastNameChange} />
        <FormField label="Email" value={email} onChangeText={onEmailChange} />
        <FormField label="Role" value={role} disabled />
        <FormField label="Organization" value={organization} disabled />

        <PrimaryButton label="Save" onPress={onSavePress} style={styles.saveButton} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
  fieldSpacing: {
    marginTop: 24,
  },
  saveButton: {
    marginTop: 8,
  },
});

export default EditProfileScreen;
