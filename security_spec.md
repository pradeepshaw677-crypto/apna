# Security Specification - Apna Bazar E-Commerce

## 1. Data Invariants
1. A user cannot modify another user's profile, address, cart, or wishlist.
2. An order can only be created by the authenticated user whose `request.auth.uid == incoming().userId`.
3. Order financial values (`totalAmount`, `itemTotal`) must be valid numbers greater than or equal to 0.
4. An order's `orderStatus` once `cancelled` or `delivered` cannot be reverted or changed by non-admins.
5. Users cannot elevate their own role to 'admin'; roles can only be granted via backend or explicit admin rules.
6. Public catalog (`products`) is readable by everyone, but can only be modified or created by authorized administrators.
7. Reviews must have a valid rating between 1 and 5 and `userId` matching `request.auth.uid`.
8. PII such as full address lists and phone numbers are isolated and restricted to the document owner (`request.auth.uid == userId`).

## 2. Dirty Dozen Payloads (Designed to Fail)
1. **Ghost Field Spoof**: Adding `isAdmin: true` to a user document update payload. -> Must fail.
2. **Order Hijack**: Creating an order with `userId: "victim_123"` when authenticated as `attacker_456`. -> Must fail.
3. **Price Manipulation**: Creating an order with negative `itemTotal: -500`. -> Must fail.
4. **Catalog Defacement**: Unauthenticated or normal user attempting to update or delete a product document. -> Must fail.
5. **Junk ID Poisoning**: Using a 50KB string as an `orderId` or `productId`. -> Must fail `isValidId()`.
6. **Cross-User Address Snooping**: Attempting to read `/users/user_abc/private/data` when auth.uid is `user_xyz`. -> Must fail.
7. **Negative Review Rating**: Submitting a review with `rating: -1` or `rating: 10`. -> Must fail.
8. **Impersonated Review**: Submitting a review with someone else's `userId`. -> Must fail.
9. **Tampering Completed Orders**: Updating shipping address or total on an order that is already `delivered`. -> Must fail.
10. **Arbitrary Collection Write**: Writing to an arbitrary collection like `/malicious_payload`. -> Must fail catch-all.
11. **Timestamp Backdating**: Passing a fabricated timestamp instead of server time. -> Must fail temporal check.
12. **Array Overflow Exploit**: Submitting an array of 5,000 items in a single document update. -> Must fail array size bound.
