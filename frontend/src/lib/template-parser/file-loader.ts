/**
 * File Loader
 * Browser-based file loading with caching for MD template files
 */

/**
 * FileLoader class - Handles loading and caching of template files
 *
 * Features:
 * - Browser-based fetch API
 * - Automatic caching for performance
 * - Library page resolution
 * - Error handling for 404s and network issues
 *
 * @example
 * ```typescript
 * const loader = new FileLoader();
 * const cardContent = await loader.loadCard('simple-card');
 * const pageContent = await loader.loadPage('/content/pages/intro.md');
 * const libraryContent = await loader.loadLibraryPage('intro/detailed-intro.md');
 * ```
 */
export class FileLoader {
  private cache: Map<string, string> = new Map();

  /**
   * Load a file from the given path
   *
   * @param filePath - Absolute or relative path to the file
   * @returns File content as string
   * @throws Error if file not found or network error
   */
  async loadFile(filePath: string): Promise<string> {
    // Normalize path
    const normalizedPath = filePath;

    // Check cache first
    if (this.cache.has(normalizedPath)) {
      return this.cache.get(normalizedPath)!;
    }

    try {
      // Fetch file
      const response = await fetch(normalizedPath);

      // Check if successful
      if (!response.ok) {
        throw new Error(
          `Failed to load file: ${normalizedPath} (${response.status} ${response.statusText})`
        );
      }

      // Get content
      const content = await response.text();

      // Cache it
      this.cache.set(normalizedPath, content);

      return content;
    } catch (error) {
      // Re-throw with helpful message
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Failed to load file: ${normalizedPath}`);
    }
  }

  /**
   * Load a card definition file
   *
   * @param cardId - Card ID (e.g., 'simple-card')
   * @returns Card definition file content
   *
   * @example
   * ```typescript
   * const content = await loader.loadCard('simple-card');
   * // Loads: /content/pages/cards/simple-card/card-definition.md
   * ```
   */
  async loadCard(cardId: string): Promise<string> {
    const path = `/content/pages/cards/${cardId}/card-definition.md`;
    return this.loadFile(path);
  }

  /**
   * Load a page file
   *
   * @param filePath - Path to page file (absolute or relative)
   * @returns Page file content
   *
   * @example
   * ```typescript
   * const content = await loader.loadPage('/content/pages/cards/simple-card/pages/intro.md');
   * ```
   */
  async loadPage(filePath: string): Promise<string> {
    return this.loadFile(filePath);
  }

  /**
   * Load a library page (reusable page)
   *
   * @param libraryPath - Path relative to library directory
   * @returns Library page content
   *
   * @example
   * ```typescript
   * const content = await loader.loadLibraryPage('intro/detailed-intro.md');
   * // Loads: /content/pages/library/intro/detailed-intro.md
   * ```
   */
  async loadLibraryPage(libraryPath: string): Promise<string> {
    const path = `/content/pages/library/${libraryPath}`;
    return this.loadFile(path);
  }

  /**
   * Clear the file cache
   *
   * Useful for development when files change frequently
   *
   * @example
   * ```typescript
   * loader.clearCache();
   * const freshContent = await loader.loadCard('simple-card');
   * ```
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Check if a file is cached
   *
   * @param filePath - File path to check
   * @returns True if file is in cache
   */
  isCached(filePath: string): boolean {
    return this.cache.has(filePath);
  }

  /**
   * Get cache size (number of cached files)
   *
   * @returns Number of files in cache
   */
  getCacheSize(): number {
    return this.cache.size;
  }

  /**
   * Preload multiple files in parallel
   *
   * @param filePaths - Array of file paths to preload
   * @returns Promise that resolves when all files are loaded
   *
   * @example
   * ```typescript
   * await loader.preloadFiles([
   *   '/content/pages/cards/simple-card/card-definition.md',
   *   '/content/pages/cards/simple-card/agenda.md',
   * ]);
   * ```
   */
  async preloadFiles(filePaths: string[]): Promise<void> {
    await Promise.all(filePaths.map((path) => this.loadFile(path)));
  }
}
