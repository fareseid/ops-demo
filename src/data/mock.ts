// ========== TYPES ==========
export type RequestStatus = 'New' | 'Reviewing' | 'Site Visit Required' | 'Ready to Quote' | 'Quoted';
export type QuotationStatus = 'Draft' | 'Internal Review' | 'Sent' | 'Customer Reviewing' | 'Accepted' | 'Rejected' | 'Expired';
export type ProjectStatus = 'Planning' | 'Awaiting Materials' | 'In Progress' | 'On Hold' | 'Completed';
export type ProcurementStatus = 'Draft' | 'Approval Required' | 'Approved' | 'PO Issued' | 'Partially Received' | 'Received';
export type InvoiceStatus = 'Draft' | 'Sent' | 'Partially Paid' | 'Paid' | 'Overdue';
export type Priority = 'Low' | 'Normal' | 'Medium' | 'High' | 'Urgent';

export interface CustomerRequest {
  id: string;
  customer: string;
  contactPerson: string;
  phone: string;
  email: string;
  service: string;
  category: string;
  location: string;
  received: string;
  assignedTo: string;
  priority: Priority;
  status: RequestStatus;
  description: string;
  requirements: string;
  notes: string;
}

export interface QuotationLineItem {
  description: string;
  qty: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export interface Quotation {
  id: string;
  requestId?: string;
  customer: string;
  project: string;
  amount: number;
  created: string;
  validUntil: string;
  owner: string;
  status: QuotationStatus;
  contactPerson: string;
  paymentTerms: string;
  deliveryTimeframe: string;
  lineItems: QuotationLineItem[];
  vat: number;
}

export interface ProjectTask {
  name: string;
  status: 'Complete' | 'In Progress' | 'Not Started';
}

export interface ProjectMaterial {
  item: string;
  required: number;
  available: number;
  ordered: number;
  unit: string;
  status: 'Available' | 'Shortage' | 'Ordered' | 'Pending';
}

export interface ProjectTeamMember {
  name: string;
  role: string;
  count?: number;
}

export interface Project {
  id: string;
  quotationId?: string;
  customer: string;
  project: string;
  category: string;
  location: string;
  projectManager: string;
  startDate: string;
  targetCompletion: string;
  value: number;
  progress: number;
  status: ProjectStatus;
  scope: string;
  customerContact: string;
  tasks: ProjectTask[];
  materials: ProjectMaterial[];
  team: ProjectTeamMember[];
  costs: {
    quotedRevenue: number;
    materialCost: number;
    labourCost: number;
    transport: number;
    otherCosts: number;
  };
}

export interface PurchaseRequest {
  id: string;
  projectId: string;
  project: string;
  requestedBy: string;
  supplier: string;
  items: { description: string; qty: string; }[];
  value: number;
  requiredBy: string;
  status: ProcurementStatus;
}

export interface InventoryItem {
  item: string;
  category: string;
  sku: string;
  available: number;
  reserved: number;
  unit: string;
  reorderLevel: number;
  status: 'Available' | 'Low Stock' | 'Shortage';
}

export interface Equipment {
  name: string;
  type: string;
  availability: 'Available' | 'In Use' | 'Maintenance';
  currentAssignment: string;
  nextAvailable: string;
  condition: 'Good' | 'Fair' | 'Maintenance Required';
}

export interface LabourResource {
  name: string;
  trade: string;
  currentAssignment: string;
  availability: 'Assigned' | 'Available' | 'On Leave';
  utilisation: number;
}

export interface Invoice {
  id: string;
  customer: string;
  projectId?: string;
  project: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  paid: number;
  balance: number;
  status: InvoiceStatus;
  payments: { date: string; amount: number; method: string; reference: string; }[];
}

export interface DocFile {
  name: string;
  type: string;
  project: string;
  date: string;
  size: string;
}

// ========== DATA ==========

export const requests: CustomerRequest[] = [
  {
    id: 'REQ-2026-047', customer: 'Copperbelt Mining Services', contactPerson: 'Robert Mwanza', phone: '+260 97 123 4567', email: 'rmwanza@copperbeltmining.co.zm',
    service: 'Electrical Panel Upgrade', category: 'Electrical', location: 'Kitwe', received: '2026-08-28', assignedTo: 'Joseph M.', priority: 'High', status: 'Ready to Quote',
    description: 'Replacement and commissioning of main electrical distribution panel at the Kitwe processing facility. Current panel is outdated and does not meet safety standards.',
    requirements: '400A main panel with MCCB protection, new cabling from transformer, full testing and commissioning, compliance certification.',
    notes: 'Customer wants work completed before September shutdown. Site access restricted after 18:00.',
  },
  {
    id: 'REQ-2026-046', customer: 'Lusaka Commercial Centre', contactPerson: 'Patricia Banda', phone: '+260 96 234 5678', email: 'pbanda@lusakacc.co.zm',
    service: 'HVAC Installation', category: 'HVAC', location: 'Lusaka', received: '2026-08-27', assignedTo: 'Tsindikai M.', priority: 'Medium', status: 'Reviewing',
    description: 'Full HVAC installation for the new east wing of the commercial centre. Approximately 2,400 sqm of retail and office space requiring climate control.',
    requirements: 'Central air conditioning system, ducting, controls, commissioning. Must integrate with existing BMS.',
    notes: 'Architect drawings available. Building completion expected mid-September.',
  },
  {
    id: 'REQ-2026-045', customer: 'Kafue Manufacturing Ltd', contactPerson: 'David Chomba', phone: '+260 95 345 6789', email: 'dchomba@kafuemfg.co.zm',
    service: 'Hydraulic System Maintenance', category: 'Hydraulics', location: 'Kafue', received: '2026-08-25', assignedTo: 'Kumwena M.', priority: 'High', status: 'Site Visit Required',
    description: 'Preventive maintenance and repair of hydraulic press systems at the Kafue manufacturing plant. Multiple presses showing reduced performance.',
    requirements: 'Inspection of 4 hydraulic presses, replacement of seals and hoses, system flush, pressure testing.',
    notes: 'Plant operates 24/7 — work must be scheduled during planned downtime windows.',
  },
  {
    id: 'REQ-2026-044', customer: 'Zambezi Logistics', contactPerson: 'Grace Tembo', phone: '+260 97 456 7890', email: 'gtembo@zambezilog.co.zm',
    service: 'Truck & Labour Hire', category: 'Transport', location: 'Lusaka', received: '2026-08-24', assignedTo: 'Tsindikai M.', priority: 'Normal', status: 'Quoted',
    description: 'Transport and labour hire for warehouse relocation project. Requires flatbed trucks and general workers for a two-week period.',
    requirements: '2× flatbed trucks, 1× crane truck, 8 general workers, 2 supervisors for 10 working days.',
    notes: 'Quotation Q-2026-038 submitted.',
  },
  {
    id: 'REQ-2026-043', customer: 'Northgate Foods Zambia', contactPerson: 'Michael Phiri', phone: '+260 96 567 8901', email: 'mphiri@northgatefoods.co.zm',
    service: 'Cold Room Maintenance', category: 'HVAC', location: 'Ndola', received: '2026-08-22', assignedTo: 'Joseph M.', priority: 'Urgent', status: 'Quoted',
    description: 'Emergency maintenance on industrial cold room compressor. Temperature not holding below -18°C.',
    requirements: 'Compressor diagnosis and repair, refrigerant recharge, thermostat calibration.',
    notes: 'Urgent — product at risk. Quotation sent same day.',
  },
  {
    id: 'REQ-2026-042', customer: 'Kitwe Industrial Processing', contactPerson: 'James Musonda', phone: '+260 95 678 9012', email: 'jmusonda@kiprocessing.co.zm',
    service: 'Steel Platform Fabrication', category: 'Fabrication', location: 'Kitwe', received: '2026-08-20', assignedTo: 'Kumwena M.', priority: 'Medium', status: 'New',
    description: 'Fabrication and installation of elevated steel platform for new conveyor system access. Platform must support maintenance personnel and equipment.',
    requirements: 'Structural steel platform 6m × 4m, handrails, access stairway, anti-slip flooring. Must comply with mine safety regulations.',
    notes: 'Drawings to be provided by customer structural engineer.',
  },
];

export const quotations: Quotation[] = [
  {
    id: 'Q-2026-041', requestId: 'REQ-2026-047', customer: 'Copperbelt Mining Services', project: 'Electrical Panel Upgrade', amount: 186450,
    created: '2026-08-28', validUntil: '2026-09-12', owner: 'Tsindikai', status: 'Customer Reviewing',
    contactPerson: 'Robert Mwanza', paymentTerms: '30 days from invoice', deliveryTimeframe: '14 working days',
    lineItems: [
      { description: 'Electrical Control Panel 400A', qty: 1, unit: 'unit', unitPrice: 68000, total: 68000 },
      { description: 'MCCB Protection Equipment 250A', qty: 4, unit: 'units', unitPrice: 8500, total: 34000 },
      { description: '50mm Electrical Cable', qty: 120, unit: 'metres', unitPrice: 185, total: 22200 },
      { description: 'Cable Glands & Accessories', qty: 1, unit: 'lot', unitPrice: 4800, total: 4800 },
      { description: 'Installation Labour', qty: 10, unit: 'days', unitPrice: 3200, total: 32000 },
      { description: 'Testing & Commissioning', qty: 3, unit: 'days', unitPrice: 4500, total: 13500 },
      { description: 'Transport to Site', qty: 2, unit: 'trips', unitPrice: 5975, total: 11950 },
    ],
    vat: 0.16,
  },
  {
    id: 'Q-2026-040', customer: 'Lusaka Commercial Centre', project: 'HVAC Installation & Commissioning', amount: 324800,
    created: '2026-08-27', validUntil: '2026-09-10', owner: 'Tsindikai', status: 'Sent',
    contactPerson: 'Patricia Banda', paymentTerms: '50% advance, 50% on completion', deliveryTimeframe: '21 working days',
    lineItems: [
      { description: 'Central AC Units 24,000 BTU', qty: 8, unit: 'units', unitPrice: 18500, total: 148000 },
      { description: 'Ducting & Insulation', qty: 1, unit: 'lot', unitPrice: 52000, total: 52000 },
      { description: 'Control System & Thermostats', qty: 8, unit: 'units', unitPrice: 3800, total: 30400 },
      { description: 'Installation Labour', qty: 15, unit: 'days', unitPrice: 4200, total: 63000 },
      { description: 'Commissioning & Balancing', qty: 4, unit: 'days', unitPrice: 4600, total: 18400 },
      { description: 'Transport & Logistics', qty: 1, unit: 'lot', unitPrice: 13000, total: 13000 },
    ],
    vat: 0.16,
  },
  {
    id: 'Q-2026-039', requestId: 'REQ-2026-045', customer: 'Kafue Manufacturing Ltd', project: 'Hydraulic System Overhaul', amount: 92600,
    created: '2026-08-24', validUntil: '2026-09-07', owner: 'Kumwena', status: 'Accepted',
    contactPerson: 'David Chomba', paymentTerms: '30 days from invoice', deliveryTimeframe: '10 working days',
    lineItems: [
      { description: 'Hydraulic Seal Kits', qty: 16, unit: 'sets', unitPrice: 1250, total: 20000 },
      { description: 'Hydraulic Hoses 1"', qty: 24, unit: 'metres', unitPrice: 850, total: 20400 },
      { description: 'Hydraulic Fluid', qty: 200, unit: 'litres', unitPrice: 65, total: 13000 },
      { description: 'Pressure Gauges', qty: 8, unit: 'units', unitPrice: 1200, total: 9600 },
      { description: 'Labour — Hydraulic Technician', qty: 8, unit: 'days', unitPrice: 2800, total: 22400 },
      { description: 'Transport', qty: 1, unit: 'lot', unitPrice: 7200, total: 7200 },
    ],
    vat: 0.16,
  },
  {
    id: 'Q-2026-038', customer: 'Zambezi Logistics', project: 'Transport & Labour Hire', amount: 42800,
    created: '2026-08-22', validUntil: '2026-09-05', owner: 'Tsindikai', status: 'Accepted',
    contactPerson: 'Grace Tembo', paymentTerms: '14 days from invoice', deliveryTimeframe: 'Start within 3 days of confirmation',
    lineItems: [
      { description: 'Flatbed Truck Hire', qty: 10, unit: 'days', unitPrice: 1800, total: 18000 },
      { description: 'Crane Truck Hire', qty: 5, unit: 'days', unitPrice: 2400, total: 12000 },
      { description: 'General Workers', qty: 80, unit: 'man-days', unitPrice: 120, total: 9600 },
      { description: 'Supervisor', qty: 20, unit: 'man-days', unitPrice: 160, total: 3200 },
    ],
    vat: 0.16,
  },
  {
    id: 'Q-2026-037', customer: 'Northgate Foods Zambia', project: 'Cold Room Compressor Repair', amount: 28500,
    created: '2026-08-22', validUntil: '2026-09-05', owner: 'Joseph', status: 'Accepted',
    contactPerson: 'Michael Phiri', paymentTerms: '14 days from invoice', deliveryTimeframe: '3 working days',
    lineItems: [
      { description: 'Compressor Overhaul', qty: 1, unit: 'unit', unitPrice: 15000, total: 15000 },
      { description: 'Refrigerant R404A', qty: 12, unit: 'kg', unitPrice: 450, total: 5400 },
      { description: 'Thermostat & Controls', qty: 1, unit: 'set', unitPrice: 3200, total: 3200 },
      { description: 'Labour', qty: 2, unit: 'days', unitPrice: 2450, total: 4900 },
    ],
    vat: 0.16,
  },
  {
    id: 'Q-2026-036', customer: 'Central Province Milling', project: 'Warehouse Electrical Installation', amount: 148200,
    created: '2026-08-18', validUntil: '2026-09-01', owner: 'Tsindikai', status: 'Draft',
    contactPerson: 'Thomas Lungu', paymentTerms: '30 days from invoice', deliveryTimeframe: '18 working days',
    lineItems: [
      { description: 'Distribution Boards', qty: 3, unit: 'units', unitPrice: 12000, total: 36000 },
      { description: 'Electrical Cable (various)', qty: 1, unit: 'lot', unitPrice: 38000, total: 38000 },
      { description: 'Lighting Fixtures', qty: 48, unit: 'units', unitPrice: 650, total: 31200 },
      { description: 'Installation Labour', qty: 12, unit: 'days', unitPrice: 2800, total: 33600 },
      { description: 'Testing & Certification', qty: 2, unit: 'days', unitPrice: 4700, total: 9400 },
    ],
    vat: 0.16,
  },
];

export const projects: Project[] = [
  {
    id: 'PRJ-2026-018', quotationId: 'Q-2026-041', customer: 'Copperbelt Mining Services', project: 'Electrical Panel Upgrade',
    category: 'Electrical', location: 'Kitwe', projectManager: 'Joseph Mudemba', startDate: '2026-09-02', targetCompletion: '2026-09-15',
    value: 186450, progress: 35, status: 'In Progress',
    scope: 'Replacement and commissioning of main electrical distribution panel including protection systems, cabling, testing and commissioning at the Kitwe processing facility.',
    customerContact: 'Robert Mwanza',
    tasks: [
      { name: 'Site Inspection', status: 'Complete' },
      { name: 'Final Measurements', status: 'Complete' },
      { name: 'Order Control Panel', status: 'In Progress' },
      { name: 'Electrical Installation', status: 'Not Started' },
      { name: 'Testing & Commissioning', status: 'Not Started' },
      { name: 'Customer Handover', status: 'Not Started' },
    ],
    materials: [
      { item: 'Electrical Control Panel 400A', required: 1, available: 0, ordered: 1, unit: 'unit', status: 'Ordered' },
      { item: 'MCCB 250A Breakers', required: 4, available: 2, ordered: 2, unit: 'units', status: 'Shortage' },
      { item: '50mm Electrical Cable', required: 120, available: 340, ordered: 0, unit: 'metres', status: 'Available' },
      { item: 'Cable Glands', required: 30, available: 45, ordered: 0, unit: 'units', status: 'Available' },
      { item: 'Conduit 25mm', required: 60, available: 80, ordered: 0, unit: 'metres', status: 'Available' },
      { item: 'Protection Relays', required: 4, available: 1, ordered: 3, unit: 'units', status: 'Ordered' },
    ],
    team: [
      { name: 'Joseph Mudemba', role: 'Supervisor' },
      { name: 'Electrician', role: 'Electrician', count: 2 },
      { name: 'Technician', role: 'Technician', count: 1 },
      { name: 'General Worker', role: 'General Worker', count: 2 },
    ],
    costs: { quotedRevenue: 186450, materialCost: 97000, labourCost: 45500, transport: 11950, otherCosts: 4200 },
  },
  {
    id: 'PRJ-2026-017', customer: 'Lusaka Commercial Centre', project: 'HVAC Installation',
    category: 'HVAC', location: 'Lusaka', projectManager: 'Kumwena Malezhi', startDate: '2026-09-01', targetCompletion: '2026-09-20',
    value: 324800, progress: 15, status: 'Awaiting Materials',
    scope: 'Full HVAC installation for the east wing including central AC units, ducting, insulation, controls, commissioning and integration with existing BMS.',
    customerContact: 'Patricia Banda',
    tasks: [
      { name: 'Site Survey & Design Review', status: 'Complete' },
      { name: 'Procure AC Units', status: 'In Progress' },
      { name: 'Ducting Fabrication', status: 'Not Started' },
      { name: 'Installation', status: 'Not Started' },
      { name: 'BMS Integration', status: 'Not Started' },
      { name: 'Commissioning & Balancing', status: 'Not Started' },
    ],
    materials: [
      { item: 'Central AC Unit 24,000 BTU', required: 8, available: 3, ordered: 5, unit: 'units', status: 'Ordered' },
      { item: 'Ducting Material', required: 1, available: 0, ordered: 1, unit: 'lot', status: 'Ordered' },
      { item: 'Thermostats', required: 8, available: 8, ordered: 0, unit: 'units', status: 'Available' },
      { item: 'Insulation Material', required: 120, available: 80, ordered: 40, unit: 'sqm', status: 'Ordered' },
    ],
    team: [
      { name: 'Kumwena Malezhi', role: 'Project Manager' },
      { name: 'HVAC Technician', role: 'HVAC Technician', count: 3 },
      { name: 'General Worker', role: 'General Worker', count: 2 },
    ],
    costs: { quotedRevenue: 324800, materialCost: 230400, labourCost: 63000, transport: 13000, otherCosts: 5800 },
  },
  {
    id: 'PRJ-2026-016', quotationId: 'Q-2026-039', customer: 'Kafue Manufacturing Ltd', project: 'Hydraulic System Overhaul',
    category: 'Mechanical', location: 'Kafue', projectManager: 'Tsindikai Mudemba', startDate: '2026-08-25', targetCompletion: '2026-09-05',
    value: 92600, progress: 78, status: 'In Progress',
    scope: 'Complete overhaul of 4 hydraulic press systems including seal replacement, hose replacement, fluid flush, and pressure testing.',
    customerContact: 'David Chomba',
    tasks: [
      { name: 'Initial Inspection', status: 'Complete' },
      { name: 'Isolate & Drain Systems', status: 'Complete' },
      { name: 'Replace Seals & Hoses', status: 'Complete' },
      { name: 'System Flush', status: 'In Progress' },
      { name: 'Pressure Testing', status: 'Not Started' },
      { name: 'Final Certification', status: 'Not Started' },
    ],
    materials: [
      { item: 'Hydraulic Seal Kits', required: 16, available: 16, ordered: 0, unit: 'sets', status: 'Available' },
      { item: 'Hydraulic Hose 1"', required: 24, available: 8, ordered: 16, unit: 'metres', status: 'Ordered' },
      { item: 'Hydraulic Fluid', required: 200, available: 200, ordered: 0, unit: 'litres', status: 'Available' },
      { item: 'Pressure Gauges', required: 8, available: 8, ordered: 0, unit: 'units', status: 'Available' },
    ],
    team: [
      { name: 'Tsindikai Mudemba', role: 'Project Manager' },
      { name: 'Hydraulic Technician', role: 'Hydraulic Technician', count: 2 },
      { name: 'Mechanical Fitter', role: 'Mechanical Fitter', count: 1 },
    ],
    costs: { quotedRevenue: 92600, materialCost: 63000, labourCost: 22400, transport: 7200, otherCosts: 0 },
  },
  {
    id: 'PRJ-2026-015', customer: 'Northgate Foods Zambia', project: 'Cold Room Compressor Repair',
    category: 'HVAC', location: 'Ndola', projectManager: 'Joseph Mudemba', startDate: '2026-08-23', targetCompletion: '2026-08-26',
    value: 28500, progress: 100, status: 'Completed',
    scope: 'Emergency repair of cold room compressor including overhaul, refrigerant recharge and thermostat replacement.',
    customerContact: 'Michael Phiri',
    tasks: [
      { name: 'Diagnosis', status: 'Complete' },
      { name: 'Compressor Overhaul', status: 'Complete' },
      { name: 'Refrigerant Recharge', status: 'Complete' },
      { name: 'Controls Replacement', status: 'Complete' },
      { name: 'Testing', status: 'Complete' },
    ],
    materials: [
      { item: 'Compressor Parts', required: 1, available: 1, ordered: 0, unit: 'set', status: 'Available' },
      { item: 'Refrigerant R404A', required: 12, available: 12, ordered: 0, unit: 'kg', status: 'Available' },
      { item: 'Thermostat', required: 1, available: 1, ordered: 0, unit: 'unit', status: 'Available' },
    ],
    team: [
      { name: 'Joseph Mudemba', role: 'Supervisor' },
      { name: 'HVAC Technician', role: 'Refrigeration Tech', count: 1 },
    ],
    costs: { quotedRevenue: 28500, materialCost: 23600, labourCost: 4900, transport: 0, otherCosts: 0 },
  },
  {
    id: 'PRJ-2026-014', customer: 'Zambezi Logistics', project: 'Transport & Labour Hire',
    category: 'Transport', location: 'Lusaka', projectManager: 'Tsindikai Mudemba', startDate: '2026-08-20', targetCompletion: '2026-09-03',
    value: 42800, progress: 55, status: 'In Progress',
    scope: 'Provision of flatbed trucks, crane truck and general labour for warehouse relocation project.',
    customerContact: 'Grace Tembo',
    tasks: [
      { name: 'Mobilise Equipment', status: 'Complete' },
      { name: 'Phase 1 — Heavy Machinery', status: 'Complete' },
      { name: 'Phase 2 — General Inventory', status: 'In Progress' },
      { name: 'Phase 3 — Sensitive Equipment', status: 'Not Started' },
      { name: 'Demobilise', status: 'Not Started' },
    ],
    materials: [],
    team: [
      { name: 'Tsindikai Mudemba', role: 'Coordinator' },
      { name: 'Truck Driver', role: 'Driver', count: 3 },
      { name: 'General Worker', role: 'General Worker', count: 8 },
      { name: 'Supervisor', role: 'Supervisor', count: 2 },
    ],
    costs: { quotedRevenue: 42800, materialCost: 0, labourCost: 12800, transport: 30000, otherCosts: 0 },
  },
];

export const purchaseRequests: PurchaseRequest[] = [
  {
    id: 'PR-2026-024', projectId: 'PRJ-2026-018', project: 'Electrical Panel Upgrade',
    requestedBy: 'Joseph Mudemba', supplier: 'Zambia Industrial Electricals',
    items: [
      { description: 'MCCB 250A', qty: '4 units' },
      { description: '50mm Electrical Cable', qty: '120 metres' },
      { description: 'Cable Glands', qty: '30 units' },
      { description: 'Protection Relays', qty: '4 units' },
    ],
    value: 47850, requiredBy: '2026-09-03', status: 'Approval Required',
  },
  {
    id: 'PR-2026-023', projectId: 'PRJ-2026-017', project: 'HVAC Installation',
    requestedBy: 'Kumwena Malezhi', supplier: 'CoolAir Zambia Ltd',
    items: [
      { description: 'Central AC Unit 24,000 BTU', qty: '5 units' },
      { description: 'Ducting Material Set', qty: '1 lot' },
      { description: 'Insulation Material', qty: '40 sqm' },
    ],
    value: 128500, requiredBy: '2026-09-05', status: 'PO Issued',
  },
  {
    id: 'PR-2026-022', projectId: 'PRJ-2026-016', project: 'Hydraulic System Overhaul',
    requestedBy: 'Tsindikai Mudemba', supplier: 'Hydraulics Africa',
    items: [
      { description: 'Hydraulic Hose 1"', qty: '16 metres' },
      { description: 'Hydraulic Seal Kits', qty: '4 sets' },
    ],
    value: 18600, requiredBy: '2026-08-28', status: 'Received',
  },
  {
    id: 'PR-2026-021', projectId: 'PRJ-2026-018', project: 'Electrical Panel Upgrade',
    requestedBy: 'Joseph Mudemba', supplier: 'SA Panel Systems',
    items: [
      { description: 'Electrical Control Panel 400A', qty: '1 unit' },
    ],
    value: 68000, requiredBy: '2026-09-05', status: 'PO Issued',
  },
];

export const inventory: InventoryItem[] = [
  { item: '50mm Electrical Cable', category: 'Electrical', sku: 'EL-CAB-050', available: 340, reserved: 120, unit: 'metres', reorderLevel: 150, status: 'Available' },
  { item: 'MCCB 250A', category: 'Electrical', sku: 'EL-MCCB-250', available: 2, reserved: 4, unit: 'units', reorderLevel: 4, status: 'Shortage' },
  { item: 'Copper Pipe 22mm', category: 'HVAC', sku: 'HV-CP-022', available: 78, reserved: 20, unit: 'metres', reorderLevel: 30, status: 'Available' },
  { item: 'Hydraulic Hose 1"', category: 'Hydraulics', sku: 'HY-HOSE-100', available: 8, reserved: 4, unit: 'units', reorderLevel: 5, status: 'Low Stock' },
  { item: 'Cable Glands 50mm', category: 'Electrical', sku: 'EL-CG-050', available: 45, reserved: 30, unit: 'units', reorderLevel: 20, status: 'Available' },
  { item: 'Protection Relays', category: 'Electrical', sku: 'EL-PR-001', available: 1, reserved: 4, unit: 'units', reorderLevel: 3, status: 'Shortage' },
  { item: 'Conduit 25mm', category: 'Electrical', sku: 'EL-CON-025', available: 80, reserved: 60, unit: 'metres', reorderLevel: 40, status: 'Available' },
  { item: 'Welding Rods 3.2mm', category: 'Fabrication', sku: 'FB-WR-032', available: 120, reserved: 0, unit: 'kg', reorderLevel: 50, status: 'Available' },
  { item: 'Steel Plate 6mm', category: 'Fabrication', sku: 'FB-SP-006', available: 15, reserved: 0, unit: 'sheets', reorderLevel: 5, status: 'Available' },
  { item: 'Refrigerant R404A', category: 'HVAC', sku: 'HV-RF-404', available: 24, reserved: 0, unit: 'kg', reorderLevel: 10, status: 'Available' },
  { item: 'Hydraulic Fluid ISO 46', category: 'Hydraulics', sku: 'HY-FL-046', available: 180, reserved: 0, unit: 'litres', reorderLevel: 100, status: 'Available' },
  { item: 'Thermostat Digital', category: 'HVAC', sku: 'HV-TH-DIG', available: 10, reserved: 8, unit: 'units', reorderLevel: 5, status: 'Available' },
];

export const equipment: Equipment[] = [
  { name: 'Toyota Hilux — OML 01', type: 'Site Vehicle', availability: 'In Use', currentAssignment: 'Copperbelt Mining Services', nextAvailable: '15 Sep', condition: 'Good' },
  { name: 'Toyota Hilux — OML 02', type: 'Site Vehicle', availability: 'Available', currentAssignment: '—', nextAvailable: 'Now', condition: 'Good' },
  { name: 'Welding Machine 01', type: 'Fabrication', availability: 'Available', currentAssignment: '—', nextAvailable: 'Now', condition: 'Good' },
  { name: 'Welding Machine 02', type: 'Fabrication', availability: 'In Use', currentAssignment: 'Kitwe Industrial Processing', nextAvailable: '10 Sep', condition: 'Good' },
  { name: 'Generator 25kVA', type: 'Power', availability: 'Maintenance', currentAssignment: '—', nextAvailable: '4 Sep', condition: 'Maintenance Required' },
  { name: 'Crane Truck — OML 05', type: 'Transport', availability: 'In Use', currentAssignment: 'Zambezi Logistics', nextAvailable: '3 Sep', condition: 'Good' },
  { name: 'Flatbed Truck — OML 03', type: 'Transport', availability: 'In Use', currentAssignment: 'Zambezi Logistics', nextAvailable: '3 Sep', condition: 'Fair' },
  { name: 'Flatbed Truck — OML 04', type: 'Transport', availability: 'In Use', currentAssignment: 'Zambezi Logistics', nextAvailable: '3 Sep', condition: 'Good' },
];

export const labour: LabourResource[] = [
  { name: 'Joseph Mudemba', trade: 'Electrician / Supervisor', currentAssignment: 'Electrical Panel Upgrade', availability: 'Assigned', utilisation: 85 },
  { name: 'HVAC Team A', trade: 'HVAC Technicians', currentAssignment: 'HVAC Installation', availability: 'Assigned', utilisation: 70 },
  { name: 'Fabrication Team', trade: 'Fabricators / Welders', currentAssignment: '—', availability: 'Available', utilisation: 30 },
  { name: 'Kumwena Malezhi', trade: 'Mechanical / PM', currentAssignment: 'HVAC Installation', availability: 'Assigned', utilisation: 90 },
  { name: 'Hydraulics Team', trade: 'Hydraulic Technicians', currentAssignment: 'Hydraulic System Overhaul', availability: 'Assigned', utilisation: 75 },
  { name: 'General Labour Pool', trade: 'General Workers', currentAssignment: 'Various', availability: 'Assigned', utilisation: 65 },
];

export const invoices: Invoice[] = [
  {
    id: 'INV-2026-086', customer: 'Kafue Manufacturing Ltd', projectId: 'PRJ-2026-016', project: 'Hydraulic System Overhaul',
    invoiceDate: '2026-08-15', dueDate: '2026-08-18', amount: 84500, paid: 0, balance: 84500, status: 'Overdue', payments: [],
  },
  {
    id: 'INV-2026-087', customer: 'Zambezi Logistics', projectId: 'PRJ-2026-014', project: 'Transport & Labour Hire',
    invoiceDate: '2026-08-20', dueDate: '2026-09-03', amount: 42800, paid: 20000, balance: 22800, status: 'Partially Paid',
    payments: [{ date: '2026-08-25', amount: 20000, method: 'Bank Transfer', reference: 'ZL-PAY-0823' }],
  },
  {
    id: 'INV-2026-088', customer: 'Northgate Foods Zambia', projectId: 'PRJ-2026-015', project: 'Cold Room Compressor Repair',
    invoiceDate: '2026-08-26', dueDate: '2026-09-09', amount: 28500, paid: 0, balance: 28500, status: 'Sent', payments: [],
  },
  {
    id: 'INV-2026-085', customer: 'Kitwe Industrial Processing', project: 'Conveyor Belt Repair',
    invoiceDate: '2026-08-10', dueDate: '2026-08-24', amount: 36200, paid: 36200, balance: 0, status: 'Paid',
    payments: [{ date: '2026-08-22', amount: 36200, method: 'Bank Transfer', reference: 'KIP-PAY-0822' }],
  },
  {
    id: 'INV-2026-084', customer: 'Central Province Milling', project: 'Generator Maintenance',
    invoiceDate: '2026-08-05', dueDate: '2026-08-19', amount: 18600, paid: 18600, balance: 0, status: 'Paid',
    payments: [{ date: '2026-08-18', amount: 18600, method: 'Cheque', reference: 'CPM-CHQ-4521' }],
  },
];

export const documents: DocFile[] = [
  { name: 'Q-2026-041 — Electrical Panel Upgrade.pdf', type: 'Quotations', project: 'Electrical Panel Upgrade', date: '2026-08-28', size: '245 KB' },
  { name: 'Q-2026-040 — HVAC Installation.pdf', type: 'Quotations', project: 'HVAC Installation', date: '2026-08-27', size: '312 KB' },
  { name: 'PO-2026-028 — Panel Supply.pdf', type: 'Purchase Orders', project: 'Electrical Panel Upgrade', date: '2026-08-29', size: '128 KB' },
  { name: 'Customer PO — Copperbelt Mining.pdf', type: 'Customer POs', project: 'Electrical Panel Upgrade', date: '2026-08-30', size: '89 KB' },
  { name: 'Electrical Drawing — Main Panel.pdf', type: 'Drawings', project: 'Electrical Panel Upgrade', date: '2026-08-26', size: '1.2 MB' },
  { name: 'Site Inspection Report — Kitwe.pdf', type: 'Project Documents', project: 'Electrical Panel Upgrade', date: '2026-08-25', size: '456 KB' },
  { name: 'Safety Checklist — Electrical.pdf', type: 'Safety Documents', project: 'Electrical Panel Upgrade', date: '2026-08-28', size: '67 KB' },
  { name: 'INV-2026-086 — Kafue Manufacturing.pdf', type: 'Invoices', project: 'Hydraulic System Overhaul', date: '2026-08-15', size: '112 KB' },
  { name: 'INV-2026-087 — Zambezi Logistics.pdf', type: 'Invoices', project: 'Transport & Labour Hire', date: '2026-08-20', size: '98 KB' },
  { name: 'HVAC Layout — East Wing.pdf', type: 'Drawings', project: 'HVAC Installation', date: '2026-08-24', size: '2.1 MB' },
  { name: 'PO-2026-027 — CoolAir Zambia.pdf', type: 'Purchase Orders', project: 'HVAC Installation', date: '2026-08-26', size: '134 KB' },
  { name: 'Safety Checklist — Hydraulics.pdf', type: 'Safety Documents', project: 'Hydraulic System Overhaul', date: '2026-08-25', size: '54 KB' },
];

export const notifications = [
  { id: 1, message: 'Quotation Q-2026-041 expires in 3 days', time: '2 hours ago', type: 'warning' as const },
  { id: 2, message: 'Materials shortage detected for PRJ-2026-018', time: '3 hours ago', type: 'danger' as const },
  { id: 3, message: 'Invoice INV-2026-086 is overdue', time: '5 hours ago', type: 'danger' as const },
  { id: 4, message: 'Purchase Request PR-2026-024 requires approval', time: '6 hours ago', type: 'info' as const },
  { id: 5, message: 'Project PRJ-2026-016 at 78% completion', time: '1 day ago', type: 'success' as const },
];

// Chart data
export const monthlyQuotedWon = [
  { month: 'Jan', quoted: 420000, won: 310000 },
  { month: 'Feb', quoted: 380000, won: 280000 },
  { month: 'Mar', quoted: 510000, won: 350000 },
  { month: 'Apr', quoted: 460000, won: 390000 },
  { month: 'May', quoted: 590000, won: 420000 },
  { month: 'Jun', quoted: 520000, won: 380000 },
  { month: 'Jul', quoted: 640000, won: 490000 },
  { month: 'Aug', quoted: 710000, won: 450000 },
];

export const projectsByDepartment = [
  { name: 'Electrical', value: 3, color: '#d97520' },
  { name: 'HVAC', value: 2, color: '#4d659a' },
  { name: 'Mechanical', value: 2, color: '#535e78' },
  { name: 'Fabrication', value: 1, color: '#687591' },
  { name: 'Transport', value: 1, color: '#8793ab' },
];
