// test/setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.mock('__FILE_LINE__', () => ({
	file: 'test-file',
	line: '1',
}));
