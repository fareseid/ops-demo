// Shared dropdown option sets for creation/edit forms

export const CATEGORIES = ['Electrical', 'HVAC', 'Mechanical', 'Hydraulics', 'Fabrication', 'Transport', 'Civil', 'General'];

export const PRIORITIES = ['Low', 'Normal', 'Medium', 'High', 'Urgent'] as const;

export const STAFF = [
  'Tsindikai Mudemba',
  'Joseph Mudemba',
  'Kumwena Malezhi',
  'Joseph M.',
  'Tsindikai M.',
  'Kumwena M.',
];

export const OWNERS = ['Tsindikai', 'Joseph', 'Kumwena'];

export const PROJECT_MANAGERS = ['Joseph Mudemba', 'Kumwena Malezhi', 'Tsindikai Mudemba'];

export const PAYMENT_TERMS = [
  '30 days from invoice',
  '14 days from invoice',
  '50% advance, 50% on completion',
  'Cash on delivery',
  '60 days from invoice',
];

export const UNITS = ['unit', 'units', 'metres', 'litres', 'kg', 'sets', 'set', 'lot', 'sqm', 'days', 'trips', 'man-days', 'hours', 'sheets'];

export const SUPPLIERS = [
  'Zambia Industrial Electricals',
  'CoolAir Zambia Ltd',
  'Hydraulics Africa',
  'SA Panel Systems',
  'Copperbelt Hardware',
  'Lusaka Steel Supplies',
];

export const PROJECT_STATUSES = ['Planning', 'Awaiting Materials', 'In Progress', 'On Hold', 'Completed'] as const;

export const PROJECT_TASK_STATUSES = ['Not Started', 'In Progress', 'Complete'] as const;

export const EQUIPMENT_TYPES = ['Site Vehicle', 'Transport', 'Fabrication', 'Power', 'Lifting', 'Tools'];
export const EQUIPMENT_AVAILABILITY = ['Available', 'In Use', 'Maintenance'] as const;
export const EQUIPMENT_CONDITION = ['Good', 'Fair', 'Maintenance Required'] as const;

export const LABOUR_AVAILABILITY = ['Available', 'Assigned', 'On Leave'] as const;

export const PAYMENT_METHODS = ['Bank Transfer', 'Cheque', 'Cash', 'Mobile Money'];

export const DOCUMENT_TYPES = ['Quotations', 'Purchase Orders', 'Customer POs', 'Drawings', 'Project Documents', 'Safety Documents', 'Invoices', 'Contracts', 'Other'];
