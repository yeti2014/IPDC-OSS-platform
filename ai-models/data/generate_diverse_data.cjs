/**
 * Generate Diverse Synthetic Training Data for IPDC Service Classifier
 * Creates ~2200 records with varied titles and descriptions for all 11 service types
 * This ensures the model generalizes well to different phrasings
 */

const fs = require('fs');
const path = require('path');

// ============================================================
// TENANT DATA
// ============================================================
const tenants = [
  { id: 'tenant_001', name: 'Hawassa Textile PLC', email: 'hawassa.textile@example.com' },
  { id: 'tenant_002', name: 'Mekelle Steel Industry', email: 'mekelle.steel@example.com' },
  { id: 'tenant_003', name: 'Gondar Ceramics Industry', email: 'gondar.ceramics@example.com' },
  { id: 'tenant_004', name: 'Addis Garment Factory', email: 'addis.garment@example.com' },
  { id: 'tenant_005', name: 'Kombolcha Leather Works', email: 'kombolcha.leather@example.com' },
  { id: 'tenant_006', name: 'Dessie Textile Mills', email: 'dessie.textile@example.com' },
  { id: 'tenant_007', name: 'Bahir Dar Food Processing', email: 'bahirdar.food@example.com' },
  { id: 'tenant_008', name: 'Dire Dawa Leather Factory', email: 'diredawa.leather@example.com' },
  { id: 'tenant_009', name: 'Jimma Coffee Export PLC', email: 'jimma.coffee@example.com' },
  { id: 'tenant_010', name: 'Adama Pharmaceuticals', email: 'adama.pharma@example.com' },
  { id: 'tenant_011', name: 'Sebeta Agro Industries', email: 'sebeta.agro@example.com' },
  { id: 'tenant_012', name: 'Bole Lemi Apparel', email: 'bolelemi.apparel@example.com' },
  { id: 'tenant_013', name: 'Kilinto Biotech Ltd', email: 'kilinto.biotech@example.com' },
  { id: 'tenant_014', name: 'Eastern Industry Group', email: 'eastern.industry@example.com' },
  { id: 'tenant_015', name: 'Green Valley Exports', email: 'greenvalley.exports@example.com' },
  { id: 'tenant_016', name: 'Ethio-China Manufacturing', email: 'ethiochina.mfg@example.com' },
  { id: 'tenant_017', name: 'Highland Beverages PLC', email: 'highland.beverages@example.com' },
  { id: 'tenant_018', name: 'Rift Valley Plastics', email: 'riftvalley.plastics@example.com' },
  { id: 'tenant_019', name: 'Nile Packaging Solutions', email: 'nile.packaging@example.com' },
  { id: 'tenant_020', name: 'Blue Nile Electronics', email: 'bluenile.electronics@example.com' },
  { id: 'tenant_021', name: 'Abyssinia Cement PLC', email: 'abyssinia.cement@example.com' },
  { id: 'tenant_022', name: 'Unity Shoe Factory', email: 'unity.shoe@example.com' },
  { id: 'tenant_023', name: 'Sunshine Flour Mill', email: 'sunshine.flour@example.com' },
  { id: 'tenant_024', name: 'Golden Textiles Ltd', email: 'golden.textiles@example.com' },
  { id: 'tenant_025', name: 'Pacific Industrial PLC', email: 'pacific.industrial@example.com' },
];

const contactNames = [
  'Solomon Haile', 'Almaz Tesfaye', 'Yohannes Gebre', 'Tigist Bekele',
  'Daniel Abera', 'Sara Mulugeta', 'Kidane Worku', 'Helen Tadesse',
  'Bereket Asfaw', 'Meron Getachew', 'Dawit Mengistu', 'Frehiwot Desta',
  'Abel Fikadu', 'Rahel Kebede', 'Tewodros Alemu'
];

const priorities = ['low', 'normal', 'high', 'urgent'];
const statuses = ['pending', 'approved', 'issued', 'rejected', 'in_review'];

// ============================================================
// DIVERSE TEMPLATES FOR EACH SERVICE TYPE
// ============================================================

const serviceTemplates = {
  customs_clearance: {
    titles: [
      'Custom clearance request',
      'Customs clearance for imported goods',
      'Import clearance application',
      'Request for customs clearance',
      'Customs clearance - imported materials',
      'Clear goods at customs',
      'Clearance of imported machinery',
      'Customs processing request',
      'Import Clearance - Machinery and Equipment',
      'Goods clearance at Djibouti port',
      'Customs clearance assistance needed',
      'Import clearance for raw materials',
      'Clear shipment through customs',
      'Customs release request',
      'Request to clear imported items',
      'Port clearance for industrial equipment',
      'Custom duty clearance application',
      'Cargo clearance request',
      'Freight customs clearance',
      'Clearance of container shipment',
      'Expedite customs clearance',
      'Customs formalities for imports',
      'Import processing and clearance',
      'Customs documentation and clearance',
      'Duty payment and goods release',
      'Customs clearance for factory equipment',
      'Clear imported raw materials at port',
      'Urgent customs clearance needed',
      'Standard customs clearance procedure',
      'Customs clearance for spare parts',
    ],
    descriptions: [
      'We need customs clearance for our imported goods arriving at Djibouti port.',
      'Import clearance for 50 tons of raw textile materials. Bill of lading no: BL-{ref}.',
      'Request customs clearance for machinery imported from China. Container number: CONT-{ref}.',
      'Custom clearance for industrial equipment shipped via sea freight.',
      'Clearance needed for imported packaging materials and chemicals.',
      'Please process customs clearance for our shipment of raw materials arriving next week.',
      'We require clearance for imported spare parts for our factory machines.',
      'Customs clearance application for a container of leather processing chemicals.',
      'Need to clear goods at customs. Shipment contains textile dyes and fabric rolls.',
      'Requesting customs processing for imported food processing machinery. Invoice no: INV-{ref}.',
      'Custom clearance for imported electronics components for assembly line.',
      'Please assist with clearing our imported goods through Ethiopian customs.',
      'Clearance of imported raw cotton bales. Total weight: 30 tons.',
      'We need help with customs formalities for our imported pharmaceutical raw materials.',
      'Customs clearance for automotive parts imported from South Korea.',
      'Request to process import clearance for factory construction materials.',
      'Urgent clearance needed for perishable imported goods.',
      'Custom clearance for imported printing equipment and supplies.',
      'Need customs release for our shipment held at Modjo dry port.',
      'Clearance request for imported garment accessories and trims.',
      'Please expedite customs clearance for time-sensitive medical equipment.',
      'Customs clearance for imported beverage production line equipment.',
      'We need to clear a shipment of imported plastic raw materials.',
      'Customs processing for imported agricultural machinery and tools.',
      'Request clearance for our imported steel and metal products.',
    ]
  },

  customs_exemption: {
    titles: [
      'Customs duty exemption request',
      'Duty exemption application',
      'Tax exemption for imported goods',
      'Customs exemption for raw materials',
      'Request for duty-free import',
      'Import duty exemption',
      'Customs Duty Exemption for Raw Materials',
      'Apply for customs tax exemption',
      'Duty waiver request',
      'Exemption from customs duties',
      'Tax-free import permit',
      'Request customs duty waiver',
      'Customs exemption certificate application',
      'Duty exemption for machinery import',
      'Customs tariff exemption request',
      'Import tax exemption application',
      'Duty-free importation request',
      'Capital goods duty exemption',
      'Request for import duty relief',
      'Customs exemption for investment goods',
      'Exemption from import tariff',
      'Duty exemption for factory equipment',
      'Customs duty relief application',
      'Tax exemption for industrial imports',
      'Customs incentive exemption request',
    ],
    descriptions: [
      'Request for customs duty exemption on imported industrial machinery valued at USD {amount} as per investment permit.',
      'Applying for duty exemption on raw materials for manufacturing as per our investment incentive agreement.',
      'We are eligible for customs exemption under the Ethiopian investment proclamation for our factory equipment.',
      'Request duty-free import of capital goods for our new production line installation.',
      'Please process our customs exemption application for imported pharmaceutical ingredients.',
      'Duty exemption needed for machinery and equipment as specified in our investment permit.',
      'We request tax exemption on imported goods per our investment agreement with IPDC.',
      'Customs exemption application for raw materials import. Investment permit no: IP-{ref}.',
      'Apply for duty waiver on imported textile machinery under industrial park incentive scheme.',
      'Requesting customs duty exemption for imported food processing equipment worth USD {amount}.',
      'Need duty exemption certificate for importing leather processing chemicals.',
      'Customs exemption for agricultural processing equipment under investment incentive.',
      'We qualify for import duty exemption per our signed lease agreement at Hawassa IP.',
      'Request customs tariff exemption for spare parts and maintenance equipment.',
      'Duty exemption application for construction materials for factory building.',
      'We need customs exemption for importing packaging materials for export production.',
      'Apply for duty relief on imported beverage production line components.',
      'Customs exemption request for importing electronic assembly equipment.',
      'Request tax-free import of garment manufacturing machines under IPDC program.',
      'Duty exemption needed for solar panels and power equipment for factory.',
    ]
  },

  work_permit: {
    titles: [
      'Work permit application',
      'Work Permit Application for Foreign Employee',
      'Foreign worker permit request',
      'Expat work authorization',
      'Work permit for expatriate staff',
      'Request for work permit',
      'Employee work permit - foreign national',
      'Work authorization for international employee',
      'Expatriate work permit renewal',
      'New work permit application',
      'Work permit for technical expert',
      'Foreign specialist work permit',
      'Work permit for Chinese technician',
      'Work visa and permit request',
      'Request work authorization',
      'Permit for foreign factory manager',
      'Work permit for overseas staff',
      'Foreign employee authorization',
      'Technical staff work permit',
      'Work permit processing request',
      'Extend work permit for expat',
      'Work permit for Indian engineer',
      'Foreign national employment permit',
      'Request expat work document',
      'Work permit for production supervisor',
    ],
    descriptions: [
      'Application for work permit for Mr. Zhang Wei (Chinese national) as Production Manager. 2-year contract. CV and employment contract attached.',
      'Need work permit for our foreign technical expert from India who will oversee factory setup.',
      'Request work authorization for 3 expatriate engineers from Turkey for machinery installation.',
      'Work permit application for foreign operations director. Passport and employment documents enclosed.',
      'We need to process work permits for 5 Chinese technicians who will train our local staff.',
      'Requesting work permit for our new Italian quality control manager starting next month.',
      'Work authorization needed for Korean textile specialist. Contract duration: 18 months.',
      'Apply for work permit for foreign national employee joining as plant engineer.',
      'Renewal of work permit for our expatriate finance director. Current permit expires next month.',
      'Work permit for Bangladeshi garment production expert. Will be based at Bole Lemi IP.',
      'Request work permit for Vietnamese shoe manufacturing specialist. 1-year assignment.',
      'Need to process work authorization for German machinery installation engineer.',
      'Work permit application for 2 Japanese quality assurance consultants.',
      'Foreign worker permit for our new Egyptian textile dyeing expert.',
      'We request work permits for technical training staff from China. Group of 4 persons.',
      'Work permit for American food safety consultant. 6-month contract.',
      'Apply for work authorization for our Pakistani leather processing technician.',
      'Requesting expat work permit for Sri Lankan production line supervisor.',
      'Work permit needed for our foreign maintenance engineer from Brazil.',
      'Process work permit for British project manager overseeing factory expansion.',
    ]
  },

  investment_permit: {
    titles: [
      'New investment permit application',
      'Investment permit request',
      'Apply for investment license',
      'Investment Permit Application',
      'Request for investment authorization',
      'New factory investment permit',
      'Investment license application',
      'Foreign investment permit',
      'Domestic investment permit request',
      'Investment permit for manufacturing',
      'Apply for industrial investment license',
      'New Investment Permit Application',
      'Investment registration request',
      'Request investment certificate',
      'Investment permit for new facility',
      'Manufacturing investment license',
      'Investment permit - new production plant',
      'Application for investment authorization',
      'Industrial investment permit',
      'Investment entry permit application',
      'New business investment permit',
      'Investment permit for expansion',
      'Foreign direct investment permit',
      'Request for investment approval',
      'Investment permit for textile factory',
    ],
    descriptions: [
      'Applying for an investment permit for a new textile manufacturing facility in Hawassa Industrial Park. Expected capital investment: USD {amount}, creating {jobs} jobs.',
      'New investment permit application for garment factory. Planned investment of USD {amount} with {jobs} employees.',
      'Request investment license for pharmaceutical manufacturing plant at Kilinto Industrial Park.',
      'We are applying for an investment permit to establish a leather processing factory.',
      'Investment permit application for food processing facility. Capital: USD {amount}.',
      'Foreign investor seeking investment permit for electronics assembly plant in Ethiopia.',
      'Request investment authorization for new beverage production facility at Kombolcha IP.',
      'Investment permit needed for our new shoe manufacturing factory at Bole Lemi.',
      'Applying for investment license to establish agro-processing plant. Investment: USD {amount}.',
      'New investment permit for cement production facility. Expected to create {jobs} jobs.',
      'Request for investment permit for automotive parts manufacturing at Adama IP.',
      'Investment license application for plastic recycling and manufacturing plant.',
      'We want to invest in a new textile dyeing and finishing facility. Need investment permit.',
      'Investment permit for establishing a steel fabrication workshop in Dire Dawa IP.',
      'Application for foreign direct investment permit. Sector: garment manufacturing.',
      'Domestic investor requesting investment permit for packaging materials factory.',
      'Need investment permit for new flour mill and bakery production line.',
      'Investment permit application for solar panel assembly plant. Capital: USD {amount}.',
      'Request investment license for medical supplies manufacturing facility.',
      'Investment permit for coffee processing and export facility at Jimma area.',
    ]
  },

  business_license: {
    titles: [
      'Business license application',
      'Apply for business license',
      'Business license request',
      'New business license needed',
      'Business operating license',
      'Request for business license',
      'Commercial business license',
      'Business license renewal',
      'Trade license application',
      'Business license for manufacturing',
      'Apply for trade license',
      'Operating license request',
      'Business permit application',
      'Request business operating permit',
      'New company business license',
      'Business license for factory',
      'Manufacturing business license',
      'Industrial business license',
      'Business license issuance request',
      'Obtain business license',
      'Apply for commercial license',
      'Business license for new company',
      'Renew business license',
      'Business license modification',
      'Business license upgrade request',
    ],
    descriptions: [
      'Applying for business license to operate our textile manufacturing factory in the industrial park.',
      'We need a business license for our new garment production facility.',
      'Request for business license issuance. All required documents are prepared and notarized.',
      'Business license application for our leather goods manufacturing company.',
      'Need to obtain business license to commence operations at our factory.',
      'Requesting business operating license for food processing company.',
      'Business license application for pharmaceutical manufacturing and distribution.',
      'Apply for trade license for our electronics assembly and export business.',
      'Business license renewal for our existing textile production facility.',
      'We need a manufacturing business license for our new shoe factory.',
      'Request business license for agro-processing and packaging company.',
      'Business license application for beverage production and distribution.',
      'Need operating license for our steel fabrication business.',
      'Apply for business license to operate coffee roasting and export facility.',
      'Business license request for our automotive spare parts manufacturing.',
      'Requesting commercial license for our plastic products factory.',
      'Business license for our cement production facility at the industrial park.',
      'Need business operating permit for our new printing and packaging company.',
      'Business license application for medical device assembly plant.',
      'Apply for business license to operate chemical production facility.',
    ]
  },

  commercial_registration: {
    titles: [
      'Commercial registration request',
      'Company registration application',
      'Register new business',
      'Commercial Registration Application',
      'Business registration request',
      'Company incorporation application',
      'Register new company',
      'Commercial registration for new business',
      'Corporate registration request',
      'Business entity registration',
      'Company formation and registration',
      'Register business entity',
      'New company registration',
      'Commercial registration certificate',
      'Business incorporation request',
      'Apply for commercial registration',
      'Register our company',
      'Company registration documents',
      'New business entity registration',
      'Commercial registration for factory',
      'Register manufacturing company',
      'Business registration and incorporation',
      'Apply for company registration',
      'Request commercial registration certificate',
      'Company establishment registration',
    ],
    descriptions: [
      'Applying for commercial registration for our new manufacturing company.',
      'Request commercial registration certificate for our textile production business.',
      'We need to register our company to begin operations at the industrial park.',
      'Commercial registration for a new leather processing company. Memorandum of association attached.',
      'Company registration application. Share capital: ETB {amount}. Shareholders: 3.',
      'Register our new food processing business. Articles of association prepared.',
      'Commercial registration for foreign-owned manufacturing company.',
      'We need to incorporate our business and obtain commercial registration.',
      'Request for commercial registration. Business type: Private Limited Company (PLC).',
      'Company registration for our new pharmaceutical manufacturing enterprise.',
      'Apply for commercial registration for our garment export company.',
      'Business registration needed for our joint venture electronics assembly firm.',
      'Commercial registration for agro-processing company. All founding documents ready.',
      'Register our new beverage production company at the trade registry.',
      'Need commercial registration certificate for our newly formed company.',
      'Company registration for our steel manufacturing business. 5 shareholders.',
      'Commercial registration for our coffee processing and export PLC.',
      'Request to register our automotive parts manufacturing company.',
      'Business entity registration for plastic products manufacturing firm.',
      'Commercial registration for our new solar equipment assembly company.',
    ]
  },

  trade_name_registration: {
    titles: [
      'Trade name registration',
      'Register business name',
      'Company name registration',
      'Trade name reservation',
      'Business name registration request',
      'Register trade name',
      'Name registration application',
      'Trade Name Registration Application',
      'Reserve company name',
      'Business name reservation',
      'Register our company name',
      'Trade name application',
      'Company name reservation request',
      'Apply for trade name',
      'Name clearance and registration',
      'Trade name search and registration',
      'Register business trade name',
      'Company name approval request',
      'Trade name availability check',
      'Request trade name certificate',
      'Business name clearance',
      'Trade name registration certificate',
      'New company name registration',
      'Register factory trade name',
      'Trade name change request',
    ],
    descriptions: [
      'Requesting registration of our company trade name: "{company}" for manufacturing operations.',
      'We need to register our business name before proceeding with commercial registration.',
      'Trade name reservation request for our new textile company.',
      'Please check availability and register our proposed company name.',
      'Apply for trade name registration. Proposed name: "{company} PLC".',
      'Business name registration needed for our new leather goods company.',
      'Trade name search and registration for our food processing enterprise.',
      'We want to reserve the company name "{company}" for our manufacturing business.',
      'Request trade name clearance certificate for company incorporation.',
      'Register our proposed trade name for the pharmaceutical company.',
      'Name registration application for our garment manufacturing firm.',
      'Need to register business name before obtaining business license.',
      'Trade name registration for our joint venture company.',
      'We are registering our company name for beverage production business.',
      'Apply for name clearance and trade name registration certificate.',
      'Trade name registration for our electronics assembly company.',
      'Reserve business name for our new agro-processing factory.',
      'Request trade name certificate for our steel manufacturing firm.',
      'Business name registration for our coffee export company.',
      'Trade name change request - updating our company name.',
    ]
  },

  tin_issuance: {
    titles: [
      'TIN registration request',
      'Tax identification number application',
      'Apply for TIN',
      'TIN Issuance Request',
      'Request tax ID number',
      'TIN certificate application',
      'Tax registration request',
      'Get TIN number',
      'Taxpayer identification number',
      'TIN issuance for new company',
      'Request for TIN certificate',
      'Tax ID registration',
      'Apply for tax identification',
      'TIN number application',
      'Obtain TIN certificate',
      'Tax registration and TIN',
      'New TIN application',
      'TIN issuance request for business',
      'Taxpayer registration',
      'Request TIN for our company',
      'Tax identification registration',
      'Company TIN application',
      'TIN certificate request',
      'Register for tax identification number',
      'TIN issuance for factory',
    ],
    descriptions: [
      'We need to obtain a Tax Identification Number (TIN) for our newly registered company.',
      'Apply for TIN issuance for our manufacturing business. Commercial registration attached.',
      'Request TIN certificate for our company to fulfill tax obligations.',
      'TIN registration needed for our new factory at the industrial park.',
      'We require a tax identification number for our business operations.',
      'Apply for TIN for our foreign-owned manufacturing company.',
      'TIN issuance request for our garment production business.',
      'Need taxpayer identification number to proceed with business license application.',
      'Request TIN for our newly incorporated PLC.',
      'TIN application for our food processing company. Registration certificate enclosed.',
      'We need a TIN to open a company bank account and start operations.',
      'Tax ID registration for our pharmaceutical manufacturing enterprise.',
      'TIN issuance for our leather goods export company.',
      'Apply for tax identification number for our electronics assembly business.',
      'Request TIN certificate for our agro-processing company.',
      'TIN registration for our beverage production and distribution company.',
      'We need a TIN for our steel fabrication workshop.',
      'Tax identification number application for our coffee processing firm.',
      'TIN issuance request for our automotive parts company.',
      'Apply for taxpayer registration and TIN certificate for our new company.',
    ]
  },

  notarization: {
    titles: [
      'Document notarization request',
      'Notarization service needed',
      'Notarize company documents',
      'Notarization Service Request',
      'MoU Notarization Service',
      'Notarize agreement',
      'Document authentication request',
      'Notarization of company documents',
      'Legal document notarization',
      'Contract notarization',
      'Notarize lease agreement',
      'Notarization of business documents',
      'Request for notarization service',
      'Notarize company formation documents',
      'Agreement notarization needed',
      'Notarization for memorandum of association',
      'Notarize official documents',
      'Document certification and notarization',
      'Notarization request for contracts',
      'Notarize partnership agreement',
      'Legal notarization service',
      'Notarize shareholder agreement',
      'Corporate document notarization',
      'Notarization of power of attorney',
      'Notarize investment agreement',
    ],
    descriptions: [
      'Notarization required for Memorandum of Understanding between shareholders.',
      'We need to notarize our company formation documents for registration purposes.',
      'Request notarization of lease agreement between our company and IPDC.',
      'Notarize our business partnership agreement. All parties will be present.',
      'Document notarization needed for our articles of association.',
      'We require notarization of our investment agreement with local partners.',
      'Notarization of employment contracts for foreign technical staff.',
      'Please notarize our shareholder resolution documents.',
      'Need notarization for our company power of attorney document.',
      'Notarize the land lease agreement for our factory plot.',
      'Request notarization of our joint venture agreement.',
      'We need to notarize our board resolution for company restructuring.',
      'Notarization of supplier contract with international vendor.',
      'Document authentication required for our export agreement.',
      'Notarize our company memorandum and articles of association.',
      'We need notarization of our bank guarantee documents.',
      'Request notarization service for our property transfer documents.',
      'Notarize our technology transfer agreement with foreign partner.',
      'Need document notarization for our franchise agreement.',
      'Notarization of our corporate governance documents.',
    ]
  },

  agreements: {
    titles: [
      'Lease agreement request',
      'Sign lease agreement',
      'Agreement signing request',
      'Factory lease agreement',
      'Industrial park agreement',
      'Lease Agreement Application',
      'Request for agreement signing',
      'Land lease agreement',
      'Facility agreement request',
      'Sign MoU with IPDC',
      'Agreement for factory space',
      'Lease contract request',
      'Agreement application',
      'Partnership agreement with IPDC',
      'Shed lease agreement',
      'Sign industrial park lease',
      'Agreement for land allocation',
      'Factory space agreement',
      'Request for lease contract',
      'MoU signing request',
      'Warehouse lease agreement',
      'Building lease agreement',
      'Agreement for utilities',
      'Infrastructure agreement',
      'Service level agreement request',
    ],
    descriptions: [
      'Request to sign lease agreement for factory shed at the industrial park.',
      'We would like to enter into a lease agreement for a 5,000 sqm factory space.',
      'Agreement signing request for our allocated land at Hawassa Industrial Park.',
      'Need to sign the lease contract for our factory building. Duration: {years} years.',
      'Request for agreement between our company and IPDC for industrial park services.',
      'Lease agreement application for warehouse facility at the industrial park.',
      'We are ready to sign the MoU for our factory space allocation.',
      'Agreement request for land lease at Bole Lemi Industrial Park.',
      'Need to finalize and sign our factory shed lease agreement.',
      'Request to sign infrastructure services agreement with IPDC.',
      'Lease contract request for a pre-built factory at Kombolcha IP.',
      'Agreement for utility services including power and water supply.',
      'We want to sign a lease agreement for our production facility.',
      'Request for lease renewal agreement. Current lease expiring soon.',
      'Agreement application for expansion of our factory premises.',
      'Sign service level agreement for park maintenance services.',
      'Lease agreement for additional storage and warehouse space.',
      'We need to execute the land lease agreement for our new factory.',
      'Request to sign partnership agreement for shared facility usage.',
      'Agreement for the allocation of factory space and utilities.',
    ]
  },

  banking_services: {
    titles: [
      'Banking service request',
      'Open company bank account',
      'Banking services needed',
      'Bank Account Opening Request',
      'Foreign currency service',
      'Request banking facilities',
      'Company bank account setup',
      'Banking services application',
      'Open business bank account',
      'Foreign exchange service request',
      'Banking and payment services',
      'Request for bank account',
      'Corporate banking setup',
      'Letter of credit request',
      'Banking services for factory',
      'Forex services request',
      'Business banking application',
      'Bank account opening assistance',
      'Trade finance services',
      'Request banking support',
      'Payment processing setup',
      'Foreign currency account',
      'Banking services for import/export',
      'Company account opening',
      'Banking facility application',
    ],
    descriptions: [
      'We need to open a company bank account for our manufacturing operations.',
      'Request banking services for foreign currency transactions and trade finance.',
      'Need to set up a corporate bank account at the designated bank branch.',
      'Banking services request for our new factory. Need forex and local currency accounts.',
      'Apply for letter of credit facility for importing raw materials.',
      'We require foreign exchange services for our export-oriented business.',
      'Request to open a business bank account with trade finance capabilities.',
      'Banking setup needed for our company operations at the industrial park.',
      'Need corporate banking facilities including payment processing and forex.',
      'Request foreign currency account for our international trade operations.',
      'Banking services for our import/export business. Need LC and forex services.',
      'We want to open a company account and set up payment systems.',
      'Apply for banking facilities at the industrial park designated bank.',
      'Need banking support for our foreign direct investment transactions.',
      'Request trade finance services for our garment export business.',
      'Banking application for our pharmaceutical company. Need multi-currency accounts.',
      'Set up corporate banking including online banking and wire transfer services.',
      'Request banking services for repatriation of profits and dividends.',
      'Need banking facility for payroll processing and supplier payments.',
      'Apply for banking services to facilitate our import clearance payments.',
    ]
  }
};

// ============================================================
// DATA GENERATION
// ============================================================

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start, end) {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString();
}

function generatePhone() {
  return `+251-91-${randomInt(1000000, 9999999)}`;
}

function generateRef() {
  return randomInt(10000, 99999).toString();
}

function fillTemplate(text) {
  return text
    .replace('{ref}', generateRef())
    .replace('{amount}', randomChoice(['500000', '1000000', '2000000', '3000000', '5000000', '8000000', '10000000']))
    .replace('{jobs}', randomChoice(['50', '100', '200', '300', '500', '800', '1000']))
    .replace('{years}', randomChoice(['5', '10', '15', '20', '25']))
    .replace('{company}', randomChoice(tenants).name);
}

function generateRecords() {
  const records = [];
  let id = 0;

  for (const [serviceType, templates] of Object.entries(serviceTemplates)) {
    // Generate 200 records per service type = 2200 total
    for (let i = 0; i < 200; i++) {
      const tenant = randomChoice(tenants);
      const title = fillTemplate(randomChoice(templates.titles));
      const description = fillTemplate(randomChoice(templates.descriptions));
      const priority = randomChoice(priorities);
      const status = randomChoice(statuses);
      const contact = randomChoice(contactNames);
      const createdAt = randomDate(new Date('2025-01-01'), new Date('2026-01-15'));
      const updatedAt = randomDate(new Date(createdAt), new Date('2026-02-15'));
      const submittedAt = randomDate(new Date(createdAt), new Date(new Date(createdAt).getTime() + 48*60*60*1000));
      const processingDays = randomInt(1, 15);

      records.push({
        id: `req_${String(id).padStart(4, '0')}`,
        tenantId: tenant.id,
        tenantName: tenant.name,
        tenantEmail: tenant.email,
        serviceType,
        title,
        description,
        status,
        priority,
        companyName: tenant.name,
        contactPerson: contact,
        contactPhone: generatePhone(),
        contactEmail: `contact@${tenant.email.split('@')[0]}.com`,
        createdAt,
        updatedAt,
        submittedAt,
        actual_processing_days: processingDays
      });

      id++;
    }
  }

  // Shuffle records
  for (let i = records.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [records[i], records[j]] = [records[j], records[i]];
  }

  return records;
}

// ============================================================
// CSV EXPORT
// ============================================================

function toCSV(records) {
  const headers = [
    'id', 'tenantId', 'tenantName', 'tenantEmail', 'serviceType',
    'title', 'description', 'status', 'priority', 'companyName',
    'contactPerson', 'contactPhone', 'contactEmail', 'createdAt',
    'updatedAt', 'submittedAt', 'actual_processing_days'
  ];

  const escapeCSV = (val) => {
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines = [headers.join(',')];
  for (const record of records) {
    const row = headers.map(h => escapeCSV(record[h]));
    lines.push(row.join(','));
  }

  return lines.join('\n');
}

// ============================================================
// MAIN
// ============================================================

console.log('Generating diverse training data for IPDC Service Classifier...');
const records = generateRecords();
console.log(`Generated ${records.length} records`);

// Count per service type
const counts = {};
records.forEach(r => { counts[r.serviceType] = (counts[r.serviceType] || 0) + 1; });
console.log('\nRecords per service type:');
Object.entries(counts).sort().forEach(([k, v]) => console.log(`  ${k}: ${v}`));

const csv = toCSV(records);
const outputPath = path.join(__dirname, 'raw', 'service_requests_synthetic.csv');
fs.writeFileSync(outputPath, csv, 'utf-8');
console.log(`\nSaved to: ${outputPath}`);
console.log('Done!');
