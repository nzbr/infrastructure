import {CNAME, D, DefaultTTL, DnsProvider, SRV, TXT} from "../dnscontrol";
import {DESEC} from "../dnscontrol/desec";
import {letsencryptRecords, mailboxOrgRecords, serverRecords} from "./common";
import {PowerDNS} from "../dnscontrol/powerdns";

D('nzbr.net', null, DnsProvider(DESEC, PowerDNS), DefaultTTL(3600), // minimum value for desec.io
  TXT('_servfail-challenge', 'oScCbH5F4Dp8iSlNpVxYKlrYXkSAC'),
  ...serverRecords,
  ...letsencryptRecords,
  ...mailboxOrgRecords,
  TXT('@', 'keybase-site-verification=3Y4nbVx5MwKFAXkFWSDt86jukm-2KjYRMGWh4Fht63w'),
);
