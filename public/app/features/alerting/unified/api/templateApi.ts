import { alertingApi } from './alertingApi';

export const previewTemplateUrl = `/api/alertmanager/grafana/config/api/v1/templates/test`;

export interface TemplatePreviewResult {
  name: string;
  text: string;
}
export interface TemplatePreviewErrors {
  name?: string;
  message: string;
  kind: string;
}
export interface TemplatePreviewResponse {
  results?: TemplatePreviewResult[];
  errors?: TemplatePreviewErrors[];
}

type AnnoField = {
  key: string;
  value: string;
};
export interface AlertField {
  annotations: AnnoField[];
  labels: AnnoField[];
}

export const templatesApi = alertingApi.injectEndpoints({
  endpoints: (build) => ({
    previewTemplate: build.mutation<TemplatePreviewResponse, { template: string; alerts: AlertField[]; name: string }>({
      query: ({ template, alerts, name }) => ({
        url: previewTemplateUrl,
        data: { template: template, alerts: alerts, name: name },
        method: 'POST',
      }),
    }),
  }),
});

export const { usePreviewTemplateMutation } = templatesApi;
