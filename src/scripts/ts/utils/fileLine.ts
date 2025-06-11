export function getFileLine() {
  if (import.meta.env.DEV) {
    const stack = new Error().stack?.split('\n')[2] || '';
    const match = stack.match(/\(?(.+):(\d+):(\d+)\)?$/);
    return {
      file: match?.[1] || 'unknown',
      line: match?.[2] || '0',
      column: match?.[3] || '0'
    };
  }
  return { file: 'production', line: '0', column: '0' };
}