{
  apiVersion: 'v1',
  kind: 'ServiceAccount',
  metadata: {
    name: 'admin',
    labels: {
      "app.kubernetes.io/name": 'kubernetes-api',
    },
  },
}
