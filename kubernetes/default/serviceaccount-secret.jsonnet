{
  apiVersion: 'v1',
  kind: 'Secret',
  metadata: {
    name: 'admin-token',
    labels: {
      "app.kubernetes.io/name": 'kubernetes-api',
    },
    annotations: {
      'kubernetes.io/service-account.name': 'admin',
    },
  },
  type: 'kubernetes.io/service-account-token',
}
