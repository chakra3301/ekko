// Example fixture data for testing and development
import type { ArtistProfileWithPortfolio } from '@/lib/types/artist';

export const mockArtistProfile: ArtistProfileWithPortfolio = {
  id: 'clx1234567890',
  userId: 'clx0987654321',
  displayName: 'John Doe Photography',
  bio: 'Professional photographer specializing in portrait and event photography. 10+ years of experience capturing memorable moments.',
  locationCity: 'San Francisco',
  locationCountry: 'United States',
  disciplines: ['Photography', 'Portrait Photography', 'Event Photography'],
  tools: ['Canon EOS R5', 'Adobe Lightroom', 'Adobe Photoshop'],
  availability: 'OPEN',
  verificationTier: 'BLACK',
  profileViews: 1250,
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-20'),
  portfolioItems: [
    {
      id: 'clx111',
      artistId: 'clx1234567890',
      type: 'IMAGE',
      title: 'Portrait Session',
      description: 'Professional headshot session',
      mediaUrl: '/portfolio/portrait-1.jpg',
      thumbnailUrl: '/portfolio/portrait-1-thumb.jpg',
      createdAt: new Date('2024-01-16'),
      updatedAt: new Date('2024-01-16'),
    },
    {
      id: 'clx222',
      artistId: 'clx1234567890',
      type: 'VIDEO',
      title: 'Wedding Highlights',
      description: 'Wedding ceremony highlights reel',
      mediaUrl: '/portfolio/wedding-video.mp4',
      thumbnailUrl: '/portfolio/wedding-thumb.jpg',
      createdAt: new Date('2024-01-17'),
      updatedAt: new Date('2024-01-17'),
    },
    {
      id: 'clx333',
      artistId: 'clx1234567890',
      type: 'IMAGE',
      title: 'Corporate Event',
      description: 'Corporate event photography',
      mediaUrl: '/portfolio/corporate-1.jpg',
      thumbnailUrl: '/portfolio/corporate-1-thumb.jpg',
      createdAt: new Date('2024-01-18'),
      updatedAt: new Date('2024-01-18'),
    },
  ],
  user: {
    id: 'clx0987654321',
    name: 'John Doe',
    email: 'john@example.com',
  },
};

