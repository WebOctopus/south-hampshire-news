

## Plan: Implement Robust Post-Action UI Updates for Authentication Flows

### Problem Analysis

After investigating the codebase, I've identified the following issues causing the UI to not update immediately after authentication actions:

| Action | Current Behavior | Root Cause |
|--------|------------------|------------|
| **Login** | Form stays on "Signing In..." or doesn't navigate immediately | Navigation happens but components don't re-render with new auth state |
| **Register** | Form gets stuck, user unclear what happened | Email confirmation required but no clear UI feedback |
| **Logout** | Navigation updates open/closed states, but Navigation component might not update | `handleSignOut` navigates but other components may have stale state |
| **Password Reset** | After updating password, user has to manually navigate | Success state shown but no automatic sign-in or redirect |

### Root Causes

1. **Fragmented Auth State Management**: Multiple components (`Navigation.tsx`, `HeroSection.tsx`, `Auth.tsx`, `Dashboard.tsx`, etc.) each manage their own auth state independently with separate `onAuthStateChange` listeners

2. **No Centralized Auth Context**: Without a single source of truth, components can have stale or inconsistent auth states

3. **Missing Post-Action Navigation**: After successful actions, the app doesn't consistently redirect users to the appropriate destination

4. **No Loading/Success State Transitions**: Forms don't clearly transition from "loading" to "success" with appropriate feedback

---

### Solution Architecture

Create a centralized **Auth Context** that:
- Provides a single source of truth for authentication state
- Broadcasts auth changes to all components simultaneously
- Handles post-action navigation centrally
- Provides consistent loading and success states

---

### Implementation Steps

#### Step 1: Create Auth Context Provider

**New File: `src/contexts/AuthContext.tsx`**

This context will:
- Listen to `onAuthStateChange` once at the app level
- Store user, session, and loading states
- Provide helper functions for sign-in, sign-up, sign-out
- Handle navigation after auth actions automatically

```text
Key exports:
- AuthProvider (wrap App)
- useAuth() hook
- user, session, loading states
- signIn(), signUp(), signOut(), resetPassword() functions
```

#### Step 2: Update App.tsx

Wrap the application with `AuthProvider` so all components have access to the same auth state.

```text
Changes:
- Import AuthProvider
- Wrap BrowserRouter children with AuthProvider
```

#### Step 3: Refactor Auth.tsx (Login/Register Page)

Replace local auth handling with `useAuth()` hook:
- Use `signIn()` from context instead of direct Supabase calls
- Use `signUp()` from context
- Remove local `onAuthStateChange` listener
- Let context handle navigation after success

```text
Changes:
- Import useAuth hook
- Remove local loading states for auth actions (use context)
- Call context methods which handle navigation
```

#### Step 4: Refactor Navigation.tsx (Logout)

Replace local auth state with `useAuth()` hook:
- Use `user` from context
- Use `signOut()` from context
- Remove local `onAuthStateChange` listener

```text
Changes:
- Import useAuth hook
- Remove local user/isAdmin state and onAuthStateChange
- Use context's signOut() which handles navigation
```

#### Step 5: Update AuthPromptDialog.tsx

Use centralized auth for sign-in/register within the dialog:
- Use `useAuth()` hook methods
- Callback to parent on success for page-specific navigation

```text
Changes:
- Import useAuth hook
- Use context signIn/signUp methods
- Keep onSuccess callback for page-specific actions
```

#### Step 6: Update ResetPassword.tsx

After successful password update:
- Automatically redirect to dashboard after brief delay
- Or provide clear "Continue to Dashboard" button
- Sign the user in if they have a valid session already

```text
Changes:
- Add auto-redirect after password update
- Show countdown or "Continue" button
```

#### Step 7: Update Other Components Using Auth State

Update components that have their own auth listeners:
- `HeroSection.tsx`
- `BusinessCard.tsx`
- `BusinessDetail.tsx`
- `WhatsOn.tsx`
- `CostCalculator.tsx`
- `ProtectedRoute.tsx`
- `Dashboard.tsx`

```text
Changes for each:
- Remove local onAuthStateChange listeners
- Import and use useAuth() hook instead
- Components will automatically update when auth state changes
```

---

### Technical Implementation Details

**AuthContext.tsx Structure:**

```text
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: Error }>;
  signUp: (email: string, password: string, options?: SignUpOptions) => Promise<{ error?: Error; needsConfirmation?: boolean }>;
  signOut: () => Promise<void>;
}
```

**Key Design Decisions:**

1. **Single onAuthStateChange listener**: Set up once in AuthProvider, broadcasts to all consumers
2. **Deferred Supabase calls**: Per best practices, use `setTimeout(0)` for any Supabase calls inside the auth state change callback
3. **Navigation handled in context**: After sign-in, check role and navigate to appropriate dashboard; after sign-out, navigate to home
4. **Admin check cached**: Store isAdmin in context to avoid repeated database queries

---

### Files to Create

| File | Purpose |
|------|---------|
| `src/contexts/AuthContext.tsx` | Centralized auth state management |

### Files to Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Wrap with AuthProvider |
| `src/pages/Auth.tsx` | Use useAuth() hook, remove local state |
| `src/components/Navigation.tsx` | Use useAuth() hook, remove local listener |
| `src/components/AuthPromptDialog.tsx` | Use useAuth() hook methods |
| `src/pages/ResetPassword.tsx` | Add auto-redirect after success |
| `src/components/HeroSection.tsx` | Use useAuth() hook |
| `src/components/BusinessCard.tsx` | Use useAuth() hook |
| `src/pages/BusinessDetail.tsx` | Use useAuth() hook |
| `src/pages/WhatsOn.tsx` | Use useAuth() hook |
| `src/components/CostCalculator.tsx` | Use useAuth() hook |
| `src/components/ProtectedRoute.tsx` | Use useAuth() hook |
| `src/pages/Dashboard.tsx` | Use useAuth() hook |

---

### Expected Behavior After Implementation

| Action | New Behavior |
|--------|--------------|
| **Login** | Form shows loading, then immediately navigates to Dashboard (or Admin) |
| **Register** | Form shows loading, then shows confirmation message OR navigates if no email confirmation |
| **Logout** | Navigation immediately updates, user redirected to home page |
| **Password Reset** | After update, auto-redirect to Dashboard with "Password updated" toast |
| **All Components** | Update instantly when auth state changes - no refresh needed |

---

### Benefits

1. **Single Source of Truth**: No more inconsistent auth states across components
2. **Immediate UI Updates**: All components subscribe to the same state
3. **Better UX**: Clear loading states, success feedback, and automatic navigation
4. **Cleaner Code**: Remove duplicate auth logic from 10+ components
5. **Easier Maintenance**: Auth logic in one place

