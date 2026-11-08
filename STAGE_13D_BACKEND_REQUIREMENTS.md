# Stage 13D Backend Requirements

## Missing API: Update CCCD Number

Currently, `StudentProfileUpdateRequest` does NOT support updating the `cic` (CCCD) field.

### Current Backend Status

**Student Entity:**
- ✅ Has `cic` field (String)

**StudentProfileResponse:**
- ✅ Returns `cic` in GET /student/profile

**StudentProfileUpdateRequest:**
- ❌ Does NOT include `cic` field
- Only supports: dateOfBirth, gender, address, avatarUrl, phone

### Required Backend Change

Add `cic` field to `StudentProfileUpdateRequest`:

```java
@Pattern(regexp = "^[0-9]{12}$", message = "Số CCCD phải là 12 chữ số")
private String cic;
```

### Impact

Without this backend change, the mobile app can:
- ✅ Display CCCD number from profile
- ✅ Capture CCCD photos using camera
- ✅ Pick CCCD documents from file system
- ❌ **Cannot save CCCD number to backend**

The mobile implementation shows a user-friendly message explaining that backend support is pending.

### Frontend Implementation Status

Mobile app (Stage 13D) includes:
- CCCD input screen with validation (12 digits)
- Camera integration for CCCD photo capture (front/back)
- Document picker for CCCD file selection
- User notification that backend update is not yet available

Once backend adds `cic` to `StudentProfileUpdateRequest`, mobile can immediately use the existing API endpoint (PATCH /student/profile) without additional mobile changes.
