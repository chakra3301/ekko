// Test stubs for portfolio upload helper
import {
  uploadPortfolioFile,
  validatePortfolioFile,
  type MediaType,
} from './portfolio-upload';

// Mock storage
jest.mock('./storage', () => ({
  getStorage: () => ({
    upload: jest.fn().mockResolvedValue('/storage/portfolio/test-file.jpg'),
    delete: jest.fn(),
    getSignedUrl: jest.fn().mockResolvedValue('/storage/portfolio/test-file.jpg?expires=123'),
    exists: jest.fn().mockResolvedValue(true),
  }),
}));

describe('portfolio-upload', () => {
  describe('validatePortfolioFile', () => {
    it('validates image file types', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const result = validatePortfolioFile(file, 'IMAGE');
      expect(result.valid).toBe(true);
    });

    it('rejects invalid image file type', () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const result = validatePortfolioFile(file, 'IMAGE');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid file type');
    });

    it('validates file size limit', () => {
      const largeFile = new File([new ArrayBuffer(60 * 1024 * 1024)], 'large.jpg', {
        type: 'image/jpeg',
      });
      const result = validatePortfolioFile(largeFile, 'IMAGE');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('File size exceeds');
    });
  });

  describe('uploadPortfolioFile', () => {
    it('uploads image file and returns mock URLs', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const result = await uploadPortfolioFile(file, 'IMAGE');

      expect(result.mediaUrl).toBeDefined();
      expect(result.thumbnailUrl).toBeDefined();
      expect(result.type).toBe('IMAGE');
      expect(result.fileName).toBe('test.jpg');
    });

    it('generates thumbnail URL for images', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const result = await uploadPortfolioFile(file, 'IMAGE');

      expect(result.thumbnailUrl).toBeDefined();
      expect(result.thumbnailUrl).toBe(result.mediaUrl); // For images, same URL in mock
    });

    it('returns placeholder thumbnail for videos', async () => {
      const file = new File(['test'], 'test.mp4', { type: 'video/mp4' });
      const result = await uploadPortfolioFile(file, 'VIDEO');

      expect(result.thumbnailUrl).toContain('/api/thumbnails/');
    });

    it('returns placeholder thumbnail for audio', async () => {
      const file = new File(['test'], 'test.mp3', { type: 'audio/mpeg' });
      const result = await uploadPortfolioFile(file, 'AUDIO');

      expect(result.thumbnailUrl).toContain('audio-placeholder');
    });
  });
});

