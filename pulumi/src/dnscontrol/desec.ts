import {DNSProviderImpl, RecordType} from "./index";
import {Domain, Rrset} from "@pulumi/desec";
import {log} from "@pulumi/pulumi";

export const DESEC: DNSProviderImpl = (domain) => {
  const domainResource = new Domain(domain.name, {
    name: domain.name,
  }, {
    parent: domain,
  });

  Object.keys(domain.records).forEach((type) => {
    if (type === 'ALIAS') {
      log.warn('desec.io does not support ALIAS records, converting to CNAME', domain);
    }
    Object.keys(domain.records[type as RecordType]!).forEach((name) => {
      const record = domain.records[type as RecordType]![name]!;
      const rrset = `${type} ${(name !== '@') ? `${name}.` : ''}${domain.name}.`;
      new Rrset(rrset, {
        domain: domain.name,
        subname: (name === '@') ? '' : name,
        type: (type === 'ALIAS') ? 'CNAME' : type,
        records: record.records,
        ttl: record.ttl || domain.defaultTTL,
      }, {
        parent: domain,
        dependsOn: [
          domainResource
        ],
      });
    });
  });
}
