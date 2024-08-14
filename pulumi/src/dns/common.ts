import {A, AAAA, CAA_BUILDER, CNAME, MX, SRV, TXT} from "../dnscontrol";

export const servers: { [key: string]: { ip4: string; ip6: string } } = {
  firestorm: {
    ip4: '46.38.250.20',
    ip6: '2a03:4000:b:120::1',
  }
};

export const main: typeof servers = {
  firestorm: servers.firestorm,
}

export const ip4 = Object.keys(main)
  .map((k) => main[k].ip4)
  .filter((x?: string) => !!x);
export const ip6 = Object.keys(main)
  .map((k) => main[k].ip6)
  .filter((x?: string) => !!x);

export const rootRecords = [
  ...ip4.map((ip) => A('@', ip)),
  ...ip6.map((ip) => AAAA('@', ip)),
];

export const serverRecords = [
  ...Object.keys(servers).map((srv) => A(srv, servers[srv].ip4)),
  ...Object.keys(servers).map((srv) => AAAA(srv, servers[srv].ip6)),
];

export const mailboxOrgRecords = [
  CNAME('autoconfig', 'mailbox.org.'),
  MX('@', 10, 'mxext1.mailbox.org.'),
  MX('@', 10, 'mxext2.mailbox.org.'),
  MX('@', 20, 'mxext3.mailbox.org.'),
  SRV('_autodiscover._tcp', 0, 0, 443, 'mailbox.org.'),
  TXT('@', 'v=spf1 include:mailbox.org ~all'),
  CNAME('mbo0001._domainkey', 'mbo0001._domainkey.mailbox.org.'),
  CNAME('mbo0002._domainkey', 'mbo0002._domainkey.mailbox.org.'),
  CNAME('mbo0003._domainkey', 'mbo0003._domainkey.mailbox.org.'),
  CNAME('mbo0004._domainkey', 'mbo0004._domainkey.mailbox.org.'),
  TXT('_dmarc', '"v=DMARC1;p=none;ruf=mailto:postmaster@nzbr.net"'),
]

export const letsencryptRecords = [
  CAA_BUILDER({
    iodef: 'mailto:caa@nzbr.de',
    iodef_critical: true,
    issue: ['letsencrypt.org'],
    issue_critical: true,
    issuewild: ['letsencrypt.org'],
    issuewild_critical: true
  })
]
