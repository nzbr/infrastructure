{
  apiVersion: 'v1',
  kind: 'ConfigMap',
  metadata: {
    name: 'argocd-rbac-cm',
    labels: {
      'app.kubernetes.io/name': 'argocd-rbac-cm',
      'app.kubernetes.io/part-of': 'argocd',
    },
  },
  data: {
    'policy.default': 'role:readonly',
    'policy.csv': |||
      p, github-actions, applications, *, ci/*, allow
    |||,
  },
}
