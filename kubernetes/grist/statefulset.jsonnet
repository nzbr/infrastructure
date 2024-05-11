local values = import 'values.libsonnet';

local certMountPath = '/certs';
local bindingURL = 'https://sso.nzbr.de/realms/master/protocol/saml';

local envFrom = [
  { secretRef: { name: values.name + '-env' } },
];

local env = std.objectValuesAll(std.mapWithKey(
  function(k, v) {
    name: k,
    value: v,
  },
  {
    DEBUG: '1',
    GRIST_SANDBOX_FLAVOR: 'gvisor',
    APP_HOME_URL: values.url,
    // GRIST_FORCE_LOGIN: 'true',
    GRIST_SAML_SP_HOST: values.url,
    GRIST_SAML_IDP_LOGIN: bindingURL,
    GRIST_SAML_IDP_LOGOUT: bindingURL,
    GRIST_SAML_IDP_UNENCRYPTED: '1',
    GRIST_SAML_SP_KEY: certMountPath + '/tls.key',
    GRIST_SAML_SP_CERT: certMountPath + '/tls.crt',
    GRIST_SAML_IDP_CERTS: certMountPath + '/idp.crt',
  },
));

{
  apiVersion: 'apps/v1',
  kind: 'StatefulSet',
  metadata: {
    name: values.name,
    namespace: values.namespace,
  },
  spec: {
    selector: {
      matchLabels: values.labels,
    },
    serviceName: values.name,
    replicas: 1,
    template: {
      metadata: {
        labels: values.labels,
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
                        key: 'app.kubernetes.io/name',
                        operator: 'In',
                        values: ['valkey'],
                      },
                    ],
                  },
                  topologyKey: 'kubernetes.io/hostname',
                },
              },
            ],
          },
        },
        containers: [
          {
            name: 'grist',
            image: values.image,
            imagePullPolicy: 'IfNotPresent',
            envFrom: envFrom,
            env: env,
            ports: [
              {
                name: 'http',
                containerPort: 8484,
              },
            ],
            volumeMounts: [
              {
                name: 'persist',
                mountPath: '/persist',
              },
              {
                name: 'saml-cert',
                mountPath: certMountPath,
              },
            ],
            securityContext: {
              capabilities: {
                add: ['SYS_PTRACE'],
              },
            },
          },
        ],
        volumes: [
          {
            name: 'saml-cert',
            secret: {
              secretName: values.name + '-saml-cert',
            },
          },
        ],
      },
    },
    volumeClaimTemplates: [
      {
        metadata: {
          name: 'persist',
        },
        spec: {
          storageClassName: values.storageClass,
          accessModes: ['ReadWriteOnce'],
          resources: {
            requests: {
              storage: values.volumeSize,
            },
          },
        },
      },
    ],
  },
}
