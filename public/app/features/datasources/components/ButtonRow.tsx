import React from 'react';

import { selectors } from '@grafana/e2e-selectors';
import { Button } from '@grafana/ui';

export interface Props {
  exploreUrl: string;
  canSave: boolean;
  canDelete: boolean;
  onDelete: () => void;
  onSubmit: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onTest: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

export function ButtonRow({ canSave, canDelete, onDelete, onSubmit, onTest, exploreUrl }: Props) {
  return (
    <div className="gf-form-button-row">
      {canSave && (
        <Button
          type="submit"
          variant="primary"
          disabled={!canSave}
          onClick={(event) => onSubmit(event)}
          aria-label={selectors.pages.DataSource.saveAndTest}
        >
          Save &amp; test
        </Button>
      )}
      {!canSave && (
        <Button variant="primary" onClick={onTest}>
          Test
        </Button>
      )}
    </div>
  );
}
