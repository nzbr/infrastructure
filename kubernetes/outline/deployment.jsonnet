local values = import 'values.libsonnet';

local envFrom = [
 { secretRef: { name: "outline-env" } },
];

local env = [
  { name: "URL", value: values.url },
  { name: "PORT", value: "3000" },
  { name: "REDIS_URL", value: "redis://"+values.namespace+"-redis-master:6379" },
];

{
  apiVersion: "apps/v1",
  kind: "Deployment",
  metadata: {
    name: values.name,
    namespace: values.namespace,
  },
  spec: {
    selector: {
      matchLabels: {
        app: values.name,
      },
    },
    strategy: {
      type: "Recreate",
    },
    template: {
      metadata: {
        labels: {
          app: values.name,
        },
      },
      spec: {
        initContainers: [
          {
            name: "migrate-db",
            image: values.image,
            imagePullPolicy: "IfNotPresent",
            args: ["yarn", "db:migrate", "--env=production-ssl-disabled"],
            envFrom: envFrom,
            env: env,
          },
        ],
        containers: [
          {
            name: "outline",
            image: values.image,
            imagePullPolicy: "IfNotPresent",
            envFrom: envFrom,
            env: env,
            ports: [
              { containerPort: 3000 },
            ],
          },
        ],
      },
    },
  },
}
