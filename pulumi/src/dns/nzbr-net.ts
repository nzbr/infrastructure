import {CNAME, D, DefaultTTL, DnsProvider, SRV, TXT} from "../dnscontrol";
import {DESEC} from "../dnscontrol/desec";
import {letsencryptRecords, mailboxOrgRecords, rootRecords, serverRecords} from "./common";

D('nzbr.net', null, DnsProvider(DESEC), DefaultTTL(3600), // minimum value for desec.io
  ...serverRecords,
  ...letsencryptRecords,
  ...mailboxOrgRecords,
  TXT('@', 'keybase-site-verification=3Y4nbVx5MwKFAXkFWSDt86jukm-2KjYRMGWh4Fht63w'),
);
