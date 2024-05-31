{
  apiVersion: 'v1',
  kind: 'ConfigMap',
  metadata: {
    name: 'argocd-cm',
    labels: {
      'app.kubernetes.io/name': 'argocd-cm',
      'app.kubernetes.io/part-of': 'argocd',
    },
  },
  data: {
    'accounts.github-actions': 'apiKey',
    'statusbadge.enabled': 'true',
  },
}
