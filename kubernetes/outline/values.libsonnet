local name = "outline";
local host = "wiki.nzbr.de";

{
  name: name,
  namespace: "outline",
  labels: {
    "app.kubernetes.io/name": name,
  },
  host: host,
  url: "https://"+host,
  image: "outlinewiki/outline:0.80.2",
}
