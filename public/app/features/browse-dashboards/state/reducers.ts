import { PayloadAction } from '@reduxjs/toolkit';

import { DashboardViewItem, DashboardViewItemKind } from 'app/features/search/types';

import { BrowseDashboardsState } from '../types';

import { fetchChildren } from './actions';

type FetchChildrenAction = ReturnType<typeof fetchChildren.fulfilled>;

export function extraReducerFetchChildrenFulfilled(state: BrowseDashboardsState, action: FetchChildrenAction) {
  const parentUID = action.meta.arg;
  const children = action.payload;

  if (!parentUID) {
    state.rootItems = children;
    return;
  }

  state.childrenByParentUID[parentUID] = children;

  // If the parent of the items we've loaded are selected, we must select all these items also
  const parentIsSelected = state.selectedItems.folder[parentUID];
  if (parentIsSelected) {
    for (const child of children) {
      state.selectedItems[child.kind][child.uid] = true;
    }
  }
}

export function setFolderOpenState(
  state: BrowseDashboardsState,
  action: PayloadAction<{ folderUID: string; isOpen: boolean }>
) {
  const { folderUID, isOpen } = action.payload;
  state.openFolders[folderUID] = isOpen;
}

export function setItemSelectionState(
  state: BrowseDashboardsState,

  // SearchView doesn't use DashboardViewItemKind (yet), so we pick just the specific properties
  // we're interested in
  action: PayloadAction<{ item: Pick<DashboardViewItem, 'kind' | 'uid' | 'parentUID'>; isSelected: boolean }>
) {
  const { item, isSelected } = action.payload;

  function markChildren(kind: DashboardViewItemKind, uid: string) {
    state.selectedItems[kind][uid] = isSelected;

    if (kind !== 'folder') {
      return;
    }

    let children = state.childrenByParentUID[uid] ?? [];
    for (const child of children) {
      markChildren(child.kind, child.uid);
    }
  }

  markChildren(item.kind, item.uid);

  // Then we need to reconcile the parents to make them in the correct state
  // If all items in a folder are selected, then the folder itself should also be selected
  // The inverse is partially true - if a child item is selected, then all its parents
  // should be deselected

  let nextParentUID = item.parentUID;

  while (nextParentUID) {
    const parent = findItem(state.rootItems, state.childrenByParentUID, nextParentUID);

    // This case should not happen, but a find can theortically return undefined, and it
    // helps limit infinite loops
    if (!parent) {
      break;
    }

    if (isSelected) {
      // If we're selecting an item, check all ancestors and see if all their children are
      // now selected and update them appropriately
      const children = state.childrenByParentUID[parent.uid];

      const allChildrenSelected = children?.every((v) => state.selectedItems[v.kind][v.uid]) ?? false;
      state.selectedItems[parent.kind][parent.uid] = allChildrenSelected;
    } else {
      // If we're unselecting an item, unselect all ancestors (parent, grandparent, etc) also
      // so we can show a UI-only 'mixed' checkbox
      state.selectedItems[parent.kind][parent.uid] = false;
    }

    nextParentUID = parent.parentUID;
  }
}

function findItem(
  rootItems: DashboardViewItem[],
  childrenByUID: Record<string, DashboardViewItem[] | undefined>,
  uid: string
): DashboardViewItem | undefined {
  for (const item of rootItems) {
    if (item.uid === uid) {
      return item;
    }
  }

  for (const parentUID in childrenByUID) {
    const children = childrenByUID[parentUID];
    if (!children) {
      continue;
    }

    for (const child of children) {
      if (child.uid === uid) {
        return child;
      }
    }
  }

  return undefined;
}
