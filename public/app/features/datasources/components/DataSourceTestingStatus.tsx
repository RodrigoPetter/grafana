import React from 'react';

import { selectors as e2eSelectors } from '@grafana/e2e-selectors';
import { TestingStatus } from '@grafana/runtime';
import { AlertVariant } from '@grafana/ui';

import { DataSourceConfigAlert } from './DataSourceConfigAlert';

export type Props = {
  testingStatus?: TestingStatus;
};

export function DataSourceTestingStatus({ testingStatus }: Props) {
  const severity = testingStatus?.status ? testingStatus?.status as AlertVariant : 'error';

  const message = testingStatus?.message;
  const detailsMessage = testingStatus?.details?.message;
  const detailsVerboseMessage = testingStatus?.details?.verboseMessage;

  if (message) {
    return (
      <div className="gf-form-group p-t-2">
        <DataSourceConfigAlert
          severity={severity}
          title={message}
          aria-label={e2eSelectors.pages.DataSource.alert}
        >
          {testingStatus?.details && (
            <>
              {detailsMessage}
              {detailsVerboseMessage ? (
                <details style={{ whiteSpace: 'pre-wrap' }}>{String(detailsVerboseMessage)}</details>
              ) : null}
            </>
          )}
        </DataSourceConfigAlert>
      </div>
    );
  }

  return null;
}
