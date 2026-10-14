const fs = require('fs');
const path = require('path');

// ==========================================
// 1. Update PostAd.tsx
// ==========================================
const postAdPath = path.join(__dirname, '..', 'frontend', 'src', 'pages', 'PostAd.tsx');
let postAd = fs.readFileSync(postAdPath, 'utf8');

// Change default states
postAd = postAd.replace(
  "const [propertyDeposit, setPropertyDeposit] = useState('50000');",
  "const [propertyDeposit, setPropertyDeposit] = useState('');"
);
postAd = postAd.replace(
  "const [rentDeposit, setRentDeposit] = useState('5000');",
  "const [rentDeposit, setRentDeposit] = useState('');"
);

// In property section (Step 2), remove the duplicate Security Deposit input
const propertyDepositBlock = `                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Security Deposit (₹)</label>
                      <input
                        type="number"
                        value={propertyDeposit}
                        onChange={(e) => setPropertyDeposit(e.target.value)}
                        className="input-field py-2 text-sm"
                        placeholder="e.g. 50000"
                      />
                    </div>`;

const propertyPriceNotice = `                    {selectedListingType !== 'rent' && (
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Total Expected Price (₹)</label>
                        <input
                          type="number"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          className="input-field py-2 text-sm font-bold text-blue-900"
                          placeholder="e.g. 4500000"
                        />
                      </div>
                    )}`;

if (postAd.includes(propertyDepositBlock)) {
  postAd = postAd.replace(propertyDepositBlock, propertyPriceNotice);
}

// In Rental Terms (Step 2), provide Rent Amount (bound to price), Frequency, Optional Deposit, and Availability
const rentTermsTarget = `              {/* 6. Rent Mode specifics */}
              {selectedListingType === 'rent' && (
                <div className="p-5 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-amber-900">Rental Terms</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-amber-900 mb-1">Rent Frequency</label>
                      <select value={rentPeriod} onChange={(e) => setRentPeriod(e.target.value)} className="input-field py-2 text-sm">
                        <option value="Per Day">Per Day</option>
                        <option value="Per Month">Per Month</option>
                        <option value="Per Hour">Per Hour</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-amber-900 mb-1">Refundable Deposit (₹)</label>
                      <input
                        type="number"
                        value={rentDeposit}
                        onChange={(e) => setRentDeposit(e.target.value)}
                        className="input-field py-2 text-sm"
                        placeholder="5000"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-amber-900 mb-1">Availability</label>
                      <input
                        type="text"
                        value={rentAvailability}
                        onChange={(e) => setRentAvailability(e.target.value)}
                        className="input-field py-2 text-sm"
                        placeholder="Immediate / Available from..."
                      />
                    </div>
                  </div>
                </div>
              )}`;

const rentTermsReplacement = `              {/* 6. Rent Mode specifics & Single Pricing */}
              {selectedListingType === 'rent' && (
                <div className="p-5 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-amber-900">Rental Pricing & Terms</h3>
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-100/80 px-2.5 py-0.5 rounded-full">Single Rate Entry</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-amber-950 mb-1">Rent Amount (₹) *</label>
                      <input
                        type="number"
                        required
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="input-field py-2 text-sm font-black text-amber-950 bg-white"
                        placeholder="e.g. 50000"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-amber-950 mb-1">Rent Frequency</label>
                      <select value={rentPeriod} onChange={(e) => setRentPeriod(e.target.value)} className="input-field py-2 text-sm font-bold bg-white">
                        <option value="Per Day">Per Day (Daily Rent)</option>
                        <option value="Per Month">Per Month (Monthly Rent)</option>
                        <option value="Per Hour">Per Hour (Hourly Rent)</option>
                        <option value="Per Week">Per Week</option>
                        <option value="Per Year">Per Year</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-amber-950 mb-1">Security Deposit (₹) <span className="text-[10px] text-amber-700 font-normal">(Optional)</span></label>
                      <input
                        type="number"
                        value={rentDeposit}
                        onChange={(e) => setRentDeposit(e.target.value)}
                        className="input-field py-2 text-sm bg-white"
                        placeholder="0 if none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-amber-950 mb-1">Available From</label>
                      <input
                        type="text"
                        value={rentAvailability}
                        onChange={(e) => setRentAvailability(e.target.value)}
                        className="input-field py-2 text-sm bg-white"
                        placeholder="Immediate / Available from..."
                      />
                    </div>
                  </div>
                </div>
              )}`;

if (postAd.includes(rentTermsTarget)) {
  postAd = postAd.replace(rentTermsTarget, rentTermsReplacement);
}

// In Property description assembly:
postAd = postAd.replace(
  "specsSummary += `\\n• Configuration: ${propertyBhk}\\n• Area: ${propertyArea} Sq.Ft\\n• Furnishing: ${propertyFurnishing}\\n• Floor: ${propertyFloor}\\n• Security Deposit: ₹${propertyDeposit}\\n• Facing: ${propertyFacing}`;",
  "specsSummary += `\\n• Configuration: ${propertyBhk}\\n• Area: ${propertyArea} Sq.Ft\\n• Furnishing: ${propertyFurnishing}\\n• Floor: ${propertyFloor}\\n• Facing: ${propertyFacing}`;"
);

// In Rent description assembly:
const rentDescTarget = `    if (selectedListingType === 'rent') {
      tailoredAttributes.rent_period = rentPeriod;
      tailoredAttributes.rent_deposit = rentDeposit;
      tailoredAttributes.available_from = rentAvailability;
      specsSummary += \`\\n• Rent Term: \${rentPeriod}\\n• Security Deposit: ₹\${rentDeposit}\\n• Availability: \${rentAvailability}\`;
    }`;

const rentDescReplacement = `    if (selectedListingType === 'rent') {
      tailoredAttributes.rent_period = rentPeriod;
      tailoredAttributes.available_from = rentAvailability;
      specsSummary += \`\\n• Rent Rate: ₹\${Number(price || 0).toLocaleString()} (\${rentPeriod})\\n• Availability: \${rentAvailability}\`;
      if (rentDeposit && Number(rentDeposit) > 0) {
        tailoredAttributes.rent_deposit = rentDeposit;
        specsSummary += \`\\n• Security Deposit: ₹\${Number(rentDeposit).toLocaleString()}\`;
      }
    }`;

if (postAd.includes(rentDescTarget)) {
  postAd = postAd.replace(rentDescTarget, rentDescReplacement);
}

// In price_text format:
const priceTextTarget = "price_text: selectedListingType === 'free' ? 'Free' : `₹${price}`,";
const priceTextReplacement = `price_text: selectedListingType === 'free' 
          ? 'Free' 
          : selectedListingType === 'rent'
          ? \`₹\${Number(price || 0).toLocaleString()} / \${rentPeriod.replace(/^Per\\s+/i, '')}\`
          : \`₹\${Number(price || 0).toLocaleString()}\`,`;

if (postAd.includes(priceTextTarget)) {
  postAd = postAd.replace(priceTextTarget, priceTextReplacement);
}

// In Step 3 pricing input UI, make Rent pricing super clear and synced
const step3PriceTarget = `                  <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5">
                    {selectedListingType === 'free' ? 'Pricing (Free)' : selectedListingType === 'job' ? 'Offered Salary (₹)' : selectedListingType === 'rent' ? 'Rent Price (₹)' : 'Selling Price (₹) *'}
                  </label>
                  <input
                    type="number"
                    disabled={selectedListingType === 'free'}
                    value={selectedListingType === 'free' ? '0' : price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="input-field py-2.5 text-sm"
                    placeholder={selectedListingType === 'free' ? 'Free Giveaway' : 'e.g. 15000'}
                  />`;

const step3PriceReplacement = `                  <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>{selectedListingType === 'free' ? 'Pricing (Free)' : selectedListingType === 'job' ? 'Offered Salary (₹)' : selectedListingType === 'rent' ? 'Rent Rate (₹) *' : 'Selling Price (₹) *'}</span>
                    {selectedListingType === 'rent' && price && (
                      <span className="text-amber-700 font-extrabold text-[11px] normal-case bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        Configured: ₹{Number(price).toLocaleString()} / {rentPeriod.replace(/^Per\\s+/i, '')}
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    disabled={selectedListingType === 'free'}
                    value={selectedListingType === 'free' ? '0' : price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="input-field py-2.5 text-sm font-bold"
                    placeholder={selectedListingType === 'free' ? 'Free Giveaway' : selectedListingType === 'rent' ? 'e.g. 50000' : 'e.g. 15000'}
                  />`;

if (postAd.includes(step3PriceTarget)) {
  postAd = postAd.replace(step3PriceTarget, step3PriceReplacement);
}

fs.writeFileSync(postAdPath, postAd, 'utf8');
console.log('PostAd.tsx updated for unified rent pricing');

// ==========================================
// 2. Update Browse.tsx to display rent period
// ==========================================
const browsePath = path.join(__dirname, '..', 'frontend', 'src', 'pages', 'Browse.tsx');
let browse = fs.readFileSync(browsePath, 'utf8');

const browseMapTarget = `          price: item.listing_type === 'free' ? 'FREE' : \`₹\${Number(item.price || 0).toLocaleString()}\`,`;
const browseMapReplacement = `          price: item.listing_type === 'free'
            ? 'FREE'
            : item.price_text
            ? item.price_text
            : item.listing_type === 'rent'
            ? \`₹\${Number(item.price || 0).toLocaleString()} / \${(item.attributes?.rent_period || 'Month').replace(/^Per\\s+/i, '')}\`
            : \`₹\${Number(item.price || 0).toLocaleString()}\`,`;

if (browse.includes(browseMapTarget)) {
  browse = browse.replace(browseMapTarget, browseMapReplacement);
  fs.writeFileSync(browsePath, browse, 'utf8');
  console.log('Browse.tsx updated for rent price display');
}

// ==========================================
// 3. Update AdDetails.tsx to display rent period and clean specs
// ==========================================
const adDetailsPath = path.join(__dirname, '..', 'frontend', 'src', 'pages', 'AdDetails.tsx');
let adDetails = fs.readFileSync(adDetailsPath, 'utf8');

const adDetailsPriceTarget = `price: data.listing_type === 'free' ? 'FREE' : \`₹\${Number(data.price || 0).toLocaleString()}\`,`;
const adDetailsPriceReplacement = `price: data.listing_type === 'free' 
              ? 'FREE' 
              : data.price_text 
              ? data.price_text 
              : data.listing_type === 'rent'
              ? \`₹\${Number(data.price || 0).toLocaleString()} / \${(data.attributes?.rent_period || 'Month').replace(/^Per\\s+/i, '')}\`
              : \`₹\${Number(data.price || 0).toLocaleString()}\`,`;

adDetails = adDetails.replaceAll(adDetailsPriceTarget, adDetailsPriceReplacement);

const adDetailsFoundPriceTarget = `price: found.listing_type === 'free' ? 'FREE' : \`₹\${Number(found.price || 0).toLocaleString()}\`,`;
const adDetailsFoundPriceReplacement = `price: found.listing_type === 'free' 
                ? 'FREE' 
                : found.price_text 
                ? found.price_text 
                : found.listing_type === 'rent'
                ? \`₹\${Number(found.price || 0).toLocaleString()} / \${(found.attributes?.rent_period || 'Month').replace(/^Per\\s+/i, '')}\`
                : \`₹\${Number(found.price || 0).toLocaleString()}\`,`;

adDetails = adDetails.replaceAll(adDetailsFoundPriceTarget, adDetailsFoundPriceReplacement);

fs.writeFileSync(adDetailsPath, adDetails, 'utf8');
console.log('AdDetails.tsx updated for rent price display');
