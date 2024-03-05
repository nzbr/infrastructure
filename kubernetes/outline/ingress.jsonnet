local values = import 'values.libsonnet';

{
  apiVersion: 'networking.k8s.io/v1',
  kind: 'Ingress',
  metadata: {
    name: values.name,
    namespace: values.namespace,
    labels: values.labels,
    annotations: {
      'kubernetes.io/ingress.class': 'nginx',
    },
  },
  spec: {
    rules: [
      {
        host: values.host,
        http: {
          paths: [
            {
              path: '/',
              pathType: 'Prefix',
              backend: {
                service: {
                  name: values.name,
                  port: {
                    name: 'http',
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
