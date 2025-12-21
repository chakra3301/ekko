# Frontend Components Documentation

## Overview

This document describes the frontend components and pages created for the EKKO MVP artist profile system.

## Reusable Components

### Avatar (`components/ui/Avatar.tsx`)
Displays user profile picture or initials fallback.

**Props:**
- `src?: string | null` - Image URL
- `alt?: string` - Alt text
- `name?: string | null` - User name for initials
- `size?: 'sm' | 'md' | 'lg' | 'xl'` - Size variant
- `className?: string` - Additional CSS classes

**Usage:**
```tsx
<Avatar src="/avatar.jpg" name="John Doe" size="lg" />
```

### TagList (`components/ui/TagList.tsx`)
Displays an array of tags as chips.

**Props:**
- `tags: string[]` - Array of tag strings
- `variant?: 'default' | 'outline' | 'solid'` - Visual variant
- `size?: 'sm' | 'md'` - Size variant
- `maxTags?: number` - Maximum tags to display
- `className?: string` - Additional CSS classes

**Usage:**
```tsx
<TagList tags={['Photography', 'Design']} variant="outline" />
```

### MediaGrid (`components/ui/MediaGrid.tsx`)
Displays portfolio items in a responsive grid.

**Props:**
- `items: MediaItem[]` - Array of media items
- `columns?: 2 | 3 | 4` - Number of columns
- `onItemClick?: (item: MediaItem) => void` - Click handler
- `className?: string` - Additional CSS classes

**Usage:**
```tsx
<MediaGrid items={portfolioItems} columns={3} onItemClick={handleClick} />
```

### VerificationBadge (`components/ui/VerificationBadge.tsx`)
Displays artist verification tier.

**Props:**
- `tier: 'NONE' | 'RED' | 'BLACK' | 'PLATINUM'` - Verification tier
- `size?: 'sm' | 'md'` - Size variant
- `className?: string` - Additional CSS classes

**Usage:**
```tsx
<VerificationBadge tier="BLACK" />
```

### AvailabilityPill (`components/ui/AvailabilityPill.tsx`)
Displays artist availability status.

**Props:**
- `status: 'OPEN' | 'LIMITED' | 'CLOSED'` - Availability status
- `size?: 'sm' | 'md'` - Size variant
- `className?: string` - Additional CSS classes

**Usage:**
```tsx
<AvailabilityPill status="OPEN" />
```

## Portfolio Upload

### PortfolioUpload Component (`components/portfolio/PortfolioUpload.tsx`)
Handles file uploads with preview and validation.

**Props:**
- `onUpload: (media: UploadedMedia[]) => void` - Callback when files are uploaded
- `maxFiles?: number` - Maximum files allowed (default: 3)
- `required?: boolean` - Whether upload is required
- `className?: string` - Additional CSS classes

**Features:**
- File type validation (images, videos, audio)
- File size validation (max 50MB)
- Image previews
- Remove file functionality
- Upload progress indication

**Usage:**
```tsx
<PortfolioUpload
  onUpload={(media) => console.log('Uploaded:', media)}
  maxFiles={5}
  required
/>
```

### Portfolio Upload Helper (`lib/portfolio-upload.ts`)
Utility functions for portfolio file uploads.

**Functions:**
- `uploadPortfolioFile(file: File, type: MediaType): Promise<UploadedMedia>`
- `uploadPortfolioFiles(files: File[], types: MediaType[]): Promise<UploadedMedia[]>`
- `validatePortfolioFile(file: File, type: MediaType): { valid: boolean; error?: string }`

**Supported File Types:**
- Images: JPEG, PNG, GIF, WebP
- Videos: MP4, WebM
- Audio: MP3, WAV

## Pages

### Artist Onboarding (`app/(auth)/onboard/artist/page.tsx`)
5-step guided form for artist profile creation.

**Steps:**
1. Display Name
2. Disciplines (tags)
3. Bio (optional)
4. Tools (tags)
5. Portfolio & Availability

**Features:**
- Step-by-step progress indicator
- Client-side validation
- Portfolio upload integration
- Form state management
- API integration with `/api/onboarding/artist`

**Route:** `/onboard/artist`

### Public Artist Profile (`app/artist/[id]/page.tsx`)
Displays public artist profile with portfolio.

**Features:**
- Artist information display
- Portfolio grid
- Verification badge
- Availability status
- Disciplines and tools tags
- Profile statistics
- Message button

**Route:** `/artist/[id]`

## TypeScript Types

### Artist Types (`lib/types/artist.ts`)
- `ArtistProfile` - Artist profile data
- `PortfolioItem` - Portfolio item data
- `ArtistProfileWithPortfolio` - Combined type with portfolio

### Fixture Data (`lib/fixtures/artist.ts`)
Mock data for testing and development:
- `mockArtistProfile` - Example artist profile with portfolio

## Testing

### Test Stubs
Test files are located in `__tests__` directories:
- `components/ui/__tests__/Avatar.test.tsx`
- `components/ui/__tests__/TagList.test.tsx`
- `components/ui/__tests__/VerificationBadge.test.tsx`
- `components/ui/__tests__/AvailabilityPill.test.tsx`
- `components/portfolio/__tests__/PortfolioUpload.test.tsx`

**Run tests:**
```bash
npm test
npm run test:watch
npm run test:coverage
```

## Styling

All components use Tailwind CSS with:
- Responsive design (mobile-first)
- Accessible form controls
- Consistent color scheme
- Hover and focus states
- Dark mode support (via CSS variables)

## Dependencies

**Required packages:**
- `clsx` - Conditional class names
- `tailwind-merge` - Merge Tailwind classes
- `@testing-library/react` - Component testing
- `@testing-library/jest-dom` - DOM matchers
- `jest` - Test runner

**Install:**
```bash
npm install clsx tailwind-merge
npm install -D @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom
```

## Usage Examples

### Complete Onboarding Flow
```tsx
// User navigates to /onboard/artist
// Fills out 5-step form
// Uploads portfolio items
// Submits → Creates ArtistProfile via API
// Redirects to /artist/[id]
```

### Viewing Artist Profile
```tsx
// User navigates to /artist/[id]
// Server fetches artist data from database
// Renders profile with portfolio grid
// User can click "Message Artist" button
```

## Next Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Test components:**
   ```bash
   npm test
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Access onboarding:**
   - Navigate to: `http://localhost:3003/onboard/artist`

5. **View profile:**
   - Navigate to: `http://localhost:3003/artist/[artist-id]`

## Notes

- Portfolio uploads use local mock storage in development
- Images require Next.js Image component configuration for external URLs
- All components are fully typed with TypeScript
- Forms include client-side validation
- Components are accessible (ARIA labels, keyboard navigation)

