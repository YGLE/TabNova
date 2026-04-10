import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ParticlesBackground } from '@components/ParticlesBackground';

describe('ParticlesBackground', () => {
  it('renders a canvas element', () => {
    const { container } = render(<ParticlesBackground />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeTruthy();
  });

  it('canvas has correct styles', () => {
    const { container } = render(<ParticlesBackground />);
    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    expect(canvas).toBeTruthy();
    expect(canvas.style.position).toBe('absolute');
    expect(canvas.style.width).toBe('100%');
    expect(canvas.style.height).toBe('100%');
    expect(canvas.style.pointerEvents).toBe('none');
  });
});
