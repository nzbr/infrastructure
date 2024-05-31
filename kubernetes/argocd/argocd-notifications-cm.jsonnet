local argocdUrl = 'https://argocd.nzbr.de';
local appHealth = '{{ if and (eq .app.status.sync.status "Healthy") (eq .app.status.health.status "Healthy") }}success{{ else if or (eq .app.status.sync.status "Degraded") (eq .app.status.health.status "Degraded") }}failure{{ else }}pending{{ end }}';

{
  apiVersion: 'v1',
  kind: 'ConfigMap',
  metadata: {
    name: 'argocd-notifications-cm',
  },
  data: {
    'service.github': std.toString({
      appID: '910267',
      installationID: '51398439',
      privateKey: '$github-privateKey',
    }),
    'template.github': std.toString({
      github: {
        repoURLPath: '{{.app.spec.source.repoURL}}',
        revisionPath: '{{.app.status.operationState.syncResult.revision}}',
        status: {
          state: appHealth,
          label: 'ArgoCD/{{.app.metadata.name}}',
          targetURL: argocdUrl + '/applications/{{.app.metadata.name}}?operation=true',
        },
        deployment: {
          state: appHealth,
          environment: '{{.app.spec.source.targetRevision}}',
          logURL: argocdUrl + '/applications/{{.app.metadata.name}}?operation=true',
          requiredContexts: [],
          autoMerge: true,
          transientEnvironment: false,
          reference: '{{.app.spec.source.targetRevision}}',
        },
      },
    }),
    'trigger.on-status-change': std.toString(
      std.flatMap(
        function (status) [
          {
            send: ['github'],
            when: "app.status.sync.status in ['"+status+"']",
          },
          {
            send: ['github'],
            when: "app.status.health.status in ['"+status+"']",
          }
        ],
        ['Healthy', 'Progressing', 'Degraded']
      )
    ),
  },
}
