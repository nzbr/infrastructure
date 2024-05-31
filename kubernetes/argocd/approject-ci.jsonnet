{
  apiVersion: 'argoproj.io/v1alpha1',
  kind: 'AppProject',
  metadata: {
    name: "ci",
  },
  spec: {
    destinations: [{
      namespace: '*',
      server: 'https://kubernetes.default.svc',
    }],
  },
}
