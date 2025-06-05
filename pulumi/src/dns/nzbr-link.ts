import {A, AAAA, CNAME, D, DefaultTTL, DnsProvider, TXT} from "../dnscontrol";
import {DESEC} from "../dnscontrol/desec";
import {servers} from "./common";
import {PowerDNS} from "../dnscontrol/powerdns";

D('nzbr.link', null, DnsProvider(DESEC, PowerDNS), DefaultTTL(3600), // minimum value for desec.io
  TXT('_servfail-challenge', 'AhUx5mH4_Cg_Z81jMZzM0IS02'),
  A('@', servers.firestorm.ip4),
  AAAA('@', servers.firestorm.ip6),
  CNAME('www', 'nzbr.link.'),
  TXT('_dmarc', 'v=DMARC1; p=reject; sp=reject; adkim=s; aspf=s;'),
  TXT('*._domainkey', 'v=DKIM1; p='),
  CNAME('fc547b5ef15e141a7f33d57414e5be2c', 'verify.bing.com.'),
  TXT('@', 'v=spf1 -all'),
  TXT('@', 'google-site-verification=2aAinANYefhTzhJ_DaiKSvKaz3zw7F8_ezGLrl-dmRM'),
  TXT('@', 'keybase-site-verification=ThfcyQqLyD-Ov0VC9x7ISvtCBVDPnc_AY0SNO5Z4oK4'),
);
