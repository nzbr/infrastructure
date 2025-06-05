import {CNAME, D, DefaultTTL, DnsProvider, SRV, TXT} from "../dnscontrol";
import {DESEC} from "../dnscontrol/desec";
import {letsencryptRecords, mailboxOrgRecords, rootRecords, serverRecords} from "./common";
import {PowerDNS} from "../dnscontrol/powerdns";

D('nzbr.de', null, DnsProvider(DESEC, PowerDNS), DefaultTTL(3600), // minimum value for desec.io
  TXT('_servfail-challenge', 'lqKJ5Zd042syIoLmSFerSdypk'),
  ...rootRecords,
  ...serverRecords,
  ...letsencryptRecords,
  ...mailboxOrgRecords,
  CNAME('*', 'nzbr.de.'),
  CNAME('pages', 'nzbr.de.'),
  CNAME('*.pages', 'nzbr.de.'),
  SRV('_matrix._tcp', 10, 0, 8448, 'nzbr.de.'),
  TXT('_atproto', 'did=did:plc:y5mspbnzjs43jp6awaienvgq'),
  TXT('@', 'keybase-site-verification=IHbqhzQ-aIeUKJe62gOi-TWUd03XI9gGbe5wDLSRYsQ'),
  TXT('@', 'google-site-verification=by8RxWHKo7pjLplm89eHT5u4QkVW23MibKc9wXpOODA')
);
