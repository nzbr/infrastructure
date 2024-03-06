{
  kind: 'ClusterRoleBinding',
  apiVersion: 'rbac.authorization.k8s.io/v1',
  metadata: {
    name: 'admin',
    labels: {
      "app.kubernetes.io/name": 'kubernetes-api',
    },
  },
  subjects: [{
    kind: 'ServiceAccount',
    name: 'admin',
    namespace: 'default',
  }],
  roleRef: {
    apiGroup: 'rbac.authorization.k8s.io',
    kind: 'ClusterRole',
    name: 'cluster-admin',
  },
}
