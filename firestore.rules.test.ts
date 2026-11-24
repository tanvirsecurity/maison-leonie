/**
 * Firestore Security Rules Test Specification (Dirty Dozen Adversarial Suite)
 * Run against Firebase Emulator Suite when validating locally.
 */
export const DIRTY_DOZEN_CASES = [
  {
    id: 1,
    name: 'Unauthenticated Product Creation',
    path: '/products/fake',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Customer Product Price Tampering',
    path: '/products/voie-dor',
    operation: 'update',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Self-Assigned Admin Escalation',
    path: '/users/attacker',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Role Escalation via Update',
    path: '/users/attacker',
    operation: 'update',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Shadow Field Injection on User Profile',
    path: '/users/user1',
    operation: 'update',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Cross-User PII Read',
    path: '/users/victim/private/profile',
    operation: 'get',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Cross-User Address Creation',
    path: '/users/victim/addresses/addr1',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Order Identity Spoofing',
    path: '/orders/ord1',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Order Status Shortcutting',
    path: '/orders/ord1',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Timestamp Spoofing on Order',
    path: '/orders/ord1',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Oversized Review Comment',
    path: '/products/voie-dor/reviews/r1',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Unscoped List Query on Orders',
    path: '/orders',
    operation: 'list',
    expected: 'PERMISSION_DENIED',
  },
];
