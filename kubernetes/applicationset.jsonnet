local repoURL = 'https://github.com/nzbr/infrastructure.git';
local repoPath = 'kubernetes';
local revision = 'main';

{
  apiVersion: 'argoproj.io/v1alpha1',
  kind: 'ApplicationSet',
  metadata: {
    name: 'apps',
    namespace: 'argocd',
  },
  spec: {
    goTemplate: true,
    generators: [
      {
        git: {
          repoURL: repoURL,
          revision: revision,
          directories: [
            { path: repoPath + '/*' },
            { path: repoPath + '/*/*' },
          ],
        },
      },
    ],
    template: {
      metadata: {
        name: '{{ if not (eq (index .path.segments 1) .path.basename) }}{{ index .path.segments 1 }}-{{ end }}{{ .path.basename }}',
        finalizers: ['resources-finalizer.argocd.argoproj.io'],
      },
      spec: {
        destination: {
          namespace: '{{index .path.segments 1}}',
          server: 'https://kubernetes.default.svc',
        },
        source: {
          path: '{{.path.path}}',
          repoURL: repoURL,
          targetRevision: revision,
        },
        project: 'default',
        syncPolicy: {
          automated: {
            prune: true,
            selfHeal: true,
          },
        },
      },
    },
  },
}
