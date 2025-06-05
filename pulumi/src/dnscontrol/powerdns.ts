import {Config} from "@pulumi/pulumi";
import {DNSProviderImpl, RecordType} from "./index";
import {Recordset, Zone} from "@pulumi/powerdns";

export const PowerDNS: DNSProviderImpl = (domain) => {
  // TODO: Make this overwriteable per domain if needed
  const config = new Config();
  const serverId = config.require("powerdnsServerId");

  // At least for SERVFAIL, the Zone has to be created manually first
  const zone = Zone.get(domain.name, domain.name, {
    serverId,
    name: domain.name,
  }, {
    parent: domain,
  });

  Object.keys(domain.records).forEach(type => {
    Object.keys(domain.records[type as RecordType]!).forEach(name => {
      const record = domain.records[type as RecordType]![name]!;
      const recordName = `${(name === '@') ? '' : `${name}.`}${domain.name}.`;
      const resourceName = `${type} ${recordName}`;

      let records = record.records;
      if (type === 'TXT') {
        records = records.map(record =>
          '"' +
          record
            .replace('\\', '\\\\')
            .replace('"', '\\"')
          + '"'
        );
      }

      new Recordset(resourceName, {
        serverId,
        zoneId: zone.id,
        type,
        name: recordName,
        records,
        ttl: record.ttl || domain.defaultTTL,
      }, {
        parent: zone,
        dependsOn: [zone],
      });
    });
  });
};
