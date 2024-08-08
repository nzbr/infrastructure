export const servers: { [key: string]: { ip4: string; ip6: string } } = {
    avalanche: {
        ip4: '202.61.247.0',
        ip6: '2a03:4000:53:7a::',
    },
    storm: {
        ip4: '45.9.63.165',
        ip6: '2a03:4000:45:510::',
    },
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
