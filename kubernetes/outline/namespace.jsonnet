local values = import 'values.libsonnet';

{
  apiVersion: 'v1',
  kind: 'Namespace',
  metadata: {
    name: values.namespace,
  },
}
