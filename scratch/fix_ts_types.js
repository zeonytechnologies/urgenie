const fs = require('fs');
const path = require('path');

// 1. Home.tsx
const homePath = path.join(__dirname, '..', 'frontend', 'src', 'pages', 'Home.tsx');
let home = fs.readFileSync(homePath, 'utf8');
home = home.replace(`localAds.forEach((ad) =>`, `localAds.forEach((ad: any) =>`);
home = home.replace(`remoteAds.forEach((ad) =>`, `remoteAds.forEach((ad: any) =>`);
fs.writeFileSync(homePath, home, 'utf8');

// 2. AdDetails.tsx
const adDetailsPath = path.join(__dirname, '..', 'frontend', 'src', 'pages', 'AdDetails.tsx');
let adDetails = fs.readFileSync(adDetailsPath, 'utf8');
adDetails = adDetails.replace(`localAds.find((a) =>`, `localAds.find((a: any) =>`);
fs.writeFileSync(adDetailsPath, adDetails, 'utf8');

// 3. MyAds.tsx
const myAdsPath = path.join(__dirname, '..', 'frontend', 'src', 'pages', 'MyAds.tsx');
let myAds = fs.readFileSync(myAdsPath, 'utf8');
myAds = myAds.replace(`localAds = stored.filter((a) =>`, `localAds = stored.filter((a: any) =>`);
myAds = myAds.replace(`localAds.forEach((item) =>`, `localAds.forEach((item: any) =>`);
myAds = myAds.replace(`remoteAds.forEach((item) =>`, `remoteAds.forEach((item: any) =>`);
fs.writeFileSync(myAdsPath, myAds, 'utf8');

console.log('Explicit types added successfully');
