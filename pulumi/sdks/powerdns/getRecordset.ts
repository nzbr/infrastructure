// *** WARNING: this file was generated by pulumi-language-nodejs. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

import * as pulumi from "@pulumi/pulumi";
import * as utilities from "./utilities";

export function getRecordset(args: GetRecordsetArgs, opts?: pulumi.InvokeOptions): Promise<GetRecordsetResult> {
    opts = pulumi.mergeOptions(utilities.resourceOptsDefaults(), opts || {});
    return pulumi.runtime.invoke("powerdns:index/getRecordset:getRecordset", {
        "name": args.name,
        "serverId": args.serverId,
        "type": args.type,
        "zoneId": args.zoneId,
    }, opts, utilities.getPackage());
}

/**
 * A collection of arguments for invoking getRecordset.
 */
export interface GetRecordsetArgs {
    name: string;
    serverId: string;
    type: string;
    zoneId: string;
}

/**
 * A collection of values returned by getRecordset.
 */
export interface GetRecordsetResult {
    readonly id: string;
    readonly name: string;
    readonly records: string[];
    readonly serverId: string;
    readonly ttl: number;
    readonly type: string;
    readonly zoneId: string;
}
export function getRecordsetOutput(args: GetRecordsetOutputArgs, opts?: pulumi.InvokeOutputOptions): pulumi.Output<GetRecordsetResult> {
    opts = pulumi.mergeOptions(utilities.resourceOptsDefaults(), opts || {});
    return pulumi.runtime.invokeOutput("powerdns:index/getRecordset:getRecordset", {
        "name": args.name,
        "serverId": args.serverId,
        "type": args.type,
        "zoneId": args.zoneId,
    }, opts, utilities.getPackage());
}

/**
 * A collection of arguments for invoking getRecordset.
 */
export interface GetRecordsetOutputArgs {
    name: pulumi.Input<string>;
    serverId: pulumi.Input<string>;
    type: pulumi.Input<string>;
    zoneId: pulumi.Input<string>;
}
