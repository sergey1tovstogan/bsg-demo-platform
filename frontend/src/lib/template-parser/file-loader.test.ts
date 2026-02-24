/**
 * File Loader Tests (TEST FIRST!)
 * Testing browser-based file loading with caching
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FileLoader } from './file-loader';

// Mock fetch globally
global.fetch = vi.fn();

describe('FileLoader', () => {
  let loader: FileLoader;

  beforeEach(() => {
    loader = new FileLoader();
    loader.clearCache();
    vi.clearAllMocks();
  });

  describe('Basic File Loading', () => {
    it('should load a file successfully', async () => {
      const mockContent = `---
card:
  id: "test-card"
---
Content`;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => mockContent,
      });

      const content = await loader.loadFile('/content/pages/test.md');

      expect(content).toBe(mockContent);
      expect(global.fetch).toHaveBeenCalledWith('/content/pages/test.md');
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should handle 404 errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(loader.loadFile('/nonexistent.md')).rejects.toThrow('404');
    });

    it('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(loader.loadFile('/test.md')).rejects.toThrow('Network error');
    });

    it('should load multiple files', async () => {
      const content1 = 'File 1 content';
      const content2 = 'File 2 content';

      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          text: async () => content1,
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => content2,
        });

      const result1 = await loader.loadFile('/file1.md');
      const result2 = await loader.loadFile('/file2.md');

      expect(result1).toBe(content1);
      expect(result2).toBe(content2);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Caching', () => {
    it('should cache files after first load', async () => {
      const mockContent = 'Cached content';

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => mockContent,
      });

      // First load - should fetch
      const first = await loader.loadFile('/test.md');
      expect(first).toBe(mockContent);
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Second load - should use cache
      const second = await loader.loadFile('/test.md');
      expect(second).toBe(mockContent);
      expect(global.fetch).toHaveBeenCalledTimes(1); // Still 1!
    });

    it('should return same object reference for cached files', async () => {
      const mockContent = 'Content';

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => mockContent,
      });

      const first = await loader.loadFile('/test.md');
      const second = await loader.loadFile('/test.md');

      expect(first).toBe(second); // Same reference
    });

    it('should clear cache when requested', async () => {
      const mockContent = 'Content';

      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          text: async () => mockContent,
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => mockContent,
        });

      // Load and cache
      await loader.loadFile('/test.md');
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Clear cache
      loader.clearCache();

      // Load again - should fetch
      await loader.loadFile('/test.md');
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should cache multiple files independently', async () => {
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          text: async () => 'Content 1',
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => 'Content 2',
        });

      await loader.loadFile('/file1.md');
      await loader.loadFile('/file2.md');

      // Load from cache
      const cached1 = await loader.loadFile('/file1.md');
      const cached2 = await loader.loadFile('/file2.md');

      expect(cached1).toBe('Content 1');
      expect(cached2).toBe('Content 2');
      expect(global.fetch).toHaveBeenCalledTimes(2); // Only initial loads
    });
  });

  describe('Card Loading', () => {
    it('should load card definition', async () => {
      const mockContent = `---
card:
  id: "test-card"
  name: "Test Card"
---`;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => mockContent,
      });

      const content = await loader.loadCard('test-card');

      expect(content).toBe(mockContent);
      expect(global.fetch).toHaveBeenCalledWith(
        '/content/pages/cards/test-card/card-definition.md'
      );
    });

    it('should handle card not found', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(loader.loadCard('nonexistent')).rejects.toThrow();
    });
  });

  describe('Page Loading', () => {
    it('should load page by path', async () => {
      const mockContent = `---
page:
  id: "test-page"
---`;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => mockContent,
      });

      const content = await loader.loadPage(
        '/content/pages/cards/test-card/pages/page1.md'
      );

      expect(content).toBe(mockContent);
    });

    it('should handle relative paths', async () => {
      const mockContent = 'Page content';

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => mockContent,
      });

      const content = await loader.loadPage('pages/intro.md');

      expect(content).toBe(mockContent);
      expect(global.fetch).toHaveBeenCalledWith('pages/intro.md');
    });
  });

  describe('Library Page Loading', () => {
    it('should load library page', async () => {
      const mockContent = `---
page:
  id: "library-intro"
---`;

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => mockContent,
      });

      const content = await loader.loadLibraryPage('intro/detailed-intro.md');

      expect(content).toBe(mockContent);
      expect(global.fetch).toHaveBeenCalledWith(
        '/content/pages/library/intro/detailed-intro.md'
      );
    });

    it('should handle library page not found', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(
        loader.loadLibraryPage('nonexistent/page.md')
      ).rejects.toThrow();
    });

    it('should cache library pages', async () => {
      const mockContent = 'Library content';

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => mockContent,
      });

      await loader.loadLibraryPage('intro/test.md');
      await loader.loadLibraryPage('intro/test.md');

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    it('should provide helpful error for 404', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      try {
        await loader.loadFile('/missing.md');
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error.message).toContain('404');
        expect(error.message).toContain('/missing.md');
      }
    });

    it('should provide helpful error for network failure', async () => {
      (global.fetch as any).mockRejectedValueOnce(
        new Error('Failed to fetch')
      );

      try {
        await loader.loadFile('/test.md');
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error.message).toContain('Failed to fetch');
      }
    });

    it('should handle empty response', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => '',
      });

      const content = await loader.loadFile('/empty.md');
      expect(content).toBe('');
    });
  });

  describe('Performance', () => {
    it('should load file quickly with cache', async () => {
      const mockContent = 'Content';

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => mockContent,
      });

      // First load
      const start1 = performance.now();
      await loader.loadFile('/test.md');
      const duration1 = performance.now() - start1;

      // Cached load
      const start2 = performance.now();
      await loader.loadFile('/test.md');
      const duration2 = performance.now() - start2;

      // Cached load should be much faster (<1ms typically)
      expect(duration2).toBeLessThan(duration1);
      expect(duration2).toBeLessThan(5); // Should be nearly instant
    });
  });

  describe('Path Normalization', () => {
    it('should handle paths with or without leading slash', async () => {
      const mockContent = 'Content';

      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          text: async () => mockContent,
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => mockContent,
        });

      const result1 = await loader.loadFile('/test.md');
      const result2 = await loader.loadFile('test.md');

      expect(result1).toBe(mockContent);
      expect(result2).toBe(mockContent);
    });

    it('should handle card ID normalization', async () => {
      const mockContent = 'Card content';

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        text: async () => mockContent,
      });

      await loader.loadCard('simple-card');

      expect(global.fetch).toHaveBeenCalledWith(
        '/content/pages/cards/simple-card/card-definition.md'
      );
    });
  });

  describe('Batch Loading', () => {
    it('should load multiple files in parallel', async () => {
      const contents = ['File 1', 'File 2', 'File 3'];

      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          text: async () => contents[0],
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => contents[1],
        })
        .mockResolvedValueOnce({
          ok: true,
          text: async () => contents[2],
        });

      const results = await Promise.all([
        loader.loadFile('/file1.md'),
        loader.loadFile('/file2.md'),
        loader.loadFile('/file3.md'),
      ]);

      expect(results).toEqual(contents);
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });
  });
});
