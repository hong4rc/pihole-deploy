const { readFileSync, writeFileSync } = require('fs');
const axios = require('axios');

const hosts = [
  'https://raw.githubusercontent.com/StevenBlack/hosts/master/hosts',
  'https://mirror1.malwaredomains.com/files/justdomains',
  'https://raw.githubusercontent.com/bigdargon/hostsVN/master/hosts',
  'https://v.firebog.net/hosts/AdguardDNS.txt',
  'https://raw.githubusercontent.com/anudeepND/blacklist/master/adservers.txt',
  'https://v.firebog.net/hosts/Easylist.txt',
  'https://pgl.yoyo.org/adservers/serverlist.php?hostformat=hosts&showintro=0&mimetype=plaintext',
  'https://raw.githubusercontent.com/FadeMind/hosts.extras/master/UncheckyAds/hosts',
  'https://raw.githubusercontent.com/jdlingyu/ad-wars/master/hosts',
  'https://v.firebog.net/hosts/Easyprivacy.txt',
  'https://v.firebog.net/hosts/Airelle-hrsk.txt',
];

const removeDups = (names) => {
  const unique = {};
  names.forEach((i) => {
    if (!unique[i]) {
      unique[i] = true;
    }
  });
  return Object.keys(unique);
};

const rg = /^(?:[\d.a-f]*[\t ])?(?<host>[^\t #]+)/;
const parse = (data) => {
  const temporary = data.split('\n');
  const host = [];
  temporary.forEach((line) => {
    const m = line.match(rg);
    if (m) {
      host.push(m.groups.host);
    }
  });
  return host.sort();
};

const parstHost = (host) => axios.get(host)
  .then((response) => {
    console.log('ok', host);
    return parse(response.data);
  });

console.time('all');
console.time('host');
Promise.all(hosts.map(parstHost))
  .then((listHost) => {
    console.timeEnd('host');

    console.time('parse');
    listHost.push(parse(readFileSync('./custom/dbl.txt', 'utf8')));

    const myHost = removeDups(listHost.flat().sort());
    console.log(myHost.length);

    writeFileSync('./custom/data.txt', myHost.join('\n'));
    console.timeEnd('parse');
    console.timeEnd('all');
  });
