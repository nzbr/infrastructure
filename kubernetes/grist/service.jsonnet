local values = import 'values.libsonnet';

{
  apiVersion: 'v1',
  kind: 'Service',
  metadata: {
    name: values.name,
    namespace: values.namespace,
    labels: values.labels,
  },
  spec: {
    selector: values.labels,
    type: 'ClusterIP',
    ports: [
      {
        name: 'http',
        port: 80,
        targetPort: 'http',
      },
    ],
  },
}
