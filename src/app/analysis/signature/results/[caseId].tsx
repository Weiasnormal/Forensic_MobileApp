import { SignatureResultsScreen } from '@/_components/modals/signature_analysis';
import { useCaseStore } from '@/store/caseStore';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';

export default function CaseResultByIdRoute() {
  const params = useLocalSearchParams<{ caseId?: string }>();
  const setActive = useCaseStore((s) => s.setActiveSignatureCaseId);

  useEffect(() => {
    if (params.caseId) {
      setActive(params.caseId);
    }

    return () => {
      setActive(null);
    };
  }, [params.caseId, setActive]);

  return <SignatureResultsScreen />;
}
