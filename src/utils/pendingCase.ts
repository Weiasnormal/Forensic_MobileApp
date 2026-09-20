import type { SavedCase } from '../store/caseStore';

/**
 * A saved case counts as pending when it is still processing, or when its
 * result is ready but the analyst has not opened it yet.
 * Drafts live outside `cases`, so they are not covered here.
 */
export function isPendingCase(item: SavedCase) {
  return item.workflowStatus === 'Processing' || !item.resultViewed;
}