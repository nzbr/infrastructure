{
  apiVersion: "v1",
  kind: "ConfigMap",
  metadata: {
    name: "argocd-cmd-params-cm",
    namespace: "argocd",
    labels: {
      "app.kubernetes.io/name": "argocd-cmd-params-cm",
      "app.kubernetes.io/part-of": "argocd",
    },
  },
  data: {
    "reposerver.enable.git.submodule": "false",
  },
}
