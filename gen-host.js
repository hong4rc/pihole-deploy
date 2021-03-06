const { readFileSync, writeFileSync } = require('fs');
const axios = require('axios');

const hosts = [
  // default
  'https://raw.githubusercontent.com/StevenBlack/hosts/master/hosts',
  'https://sysctl.org/cameleon/hosts',
  'https://s3.amazonaws.com/lists.disconnect.me/simple_tracking.txt',
  'https://s3.amazonaws.com/lists.disconnect.me/simple_ad.txt',

  // Suspicious
  'https://raw.githubusercontent.com/PolishFiltersTeam/KADhosts/master/KADhosts.txt',
  'https://raw.githubusercontent.com/FadeMind/hosts.extras/master/add.Spam/hosts',
  'https://v.firebog.net/hosts/static/w3kbl.txt',

  // Advertising
  'https://adaway.org/hosts.txt',
  'https://v.firebog.net/hosts/AdguardDNS.txt',
  'https://v.firebog.net/hosts/Admiral.txt',
  'https://raw.githubusercontent.com/anudeepND/blacklist/master/adservers.txt',
  'https://s3.amazonaws.com/lists.disconnect.me/simple_ad.txt',
  'https://v.firebog.net/hosts/Easylist.txt',
  'https://pgl.yoyo.org/adservers/serverlist.php?hostformat=hosts&showintro=0&mimetype=plaintext',
  'https://raw.githubusercontent.com/FadeMind/hosts.extras/master/UncheckyAds/hosts',
  'https://raw.githubusercontent.com/bigdargon/hostsVN/master/hosts',
  // Malicious
  'https://raw.githubusercontent.com/DandelionSprout/adfilt/master/Alternate%20versions%20Anti-Malware%20List/AntiMalwareHosts.txt',
  'https://osint.digitalside.it/Threat-Intel/lists/latestdomains.txt',
  'https://s3.amazonaws.com/lists.disconnect.me/simple_malvertising.txt',
  'https://v.firebog.net/hosts/Prigent-Crypto.txt',
  'https://bitbucket.org/ethanr/dns-blacklists/raw/8575c9f96e5b4a1308f2f12394abd86d0927a4a0/bad_lists/Mandiant_APT1_Report_Appendix_D.txt',
  'https://phishing.army/download/phishing_army_blocklist_extended.txt',
  'https://gitlab.com/quidsup/notrack-blocklists/raw/master/notrack-malware.txt',
  'https://v.firebog.net/hosts/Shalla-mal.txt',
  'https://raw.githubusercontent.com/Spam404/lists/master/main-blacklist.txt',
  'https://raw.githubusercontent.com/FadeMind/hosts.extras/master/add.Risk/hosts',
  'https://urlhaus.abuse.ch/downloads/hostfile/',

  // Tracking & Telemetry
  'https://v.firebog.net/hosts/Easyprivacy.txt',
  'https://v.firebog.net/hosts/Prigent-Ads.txt',
  'https://raw.githubusercontent.com/FadeMind/hosts.extras/master/add.2o7Net/hosts',
  'https://raw.githubusercontent.com/crazy-max/WindowsSpyBlocker/master/data/hosts/spy.txt',
  'https://hostfiles.frogeye.fr/firstparty-trackers-hosts.txt',
  'https://raw.githubusercontent.com/Kees1958/W3C_annual_most_used_survey_blocklist/master/TOP_EU_US_Ads_Trackers_HOST',
];

const removeDuplicate = (names) => {
  const unique = {};
  names.forEach((index) => {
    if (!unique[index]) {
      unique[index] = true;
    }
  });
  return Object.keys(unique);
};

const rgHost = /^(?:[\d.a-f]*[\t ])?(?<host>[^\t\r #]+)/;
const parse = (data) => {
  const temporary = data.split('\n');
  const host = [];
  temporary.forEach((line) => {
    const m = line.match(rgHost);
    if (m) {
      host.push(m.groups.host);
    }
  });
  return host.sort();
};

console.time('all');
console.time('host');
Promise.all(
  hosts.map((host) => axios.get(host)
    .then((response) => {
      console.log('ok', host);
      return parse(response.data);
    }, () => {
      console.log('error', host);
    })),
)
  .then((listHost) => {
    console.timeEnd('host');

    console.time('parse');
    listHost.push(parse(readFileSync('./custom/dbl.txt', 'utf8')));

    const myHost = removeDuplicate(listHost.flat().sort());
    console.log(myHost.length);

    writeFileSync('./custom/host.txt', myHost.join('\n'));
    console.timeEnd('parse');
    console.timeEnd('all');
  });
