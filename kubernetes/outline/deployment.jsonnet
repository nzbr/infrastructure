local values = import 'values.libsonnet';

local envFrom = [
 { secretRef: { name: "outline-env" } },
];

local env = std.objectValuesAll(std.mapWithKey(
  function(key, value) { name: key, value: value },
  {
    "URL": values.url,
    "PORT": "3000",
    "PGSSLMODE": "disable",
    "FILE_STORAGE": "s3",
  },
));

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
        "app.kubernetes.io/name": values.name,
      },
    },
    strategy: {
      type: "Recreate",
    },
    template: {
      metadata: {
        labels: {
          "app.kubernetes.io/name": values.name,
        },
      },
      spec: {
        affinity: {
          podAffinity: {
            preferredDuringSchedulingIgnoredDuringExecution: [
              {
                weight: 100,
                podAffinityTerm: {
                  labelSelector: {
                    matchExpressions: [
                      {
                        key: "app.kubernetes.io/name",
                        operator: "In",
                        values: ["redis"],
                      },
                    ],
                  },
                  topologyKey: "kubernetes.io/hostname",
                },
              },
            ],
          },
        },
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
