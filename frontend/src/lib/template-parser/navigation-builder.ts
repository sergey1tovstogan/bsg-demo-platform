/**
 * Navigation Builder
 *
 * Builds hierarchical navigation structure from flat page definitions.
 * Handles:
 * - Parent-child relationships
 * - Circular reference detection
 * - Orphaned page detection
 * - Breadcrumb generation
 * - Sibling finding
 */

import type {
  CardDefinition,
  PageDefinition,
  NavigationHierarchy,
  PageNode,
  Breadcrumb,
  Siblings,
} from '../template-types';

export class NavigationBuilder {
  /**
   * Build navigation hierarchy from flat page map
   *
   * @param card - Card definition
   * @param pages - Map of page ID to page definition
   * @returns Navigation hierarchy with nested page nodes
   * @throws Error if circular references or orphaned pages detected
   */
  buildHierarchy(card: CardDefinition, pages: Map<string, PageDefinition>): NavigationHierarchy {
    // Detect circular references before building
    this.detectCircularReferences(pages);

    // Detect orphaned pages
    this.detectOrphanedPages(pages);

    // Find root pages (parent is null or undefined)
    const rootPages = this.findRootPages(pages);

    // Build page nodes recursively
    const pageNodes = rootPages.map(page => this.buildPageNode(page, pages, null, 0));

    return {
      card,
      pages: pageNodes,
    };
  }

  /**
   * Find all root pages (pages with no parent)
   */
  private findRootPages(pages: Map<string, PageDefinition>): PageDefinition[] {
    const roots: PageDefinition[] = [];

    for (const page of pages.values()) {
      // Root pages have null or undefined parent
      if (page.parent === null || page.parent === undefined) {
        roots.push(page);
      }
    }

    return roots;
  }

  /**
   * Recursively build page node with children
   */
  private buildPageNode(
    page: PageDefinition,
    allPages: Map<string, PageDefinition>,
    parent: PageNode | null,
    level: number
  ): PageNode {
    // Build path array
    const path = parent ? [...parent.path, page.id] : [page.id];

    // Find children of this page
    const children = this.findChildren(page.id, allPages);

    // Create the node (without children first to avoid circular reference)
    const node: PageNode = {
      page,
      children: [],
      parent,
      level,
      path,
    };

    // Now recursively build children with reference to this node
    node.children = children.map(child => this.buildPageNode(child, allPages, node, level + 1));

    return node;
  }

  /**
   * Find all children of a page
   */
  private findChildren(pageId: string, pages: Map<string, PageDefinition>): PageDefinition[] {
    const children: PageDefinition[] = [];

    for (const page of pages.values()) {
      if (page.parent === pageId) {
        children.push(page);
      }
    }

    return children;
  }

  /**
   * Detect circular references in parent-child relationships
   * @throws Error if circular reference detected
   */
  private detectCircularReferences(pages: Map<string, PageDefinition>): void {
    for (const page of pages.values()) {
      const visited = new Set<string>();
      let current = page;

      while (current.parent) {
        // If we've visited this page already, we have a cycle
        if (visited.has(current.id)) {
          throw new Error(
            `Circular reference detected: Page "${page.id}" is part of a circular parent chain`
          );
        }

        visited.add(current.id);

        // Move to parent
        const parent = pages.get(current.parent);
        if (!parent) {
          break; // Will be caught by orphaned page detection
        }

        current = parent;

        // Safety check: if visited size exceeds page count, we have a cycle
        if (visited.size > pages.size) {
          throw new Error(
            `Circular reference detected: Page "${page.id}" has a circular parent relationship`
          );
        }
      }
    }
  }

  /**
   * Detect orphaned pages (pages with non-existent parent)
   * @throws Error if orphaned page detected
   */
  private detectOrphanedPages(pages: Map<string, PageDefinition>): void {
    for (const page of pages.values()) {
      // Skip root pages
      if (page.parent === null || page.parent === undefined) {
        continue;
      }

      // Check if parent exists
      if (!pages.has(page.parent)) {
        throw new Error(
          `Orphaned page detected: Page "${page.id}" has parent "${page.parent}" which does not exist`
        );
      }
    }
  }

  /**
   * Build breadcrumb trail for a page
   *
   * @param pageId - Page ID to build breadcrumbs for
   * @param hierarchy - Navigation hierarchy
   * @returns Array of breadcrumbs from root to current page
   */
  buildBreadcrumbs(pageId: string, hierarchy: NavigationHierarchy): Breadcrumb[] {
    const node = this.findNode(pageId, hierarchy);
    if (!node) {
      return [];
    }

    const breadcrumbs: Breadcrumb[] = [];
    let current: PageNode | null = node;

    // Walk up the tree to build breadcrumb trail
    while (current) {
      breadcrumbs.unshift({
        label: current.page.titles.breadcrumb,
        pageId: current.page.id,
        path: current.path.join('/'),
        icon: current.page.icon,
      });
      current = current.parent;
    }

    return breadcrumbs;
  }

  /**
   * Find a page node by ID in the hierarchy
   *
   * @param pageId - Page ID to find
   * @param hierarchy - Navigation hierarchy
   * @returns Page node or null if not found
   */
  findNode(pageId: string, hierarchy: NavigationHierarchy): PageNode | null {
    // Recursive search through all nodes
    const searchNodes = (nodes: PageNode[]): PageNode | null => {
      for (const node of nodes) {
        // Check if this is the node we're looking for
        if (node.page.id === pageId) {
          return node;
        }

        // Search children recursively
        const found = searchNodes(node.children);
        if (found) {
          return found;
        }
      }
      return null;
    };

    return searchNodes(hierarchy.pages);
  }

  /**
   * Find previous and next siblings for a page
   *
   * @param pageId - Page ID to find siblings for
   * @param hierarchy - Navigation hierarchy
   * @returns Object with previous and next sibling IDs (null if none)
   */
  findSiblings(pageId: string, hierarchy: NavigationHierarchy): Siblings {
    const node = this.findNode(pageId, hierarchy);
    if (!node) {
      return { previous: null, next: null };
    }

    // Find siblings (pages with same parent)
    let siblings: PageNode[];

    if (node.parent) {
      // Get siblings from parent's children
      siblings = node.parent.children;
    } else {
      // Root node - siblings are other root nodes
      siblings = hierarchy.pages;
    }

    // Find current page index in siblings
    const currentIndex = siblings.findIndex(sibling => sibling.page.id === pageId);

    if (currentIndex === -1) {
      return { previous: null, next: null };
    }

    return {
      previous: currentIndex > 0 ? siblings[currentIndex - 1].page.id : null,
      next: currentIndex < siblings.length - 1 ? siblings[currentIndex + 1].page.id : null,
    };
  }
}
