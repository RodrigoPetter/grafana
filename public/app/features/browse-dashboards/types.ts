import { CellProps, Column } from 'react-table';

import { DashboardViewItem as DashboardViewItem, DashboardViewItemKind } from 'app/features/search/types';

export type DashboardTreeSelection = Record<DashboardViewItemKind, Record<string, boolean | undefined>>;

export interface BrowseDashboardsState {
  rootItems: DashboardViewItem[];
  childrenByParentUID: Record<string, DashboardViewItem[] | undefined>;
  selectedItems: DashboardTreeSelection;

  // Only folders can ever be open or closed, so no need to seperate this by kind
  openFolders: Record<string, boolean>;
}

export interface UIDashboardViewItem {
  kind: 'ui-empty-folder';
  uid: string;
}

type DashboardViewItemWithUIItems = DashboardViewItem | UIDashboardViewItem;

export interface DashboardsTreeItem<T extends DashboardViewItemWithUIItems = DashboardViewItemWithUIItems> {
  item: T;
  level: number;
  isOpen: boolean;
}

export const INDENT_AMOUNT_CSS_VAR = '--dashboards-tree-indentation';

export type DashboardsTreeColumn = Column<DashboardsTreeItem>;
export type DashboardsTreeCellProps = CellProps<DashboardsTreeItem, unknown> & {
  // Note: userProps for cell renderers (e.g. second argument in `cell.render('Cell', foo)` )
  // aren't typed, so we must be careful when accessing this
  isSelected?: (kind: DashboardViewItemKind, uid: string) => SelectionState;
  onItemSelectionChange?: (item: DashboardViewItem, newState: boolean) => void;
};

export enum SelectionState {
  Unselected,
  Selected,
  Mixed,
}
