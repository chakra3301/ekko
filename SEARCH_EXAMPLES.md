# Search API Examples

## API Endpoint

```
GET /api/search/artists
```

## Query Parameters

- `q` - Search query (searches displayName and bio)
- `discipline` - Filter by discipline (array containment)
- `location` - Filter by location (city or country)
- `tool` - Filter by tool (array containment)
- `availability` - Filter by availability (OPEN, LIMITED, CLOSED)
- `verification` - Filter by verification tier (PLATINUM, BLACK, RED, NONE)
- `limit` - Number of results (default: 20, max: 50)
- `cursor` - Cursor for pagination

## Example Queries

### 1. Basic Search

```bash
curl "http://localhost:3000/api/search/artists?q=photography"
```

**Response**:
```json
{
  "artists": [
    {
      "id": "artist-1",
      "displayName": "Jane Doe Photography",
      "bio": "Professional photographer...",
      "locationCity": "New York",
      "locationCountry": "USA",
      "disciplines": ["Photography", "Portrait"],
      "tools": ["Camera", "Lightroom"],
      "availability": "OPEN",
      "verificationTier": "PLATINUM",
      "profileViews": 1234,
      "user": {
        "id": "user-1",
        "name": "Jane Doe",
        "email": "jane@example.com"
      }
    }
  ],
  "hasMore": true,
  "nextCursor": "artist-1"
}
```

### 2. Filter by Discipline

```bash
curl "http://localhost:3000/api/search/artists?discipline=Photography"
```

**What it does**: Uses PostgreSQL array containment (`has`) to find artists with "Photography" in their disciplines array.

### 3. Filter by Location

```bash
curl "http://localhost:3000/api/search/artists?location=New York"
```

**What it does**: Searches both `locationCity` and `locationCountry` fields.

### 4. Filter by Tool

```bash
curl "http://localhost:3000/api/search/artists?tool=Photoshop"
```

**What it does**: Uses PostgreSQL array containment (`has`) to find artists with "Photoshop" in their tools array.

### 5. Filter by Availability

```bash
curl "http://localhost:3000/api/search/artists?availability=OPEN"
```

**What it does**: Filters artists with `availability = OPEN`.

### 6. Filter by Verification Tier

```bash
curl "http://localhost:3000/api/search/artists?verification=PLATINUM"
```

**What it does**: Filters artists with `verificationTier = PLATINUM`.

### 7. Combined Filters

```bash
curl "http://localhost:3000/api/search/artists?discipline=Photography&location=New York&availability=OPEN&verification=PLATINUM"
```

**What it does**: Combines multiple filters with AND logic.

### 8. With Pagination

```bash
# First page
curl "http://localhost:3000/api/search/artists?limit=10"

# Next page (using cursor from previous response)
curl "http://localhost:3000/api/search/artists?limit=10&cursor=artist-10"
```

**What it does**: 
- First request returns 10 results and a `nextCursor`
- Second request uses the cursor to get the next 10 results

### 9. Search Query + Filters

```bash
curl "http://localhost:3000/api/search/artists?q=portrait&discipline=Photography&availability=OPEN"
```

**What it does**: Searches for "portrait" in displayName/bio AND filters by discipline and availability.

## Frontend Usage

### Navigate to Search Page

```
http://localhost:3000/search
```

### With Query Parameters

```
http://localhost:3000/search?q=photography&discipline=Photography&availability=OPEN
```

The search page will:
- Parse URL parameters
- Apply filters
- Display results
- Update URL when filters change

## PostgreSQL Array Containment

The API uses Prisma's `has` operator for array containment:

```typescript
// Discipline filter
where.disciplines = {
  has: discipline, // Equivalent to: WHERE 'Photography' = ANY(disciplines)
};

// Tool filter
where.tools = {
  has: tool, // Equivalent to: WHERE 'Photoshop' = ANY(tools)
};
```

This leverages PostgreSQL's native array support and GIN indexes for fast queries.

## Response Format

```typescript
{
  artists: ArtistSearchResult[];
  hasMore: boolean;
  nextCursor: string | null;
}
```

## Sorting

Results are sorted by:
1. `verificationTier` (desc) - Verified artists first
2. `profileViews` (desc) - Popular artists next
3. `createdAt` (desc) - Newest artists last

## Error Handling

- Invalid parameters are ignored
- Server errors return 500 with error message
- Empty results return empty array with `hasMore: false`

