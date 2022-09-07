export const all: { [key: string]: { ip4: string; ip6: string } } = {
    avalanche: {
        ip4: '202.61.247.0',
        ip6: '2a03:4000:45:510::',
    },
    storm: {
        ip4: '45.9.63.165',
        ip6: '2a03:4000:53:7a::',
    },
};

export const ip4 = Object.keys(all)
    .map((k) => all[k].ip4)
    .filter((x?: string) => !!x);
export const ip6 = Object.keys(all)
    .map((k) => all[k].ip6)
    .filter((x?: string) => !!x);
