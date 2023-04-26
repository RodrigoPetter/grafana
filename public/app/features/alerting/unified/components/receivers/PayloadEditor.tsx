import { css } from '@emotion/css';
import React, { useState } from 'react';

import { GrafanaTheme2 } from '@grafana/data';
import { Stack } from '@grafana/experimental';
import { Badge, Button, CodeEditor, Icon, Tooltip, useStyles2 } from '@grafana/ui';
import { TestTemplateAlert } from 'app/plugins/datasource/alertmanager/types';

import { GenerateAlertDataModal } from './form/GenerateAlertDataModal';

export const RESET_TO_DEFAULT = 'Reset to default';

export function PayloadEditor({
  payload,
  setPayload,
  defaultPayload,
  setPayloadFormatError,
  payloadFormatError,
  onPayloadError,
}: {
  payload: string;
  defaultPayload: string;
  setPayload: React.Dispatch<React.SetStateAction<string>>;
  setPayloadFormatError: (value: React.SetStateAction<string | null>) => void;
  payloadFormatError: string | null;
  onPayloadError: () => void;
}) {
  const styles = useStyles2(getStyles);
  const onReset = () => {
    setPayload(defaultPayload);
  };

  const [isEditingAlertData, setIsEditingAlertData] = useState(false);

  const onCloseEditAlertModal = () => {
    setIsEditingAlertData(false);
  };

  const onOpenEditAlertModal = () => {
    try {
      JSON.parse(payload);
      setIsEditingAlertData(true);
      setPayloadFormatError(null);
    } catch (e) {
      setPayloadFormatError(e instanceof Error ? e.message : 'Invalid JSON.');
      onPayloadError();
    }
  };
  const onAddAlertList = (alerts: TestTemplateAlert[]) => {
    onCloseEditAlertModal();
    setPayload((payload) => {
      const payloadObj = JSON.parse(payload);
      return JSON.stringify([...payloadObj, ...alerts], undefined, 2);
    });
  };

  return (
    <div className={styles.wrapper}>
      <Stack direction="column" gap={1}>
        <div className={styles.title}>
          Payload data
          <Tooltip placement="top" content={'This payload data will be sent to the preview'} theme="info">
            <Icon name="info-circle" className={styles.tooltip} size="xl" />
          </Tooltip>
        </div>

        <CodeEditor
          width={640}
          height={326}
          language={'json'}
          showLineNumbers={true}
          showMiniMap={false}
          value={payload}
          readOnly={false}
          onBlur={setPayload}
        />
        <Stack>
          <Button onClick={onReset} className={styles.button} icon="arrow-up" type="button" variant="secondary">
            {RESET_TO_DEFAULT}
          </Button>
          <Button
            onClick={onOpenEditAlertModal}
            className={styles.button}
            icon="plus-circle"
            type="button"
            variant="secondary"
          >
            Add alert data
          </Button>
          {payloadFormatError !== null && (
            <Badge
              color="orange"
              icon="exclamation-triangle"
              text={'There are some errors in payload JSON'}
              tooltip={'Fix errors in existing payload before adding more data'}
            />
          )}
        </Stack>
      </Stack>
      <GenerateAlertDataModal isOpen={isEditingAlertData} onDismiss={onCloseEditAlertModal} onAccept={onAddAlertList} />
    </div>
  );
}

const getStyles = (theme: GrafanaTheme2) => ({
  jsonEditor: css`
    width: 605px;
    height: 325px;
  `,
  button: css`
    flex: none;
    width: fit-content;
    padding-right: ${theme.spacing(1)};
  `,
  title: css`
    font-weight: ${theme.typography.fontWeightBold};
  `,
  wrapper: css`
    padding-top: ${theme.spacing(1)};
  `,
  tooltip: css`
    padding-left: ${theme.spacing(1)};
  `,
});
