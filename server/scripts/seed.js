// Dev-only: inserts the 10 sample companies from the prototype. Login: seedN@demo.test / demo12345
const bcrypt = require('bcryptjs');
const pool = require('../src/db');
const { words } = require('../src/matching');

const P = id => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=900`;
const companies = [
  ['TechHub Kenya','Products','Nairobi',64000,4.9,P(11026522),'Laptop and office technology provider for schools, SMEs and remote workers.','laptop computer university programming office'],
  ['Laptop World','Products','Nairobi',59000,4.7,P(19012034),'Refurbished business laptops and accessories for professional buyers.','laptop business device computer workstation'],
  ['Digital Store','Products','Mombasa',48000,4.5,P(16770313),'Fast-moving consumer electronics and fast delivery for urban orders.','laptop tech electronics delivery mobile'],
  ['BuildPro Kenya','Custom Work','Kisumu',120000,4.8,P(3760067),'Custom construction, fabrication and project work for commercial buyers.','custom furniture construction design build'],
  ['PrimeCare Services','Services','Nairobi',25000,4.6,P(3184338),'Repair and maintenance services for homes, offices and business equipment.','service repair maintenance support technical'],
  ['GreenLeaf Supply','Business','Nakuru',150000,4.4,P(3184292),'Procurement and wholesale supply for business buyers and institutions.','procurement wholesale bulk office supplier'],
  ['Kingdom Logistics','Business','Nairobi',90000,4.7,P(4481254),'Logistics and distribution services for time-sensitive business deliveries.','delivery transport supply business fulfillment'],
  ['Studio One','Services','Nairobi',35000,4.9,P(196644),'Creative design and digital marketing services for brands and growing companies.','design creative marketing branding graphics'],
  ['UrbanFrame','Custom Work','Mombasa',80000,4.8,P(1216589),'Custom built furniture, interiors and made-to-order office solutions.','custom furniture interiors design made-to-order'],
  ['EastTrade Hub','Products','Eldoret',75000,4.5,P(3760067),'Reliable product sourcing for office, retail and equipment purchases.','products equipment retail sourcing tech']
];

(async () => {
  const hash = await bcrypt.hash('demo12345', 10);
  let i = 1;
  for (const [name, category, location, price, rating, image, description, extra] of companies) {
    const email = `seed${i++}@demo.test`;
    const [ex] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (ex.length) continue;
    const [u] = await pool.query('INSERT INTO users (email, password_hash) VALUES (?, ?)', [email, hash]);
    const tags = [...new Set(words(`${extra} ${description} ${name}`))].join(' ');
    await pool.query(
      `INSERT INTO companies (user_id, name, category, location, price, rating, image_url, description, tags, subscription_status, subscription_ends)
       VALUES (?,?,?,?,?,?,?,?,?, 'active', DATE_ADD(CURDATE(), INTERVAL 1 YEAR))`,
      [u.insertId, name, category, location, price, rating, image, description, tags]);
  }
  console.log('Seeded sample companies.');
  await pool.end();
})().catch(e => { console.error(e.message); process.exit(1); });
