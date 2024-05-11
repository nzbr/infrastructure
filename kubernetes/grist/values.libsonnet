local name = 'grist';
local host = 'grist.nzbr.de';

{
  name: name,
  namespace: 'grist',
  labels: {
    'app.kubernetes.io/name': name,
  },
  host: host,
  url: 'https://' + host,
  image: 'gristlabs/grist:1.1.13',
  storageClass: 'kadalu.pool',
  volumeSize: '4Gi',
}
