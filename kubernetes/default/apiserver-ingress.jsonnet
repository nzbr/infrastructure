{
  apiVersion: 'networking.k8s.io/v1',
  kind: 'Ingress',
  metadata: {
    name: 'kubernetes-api',
    labels: {
      "app.kubernetes.io/name": 'kubernetes-api',
    },
    annotations: {
      'kubernetes.io/ingress.class': 'nginx',
      'nginx.ingress.kubernetes.io/backend-protocol': 'HTTPS',
    },
  },
  spec: {
    rules: [
      {
        host: 'k8s.nzbr.de',
        http: {
          paths: [
            {
              path: '/',
              pathType: 'Prefix',
              backend: {
                service: {
                  name: 'kubernetes',
                  port: {
                    number: 443,
                  },
                },
              },
            },
          ],
        },
      },
    ],
  },
}
