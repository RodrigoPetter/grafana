import { createSelector } from 'reselect';

import { DashboardViewItem } from 'app/features/search/types';
import { useSelector, StoreState } from 'app/types';

import { DashboardsTreeItem, DashboardTreeSelection } from '../types';

const flatTreeSelector = createSelector(
  (wholeState: StoreState) => wholeState.browseDashboards.rootItems,
  (wholeState: StoreState) => wholeState.browseDashboards.childrenByParentUID,
  (wholeState: StoreState) => wholeState.browseDashboards.openFolders,
  (wholeState: StoreState, rootFolderUID: string | undefined) => rootFolderUID,
  (rootItems, childrenByParentUID, openFolders, folderUID) => {
    return createFlatTree(folderUID, rootItems, childrenByParentUID, openFolders);
  }
);

const hasSelectionSelector = createSelector(
  (wholeState: StoreState) => wholeState.browseDashboards.selectedItems,
  (selectedItems) => {
    return Object.values(selectedItems).some((selectedItem) =>
      Object.values(selectedItem).some((isSelected) => isSelected)
    );
  }
);

const selectedItemsForActionsSelector = createSelector(
  (wholeState: StoreState) => wholeState.browseDashboards.selectedItems,
  (wholeState: StoreState) => wholeState.browseDashboards.childrenByParentUID,
  (selectedItems, childrenByParentUID) => {
    return getSelectedItemsForActions(selectedItems, childrenByParentUID);
  }
);

export function useFlatTreeState(folderUID: string | undefined) {
  return useSelector((state) => flatTreeSelector(state, folderUID));
}

export function useHasSelection() {
  return useSelector((state) => hasSelectionSelector(state));
}

export function useCheckboxSelectionState() {
  return useSelector((wholeState: StoreState) => wholeState.browseDashboards.selectedItems);
}

export function useActionSelectionState() {
  return useSelector((state) => selectedItemsForActionsSelector(state));
}

/**
 * Creates a list of items, with level indicating it's 'nested' in the tree structure
 *
 * @param folderUID The UID of the folder being viewed, or undefined if at root Browse Dashboards page
 * @param rootItems Array of loaded items at the root level (without a parent). If viewing a folder, we expect this to be empty and unused
 * @param childrenByUID Arrays of children keyed by their parent UID
 * @param openFolders Object of UID to whether that item is expanded or not
 * @param level level of item in the tree. Only to be specified when called recursively.
 */
function createFlatTree(
  folderUID: string | undefined,
  rootItems: DashboardViewItem[],
  childrenByUID: Record<string, DashboardViewItem[] | undefined>,
  openFolders: Record<string, boolean>,
  level = 0
): DashboardsTreeItem[] {
  function mapItem(item: DashboardViewItem, parentUID: string | undefined, level: number): DashboardsTreeItem[] {
    const mappedChildren = createFlatTree(item.uid, rootItems, childrenByUID, openFolders, level + 1);

    const isOpen = Boolean(openFolders[item.uid]);
    const emptyFolder = childrenByUID[item.uid]?.length === 0;
    if (isOpen && emptyFolder) {
      mappedChildren.push({
        isOpen: false,
        level: level + 1,
        item: { kind: 'ui-empty-folder', uid: item.uid + '-empty-folder' },
      });
    }

    const thisItem = {
      item,
      parentUID,
      level,
      isOpen,
    };

    return [thisItem, ...mappedChildren];
  }

  const isOpen = (folderUID && openFolders[folderUID]) || level === 0;

  const items = folderUID
    ? (isOpen && childrenByUID[folderUID]) || [] // keep seperate lines
    : rootItems;

  return items.flatMap((item) => mapItem(item, folderUID, level));
}

/**
 * Returns a DashboardTreeSelection but unselects any selected folder's children.
 * This is useful when making backend requests to move or delete items.
 * In this case, we only need to move/delete the parent folder and it will cascade to the children.
 * @param selectedItemsState Overall selection state
 * @param childrenByParentUID Arrays of children keyed by their parent UID
 */
function getSelectedItemsForActions(
  selectedItemsState: DashboardTreeSelection,
  childrenByParentUID: Record<string, DashboardViewItem[] | undefined>
): Omit<DashboardTreeSelection, 'panel' | '$all'> {
  // Take a copy of the selected items to work with
  // We don't care about panels here, only dashboards and folders can be moved or deleted
  const result = {
    dashboard: { ...selectedItemsState.dashboard },
    folder: { ...selectedItemsState.folder },
  };

  // Loop over selected folders in the input
  for (const folderUID of Object.keys(selectedItemsState.folder)) {
    const isSelected = selectedItemsState.folder[folderUID];
    if (isSelected) {
      // Unselect any children in the output
      const children = childrenByParentUID[folderUID];
      if (children) {
        for (const child of children) {
          if (child.kind === 'dashboard') {
            result.dashboard[child.uid] = false;
          }
          if (child.kind === 'folder') {
            result.folder[child.uid] = false;
          }
        }
      }
    }
  }

  return result;
}
