# KidVenture Pass - Partner Dashboard MVP

A premium, production-ready partner dashboard for kids activity studios to manage their sessions, check-ins, and earnings with KidVenture Pass.

## Features

### 🔐 Authentication
- **Login** (`/login`) - Email/password authentication
- **Forgot Password** (`/forgot-password`) - Password reset request
- **Reset Password** (`/reset-password`) - Set new password from email link
- **Email Verification** (`/verify-email`) - Verify email address
- **Accept Invite** (`/signup`) - Staff invitation acceptance flow
- **Role-based Access** - Only partner_staff and partner_manager roles can access

### 🏠 Dashboard (`/partner`)
- Summary cards showing today's sessions, monthly check-ins, estimated earnings, and payout status
- Quick action links for common tasks
- Stripe Connect setup status and prompts

### 📅 Calendar (`/partner/calendar`)
- Day, Week, and Month view options
- Create new sessions with class template, location, date/time, and capacity settings
- **Recurring sessions** - Daily, Weekly, or Custom day patterns
- Edit existing session details (time, capacity, status)
- Close bookings for sessions
- **Security:** Partners cannot edit attendance or booking status

### 📱 Scanner (`/partner/scanner`)
- Paste/scan booking token input
- Real-time check-in validation
- Clear success/error/duplicate states
- Booking details display on successful check-in
- **Security:** Check-in is the only action available

### 📋 Attendance (`/partner/attendance`)
- Read-only list of check-in records
- Filterable by date range, location, and class
- Request dispute functionality with reason selection
- **Security:** Partners cannot edit attendance records

### 📊 Analytics (`/partner/analytics`)
- Monthly performance reports
- Overview metrics with month-over-month comparison
- Weekly check-in trends
- Top performing classes
- Location breakdown
- Peak check-in times with insights

### 💰 Earnings (`/partner/earnings`)
- Estimated earnings for selected period
- Breakdown by session with check-in counts
- Payout history with status tracking
- Clear disclaimer about settlement rules
- **Security:** All financial data is read-only

### ⚙️ Settings (`/partner/settings`)
- Edit organization display name
- View locations (contact support to modify)
- Staff management (invite/remove)
- Stripe Connect status and setup

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **Auth:** Supabase Auth with middleware protection
- **Icons:** Lucide React
- **Date Handling:** date-fns

## Project Structure

```
src/
├── app/
│   ├── (auth)/                 # Auth routes (grouped)
│   │   ├── layout.tsx          # Auth pages layout
│   │   ├── login/
│   │   ├── forgot-password/
│   │   ├── reset-password/
│   │   ├── verify-email/
│   │   └── signup/
│   ├── partner/                # Protected partner routes
│   │   ├── layout.tsx          # Partner layout with sidebar & RBAC
│   │   ├── page.tsx            # Dashboard home
│   │   ├── calendar/
│   │   ├── scanner/
│   │   ├── attendance/
│   │   ├── analytics/
│   │   ├── earnings/
│   │   └── settings/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Root redirect
│   └── globals.css
├── components/
│   ├── ui/                     # Reusable UI components
│   ├── layout/                 # Layout components
│   └── partner/                # Partner-specific components
├── hooks/
│   └── use-auth.tsx            # Auth context & hook
├── lib/
│   ├── api.ts                  # API client
│   ├── mock-data.ts            # Mock data
│   ├── supabase.ts             # Supabase client
│   └── utils.ts                # Utilities
├── middleware.ts               # Route protection middleware
└── types/
    └── index.ts                # TypeScript interfaces
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase project (for production)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd kidventure-partner-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Edit `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_USE_MOCK_DATA=true  # Set to false for production
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Authentication Flow

### Login Flow
1. User enters email/password on `/login`
2. Supabase validates credentials
3. Middleware checks for `partner_staff` or `partner_manager` role
4. Redirects to `/partner` dashboard on success

### Password Reset Flow
1. User clicks "Forgot password?" on login page
2. Enters email on `/forgot-password`
3. Receives email with reset link
4. Clicks link, redirected to `/reset-password`
5. Sets new password and redirected to dashboard

### Staff Invite Flow
1. Manager invites staff via Settings page
2. Staff receives email with invite link
3. Clicks link, redirected to `/signup`
4. Enters name and sets password
5. Account created with appropriate role

### Supabase Setup

For production, configure these in your Supabase project:

1. **Auth Settings:**
   - Enable Email provider
   - Set Site URL to your domain
   - Add redirect URLs for auth callbacks

2. **User Metadata:**
   Users need these claims (set via admin API or database triggers):
   ```json
   {
     "role": "partner_staff" | "partner_manager",
     "partner_org_id": "org_xxx",
     "first_name": "John",
     "last_name": "Doe"
   }
   ```

3. **Email Templates:**
   Customize the invite, reset password, and verification emails in Supabase dashboard.

## Mock Data Mode

For development without Supabase:

```env
NEXT_PUBLIC_USE_MOCK_DATA=true
```

Features:
- Auto-login with mock partner user
- Sample sessions, check-ins, earnings data
- Demo login button on login page
- All CRUD operations work with mock responses

## Security & RBAC

### Route Protection
- Middleware protects `/partner/*` routes
- Redirects unauthenticated users to `/login`
- Redirects authenticated users away from auth pages

### Role Requirements
- `partner_staff` - Basic access to all partner features
- `partner_manager` - Additional access to staff management, settings

### Security Boundaries
Partners **cannot**:
- Mark attendance manually
- Edit check-in records after submission
- Modify booking status
- Set payout amounts
- Access admin controls

## Customization

### Brand Colors
```
Adventure Orange: #E07856
Explorer Teal: #2B8B81
Deep Play Blue: #1A3A52
Warm Cream: #F5E8E0
```

### Adding New Routes
1. Create folder under `src/app/partner/`
2. Add `page.tsx` file
3. Update `src/components/layout/sidebar.tsx`

## Production Build

```bash
npm run build
npm start
```

## License

Proprietary - KidVenture Pass

---

Built with ❤️ for kids activity studios
