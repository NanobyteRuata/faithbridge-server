# Household Entity Implementation

## Overview

The Household entity has been successfully re-added to the FaithBridge Server application. This entity allows grouping profiles into households with a designated head of household and shared address.

## Database Schema

### Household Model

```prisma
model Household {
  id             Int          @id @default(autoincrement())
  organizationId Int
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  name        String
  description String?

  headProfileId Int?     @unique
  headProfile   Profile? @relation("HouseholdHead", fields: [headProfileId], references: [id], onDelete: SetNull)

  addressId Int?     @unique
  address   Address? @relation(fields: [addressId], references: [id], onDelete: SetNull)

  members Profile[] @relation("HouseholdMembers")

  createdById Int?
  createdBy   User?    @relation("HouseholdCreatedBy", fields: [createdById], references: [id], onDelete: SetNull)
  createdAt   DateTime @default(now())

  updatedById Int?
  updatedBy   User?    @relation("HouseholdUpdatedBy", fields: [updatedById], references: [id], onDelete: SetNull)
  updatedAt   DateTime @updatedAt

  @@unique([name, organizationId])
  @@index([organizationId])
  @@index([headProfileId])
}
```

### Relations

- **Organization**: Each household belongs to one organization (many-to-one)
- **Head Profile**: Optional one-to-one relation with a Profile as head of household
- **Address**: Optional one-to-one relation with an Address
- **Members**: One-to-many relation with Profiles (household members)
- **Created/Updated By**: Tracks who created and last updated the household

## API Endpoints

All endpoints require authentication and appropriate permissions (`PROFILE__VIEW` or `PROFILE__EDIT`).

### Create Household
- **Endpoint**: `POST /household`
- **Permission**: `PROFILE__EDIT`
- **Rate Limit**: 30 requests/min (Write)
- **Body**:
  ```json
  {
    "name": "Smith Family",
    "description": "The Smith household",
    "headProfileId": 1,
    "addressId": 5,
    "memberProfileIds": [1, 2, 3]
  }
  ```

### Get All Households
- **Endpoint**: `GET /household`
- **Permission**: `PROFILE__VIEW`
- **Rate Limit**: 100 requests/min (Read)
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `search`: Search by household name

### Get Single Household
- **Endpoint**: `GET /household/:id`
- **Permission**: `PROFILE__VIEW`
- **Rate Limit**: 100 requests/min (Read)

### Update Household
- **Endpoint**: `PATCH /household/:id`
- **Permission**: `PROFILE__EDIT`
- **Rate Limit**: 30 requests/min (Write)
- **Body**: Same as create (all fields optional)

### Delete Household
- **Endpoint**: `DELETE /household/:id`
- **Permission**: `PROFILE__EDIT`
- **Rate Limit**: 30 requests/min (Write)

## Features

### Multi-Tenancy
- All households are scoped to an organization
- Users can only access households within their organization

### Automatic Head Profile Inclusion
- **Important**: When a profile is set as `headProfile`, it is **automatically included** in the `members` array
- You don't need to manually add the head profile to `memberProfileIds`
- This ensures consistency: the head of household is always a member
- When updating members, the head profile is preserved in the members list

### Validation
- Head profile must exist and belong to the same organization
- Address must exist and belong to the same organization
- Household name must be unique within an organization

### Audit Trail
- Tracks who created the household (`createdBy`, `createdAt`)
- Tracks who last updated the household (`updatedBy`, `updatedAt`)

### Rate Limiting
- Read operations: 100 requests/min
- Write operations: 30 requests/min

## Migration

Migration file: `20251110063944_add_household_entity/migration.sql`

To apply the migration:
```bash
npx prisma migrate deploy
```

To regenerate Prisma Client:
```bash
npx prisma generate
```

## File Structure

```
src/features/household/
├── dto/
│   ├── request/
│   │   ├── create-household.dto.ts
│   │   └── update-household.dto.ts
│   └── query/
│       └── get-households.dto.ts
├── household.controller.ts
├── household.service.ts
└── household.module.ts
```

## Usage Examples

### Creating a Household

```typescript
POST /household
Authorization: Bearer <token>
x-org-code: MYORG

{
  "name": "Johnson Family",
  "description": "Main household",
  "headProfileId": 10,
  "addressId": 25,
  "memberProfileIds": [11, 12]  // Profile 10 (head) is automatically included
}
```

**Note**: Profile #10 will be automatically added to members even though it's not in `memberProfileIds`.

### Searching Households

```typescript
GET /household?search=Johnson&page=1&limit=10
Authorization: Bearer <token>
x-org-code: MYORG
```

### Updating Household Members

```typescript
PATCH /household/5
Authorization: Bearer <token>
x-org-code: MYORG

{
  "memberProfileIds": [10, 11, 12, 13]  // Add new member
}
```

## Relationship with Group System

The Household entity coexists with the Group system:
- **Households**: Family-based grouping with head of household and shared address
- **Groups**: Flexible grouping system with types, roles, and memberships

Both systems can be used simultaneously to organize profiles in different ways.

## Notes

- A profile can be the head of only one household (one-to-one relation)
- A profile can be a member of only one household at a time
- An address can be linked to only one household
- Deleting a household does not delete its members or address
- Setting `headProfileId` or `addressId` to `null` disconnects the relation

## Future Enhancements

Potential improvements:
1. Household history tracking (move-in/move-out dates)
2. Household roles beyond "head" (spouse, child, etc.)
3. Multiple addresses per household (primary, secondary)
4. Household-level permissions and privacy settings
5. Bulk operations for household management
