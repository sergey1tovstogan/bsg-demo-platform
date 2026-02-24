import { renderHook, waitFor } from '@testing-library/react';
import { useTemplateParser } from './useTemplateParser';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('useTemplateParser', () => {
    beforeEach(() => {
        global.fetch = vi.fn();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    it('parses YAML from code blocks (literate format)', async () => {
        const mockContent = `
# My Card

\`\`\`yaml
card:
  id: "test-card"
  name: "Test Card"
\`\`\`
`;
        (global.fetch as any).mockResolvedValue({
            ok: true,
            text: async () => mockContent,
        });

        const { result } = renderHook(() => useTemplateParser());

        let cardData;
        await result.current.parseCard('test.md').then(data => {
            cardData = data;
        });

        expect(cardData).toEqual({
            id: 'test-card',
            name: 'Test Card'
        });
    });

    it('parses standard frontmatter', async () => {
        const mockContent = `---
card:
  id: "frontmatter-card"
  name: "Frontmatter Card"
---
# Content
`;
        (global.fetch as any).mockResolvedValue({
            ok: true,
            text: async () => mockContent,
        });

        const { result } = renderHook(() => useTemplateParser());

        let cardData;
        await result.current.parseCard('test.md').then(data => {
            cardData = data;
        });

        expect(cardData).toEqual({
            id: 'frontmatter-card',
            name: 'Frontmatter Card'
        });
    });

    it('throws error for missing card object', async () => {
        const mockContent = `
# Invalid Card
\`\`\`yaml
other_key: "value"
\`\`\`
`;
        (global.fetch as any).mockResolvedValue({
            ok: true,
            text: async () => mockContent,
        });

        const { result } = renderHook(() => useTemplateParser());

        await expect(result.current.parseCard('test.md')).rejects.toThrow('Invalid card format: missing card object');
    });
});
