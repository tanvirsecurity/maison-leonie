# Security Specification & Payload-First TDD

## Data Invariants
1. **Product Catalog**: Products are publicly readable (`allow read: if true`), but writes require a verified admin (`isBootstrapAdmin()`). Stock and pricing cannot be manipulated by regular shoppers.
2. **PII Isolation**: Customer personal data (`email`, `fullName`, `phone`, `totpSecret`, `addresses`) resides strictly under `/users/{userId}/private/*` and `/users/{userId}/addresses/*` and is accessible only to `isOwner(userId)` or `isBootstrapAdmin()`.
3. **Role Integrity**: On `/users/{userId}`, customers can only create documents with `role == 'customer'` and cannot escalate `role` to `'admin'` on update.
4. **Order Ownership & Terminal Locking**: Orders can only be created by verified authenticated users with `userId == request.auth.uid`, `status == 'confirmed'`, and server-enforced `createdAt == request.time`. Once an order transitions to `'delivered'` or `'cancelled'`, non-admin edits are blocked.
5. **Strict Input Bounds**: Every string field enforces `.size() <= MAX` and every bounded array enforces `.size() <= MAX`. Every single-document ID path variable enforces `isValidId()`.
6. **Secure List Queries**: Every `allow list` rule evaluates `resource.data` against `request.auth.uid` or `isBootstrapAdmin()` without delegating filtering to the client or performing `get()`/`exists()` inside `allow list`.

## Dirty Dozen Adversarial Payloads
1. **Unauthenticated Product Creation**: `create /products/fake` without auth -> `PERMISSION_DENIED`.
2. **Customer Product Price Tampering**: `update /products/oud-velours` as non-admin customer (`price: 1`) -> `PERMISSION_DENIED`.
3. **Self-Assigned Admin Escalation**: `create /users/attacker` with `{ uid: "attacker", role: "admin", ... }` -> `PERMISSION_DENIED`.
4. **Role Escalation via Update**: `update /users/attacker` changing `role` from `"customer"` to `"admin"` -> `PERMISSION_DENIED`.
5. **Shadow Field Injection on User Profile**: `update /users/user1` with extra ghost key `isVip: true` -> `PERMISSION_DENIED`.
6. **Cross-User PII Read**: `get /users/victim/private/profile` as `attacker` -> `PERMISSION_DENIED`.
7. **Cross-User Address Creation**: `create /users/victim/addresses/addr1` as `attacker` -> `PERMISSION_DENIED`.
8. **Order Identity Spoofing**: `create /orders/ord1` with `userId: "victim"` while signed in as `attacker` -> `PERMISSION_DENIED`.
9. **Order Status Shortcutting**: `create /orders/ord1` with `status: "delivered"` directly -> `PERMISSION_DENIED`.
10. **Timestamp Spoofing on Order**: `create /orders/ord1` with backdated `createdAt` (`!= request.time`) -> `PERMISSION_DENIED`.
11. **Oversized Review Comment (Denial of Wallet)**: `create /products/p1/reviews/r1` with 10KB `comment` string -> `PERMISSION_DENIED`.
12. **Unscoped List Query on Orders**: `list /orders` without matching `userId == request.auth.uid` as non-admin -> `PERMISSION_DENIED`.
