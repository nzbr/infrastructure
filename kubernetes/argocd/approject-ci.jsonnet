{
  apiVersion: 'argoproj.io/v1alpha1',
  kind: 'AppProject',
  metadata: {
    name: "ci",
  },
  spec: {
    clusterResourceWhitelist: [
      { group: "*", kind: "*", }
    ],
    destinations: [{
      namespace: '*',
      server: 'https://kubernetes.default.svc',
    }],
    sourceRepos: [
      "*"
    ],
  },
}
