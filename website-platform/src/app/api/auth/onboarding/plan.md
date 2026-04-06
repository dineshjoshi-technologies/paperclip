# Plan: User Onboarding Flow (DJTAA-75)

## Current State
- Backend: Onboarding step tracking APIs exist (`/api/auth/onboarding`, `/api/auth/onboarding/step`)
- Frontend: 5-step wizard exists at `/onboarding/page.tsx`
- Components: GuidedTour, Tooltip, HelpCenter, EmptyState components exist
- Templates: 10 templates available from DJTAA-69

## Missing Pieces

### 1. Welcome Email with Activation Link
- **API**: `/api/auth/register` - Create user with verification token
- **API**: `/api/auth/verify-email` - Verify email address
- **Email Service**: Integration with email provider (nodemailer/sendgrid)
- **Email Template**: Welcome email with activation link

### 2. Connect Onboarding Wizard to Backend
- **API**: Endpoint to create website during onboarding (Step 2)
- **API**: Endpoint to fetch available templates (Step 3)
- **API**: Endpoint to apply template to website

### 3. Refine Wizard UX
- Connect Step 1 form to update user profile
- Connect Step 2 to create website API
- Connect Step 3 to template API
- Connect Step 4 to builder
- Connect Step 5 to publish

### 4. Progressive Disclosure
- Track which steps user has completed
- Allow skipping steps without losing progress

## Implementation Order

1. **Phase 1**: Welcome Email System
   - Add email verification token generation
   - Create register endpoint with welcome email
   - Create verify-email endpoint
   - Create email service utility

2. **Phase 2**: Onboarding API Enhancements
   - Create website during onboarding (Step 2)
   - Fetch templates for selection (Step 3)
   - Apply template to website

3. **Phase 3**: Frontend Integration
   - Connect forms to new APIs
   - Add proper loading states
   - Error handling

4. **Phase 4**: Polish
   - Milestone badges
   - Empty state improvements
   - Help center integration
