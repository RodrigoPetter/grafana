import { AnyAction } from '@reduxjs/toolkit';
import React from 'react';

import {
  DataSourcePluginContextProvider,
  DataSourcePluginMeta,
  DataSourceSettings as DataSourceSettingsType,
} from '@grafana/data';
import { getDataSourceSrv } from '@grafana/runtime';
import PageLoader from 'app/core/components/PageLoader/PageLoader';
import { DataSourceSettingsState, useDispatch } from 'app/types';

import {
  dataSourceLoaded,
  useDataSource,
  useDataSourceExploreUrl,
  useDataSourceMeta,
  useDataSourceRights,
  useDataSourceSettings,
  useDeleteLoadedDataSource,
  useInitDataSourceSettings,
  useTestDataSource,
  useUpdateDatasource,
} from '../state';
import { DataSourceRights } from '../types';

import { ButtonRow } from './ButtonRow';
import { CloudInfoBox } from './CloudInfoBox';
import { DataSourceLoadError } from './DataSourceLoadError';
import { DataSourceMissingRightsMessage } from './DataSourceMissingRightsMessage';
import { DataSourcePluginConfigPage } from './DataSourcePluginConfigPage';
import { DataSourcePluginSettings } from './DataSourcePluginSettings';
import { DataSourcePluginState } from './DataSourcePluginState';
import { DataSourceReadOnlyMessage } from './DataSourceReadOnlyMessage';
import { DataSourceTestingStatus } from './DataSourceTestingStatus';

export type Props = {
  // The ID of the data source
  uid: string;
  // The ID of the custom datasource setting page
  pageId?: string | null;
};

export function EditDataSource({ uid, pageId }: Props) {
  useInitDataSourceSettings(uid);

  const dispatch = useDispatch();
  const dataSource = useDataSource(uid);
  const dataSourceMeta = useDataSourceMeta(dataSource.type);
  const dataSourceSettings = useDataSourceSettings();
  const dataSourceRights = useDataSourceRights(uid);
  const exploreUrl = useDataSourceExploreUrl(uid);
  const onDelete = useDeleteLoadedDataSource();
  const onTest = useTestDataSource(uid);
  const onUpdate = useUpdateDatasource();
  const onOptionsChange = (ds: DataSourceSettingsType) => dispatch(dataSourceLoaded(ds));

  return (
    <EditDataSourceView
      pageId={pageId}
      dataSource={dataSource}
      dataSourceMeta={dataSourceMeta}
      dataSourceSettings={dataSourceSettings}
      dataSourceRights={dataSourceRights}
      exploreUrl={exploreUrl}
      onDelete={onDelete}
      onOptionsChange={onOptionsChange}
      onTest={onTest}
      onUpdate={onUpdate}
    />
  );
}

export type ViewProps = {
  pageId?: string | null;
  dataSource: DataSourceSettingsType;
  dataSourceMeta: DataSourcePluginMeta;
  dataSourceSettings: DataSourceSettingsState;
  dataSourceRights: DataSourceRights;
  exploreUrl: string;
  onDelete: () => void;
  onOptionsChange: (dataSource: DataSourceSettingsType) => AnyAction;
  onTest: () => void;
  onUpdate: (dataSource: DataSourceSettingsType) => Promise<DataSourceSettingsType>;
};

export function EditDataSourceView({
  pageId,
  dataSource,
  dataSourceMeta,
  dataSourceSettings,
  dataSourceRights,
  exploreUrl,
  onDelete,
  onOptionsChange,
  onTest,
  onUpdate,
}: ViewProps) {
  const { plugin, loadError, testingStatus, loading } = dataSourceSettings;
  const { readOnly, hasWriteRights } = dataSourceRights;
  const hasDataSource = dataSource.id > 0;

  const dsi = getDataSourceSrv()?.getInstanceSettings(dataSource.uid);

  const onSubmit = async (e: React.MouseEvent<HTMLButtonElement> | React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onUpdate({ ...dataSource });

    onTest();
  };

  if (loadError) {
    return <DataSourceLoadError dataSourceRights={dataSourceRights} onDelete={onDelete} />;
  }

  if (loading) {
    return <PageLoader />;
  }

  // TODO - is this needed?
  if (!hasDataSource || !dsi) {
    return null;
  }

  if (pageId) {
    return (
      <DataSourcePluginContextProvider instanceSettings={dsi}>
        <DataSourcePluginConfigPage pageId={pageId} plugin={plugin} />
      </DataSourcePluginContextProvider>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      {!hasWriteRights && <DataSourceMissingRightsMessage />}
      {readOnly && <DataSourceReadOnlyMessage />}
      {dataSourceMeta.state && <DataSourcePluginState state={dataSourceMeta.state} />}

      <CloudInfoBox dataSource={dataSource} />

      {plugin && (
        <DataSourcePluginContextProvider instanceSettings={dsi}>
          <DataSourcePluginSettings
            plugin={plugin}
            dataSource={dataSource}
            dataSourceMeta={dataSourceMeta}
            onModelChange={onOptionsChange}
          />
        </DataSourcePluginContextProvider>
      )}

      <DataSourceTestingStatus testingStatus={testingStatus} />

      <ButtonRow onSubmit={onSubmit} onTest={onTest} exploreUrl={exploreUrl} canSave={!readOnly && hasWriteRights} />
    </form>
  );
}
