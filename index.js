#!/usr/bin/env node

import axios from "axios";

const DOMAIN = "https://stage.firefoxmonitor.nonprod.cloudops.mozgcp.net";
const BREACH_URL = new URL("/hibp/breaches", "https://monitor.firefox.com").href;
const LOGO_PREFIX = new URL("/images/logo_cache/", DOMAIN).href;

let missingLogos = [];

const breaches = await getBreaches();
const domainBreaches = breaches.filter(breach => breach.Domain !== "");
console.log(domainBreaches.length, "of", breaches.length, "have a Domain");

for (const breach of domainBreaches) {
  await fetchLogo(breach.Domain);
}

console.error("missing:", missingLogos.length);
missingLogos
  .forEach(e => console.error(e.logoUrl));

async function fetchLogo(domain) {
  const logoUrl = new URL(`${domain}.ico`, LOGO_PREFIX);
  try {
    const res = await axios.get(logoUrl);
    if (res.data.includes("We’re sorry, the page you’re looking for no longer exists.")) {
      const e = new Error(`Unable to find logo for ${domain}`);
      e.domain = domain;
      e.logoUrl = logoUrl.href;
      throw e;
    }
  } catch (err) {
    missingLogos.push(err);
    process.exitCode = 1;
  }
}

async function getBreaches() {
  const res = await axios.get(BREACH_URL);
  return res.data;
}
