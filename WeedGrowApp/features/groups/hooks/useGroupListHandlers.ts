import { useCallback } from 'react';
import type { Group } from '@/firestoreModels';

export function useGroupListHandlers(handleWaterAllApi: (groupId: string) => Promise<void>, setEditGroup: (g: Group & { id: string } | null) => void, setSnackMessage: (msg: string) => void, setSnackVisible: (v: boolean) => void) {
  const handleWaterAll = useCallback(async (groupId: string) => {
    try {
      await handleWaterAllApi(groupId);
      setSnackMessage('All plants watered');
    } catch (err: any) {
      setSnackMessage((err && typeof err === 'object' && 'message' in err) ? (err as any).message : 'Failed to log');
    } finally {
      setSnackVisible(true);
    }
  }, [handleWaterAllApi, setSnackMessage, setSnackVisible]);

  const handleEditGroup = useCallback((group: Group & { id: string }) => {
    setEditGroup(group);
  }, [setEditGroup]);

  return { handleWaterAll, handleEditGroup };
}
