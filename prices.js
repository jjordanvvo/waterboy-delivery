/* ================================================================
   prices.js — Master Price List
   Waterboy Delivery — single source of truth for all prices
   ================================================================ */

var WB_PRICES = {
  water: {
    ro5:        { name: '5-Gallon RO Water',       price: 6.99,  unit: 'per bottle' },
    alkaline5:  { name: '5-Gallon Alkaline Water', price: 7.99,  unit: 'per bottle' },
    hydrogen5:  { name: '5-Gallon Hydrogen Water', price: 9.99,  unit: 'per bottle' },
    ro3:        { name: '3-Gallon RO Water',        price: 4.99,  unit: 'per bottle' },
    jug5empty:  { name: '5-Gallon Jug (Empty)',     price: 12.99, unit: 'each' },
    jug3empty:  { name: '3-Gallon Jug (Empty)',     price: 9.99,  unit: 'each' }
  },
  bundles: {
    solo:      { name: 'Solo Bundle',      price: 21,  jugs: 2,  desc: '2×5-gal / mo' },
    family:    { name: 'Family Bundle',    price: 42,  jugs: 4,  desc: '4×5-gal / mo' },
    household: { name: 'Household Bundle', price: 57,  jugs: 6,  desc: '6×5-gal / mo' },
    office:    { name: 'Office Bundle',    price: 72,  jugs: 8,  desc: '8×5-gal / mo' },
    max:       { name: 'Max Bundle',       price: 95,  jugs: 12, desc: '12×5-gal / mo' }
  },
  alkalineBundles: {
    solo:   { name: 'Alkaline Solo',   price: 25, jugs: 2,  desc: '2×5-gal / mo' },
    family: { name: 'Alkaline Family', price: 45, jugs: 4,  desc: '4×5-gal / mo' },
    max:    { name: 'Alkaline Max',    price: 60, jugs: 12, desc: '12×5-gal / mo' }
  },
  addons: {
    lmntCan:     { name: 'LMNT Sparkling Electrolyte Can (16oz)', price: 4.99,  unit: 'per can' },
    lmntPacket:  { name: 'LMNT Zero-Sugar Electrolyte Packets',   price: 2.99,  unit: 'per packet', bulk: 39.99, bulkQty: 30 },
    zipfizz:     { name: 'Zipfizz Energy Drink Mix Combo Pack',   price: 39.99, unit: 'per 30-pack' },
    echo:        { name: 'Echo Hydrogen Prebiotic Drink Mix',      price: 4.99,  unit: 'per packet', bulk: 64.99, bulkQty: 30 }
  },
  dispensers: {
    brioBottom: { name: 'Brio Bottom-Load Dispenser', price: 279.99 },
    brioTop:    { name: 'Brio Top-Load Dispenser',    price: 129.99 }
  },
  delivery: {
    zone1: { label: 'Zone 1 (0–3mi)', price: 0,    display: 'FREE' },
    zone2: { label: 'Zone 2 (3–6mi)', price: 4.99, display: '$4.99' },
    zone3: { label: 'Zone 3 (6–9mi)', price: 9.99, display: '$9.99' }
  }
};
