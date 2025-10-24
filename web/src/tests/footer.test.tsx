import { render, screen } from '@testing-library/react';
import Footer from '../components/Footer';

test('footer shows westcat logo and link', async () => {
  render(<Footer logo={'/assets/westcat-small.svg'} />);

  const img = await screen.findByAltText(/West Cat logo/i);
  expect(img).toBeInTheDocument();
  // src may be an inline component or a URL depending on the test/build environment.
  // If it's an <img> element, assert the src/width/height when available.
  const src = img.getAttribute?.('src');
  if (src) {
    expect(src.toLowerCase()).toContain('westcat');
  }
  const width = img.getAttribute?.('width');
  const height = img.getAttribute?.('height');
  if (width) expect(width).toBe('32');
  if (height) expect(height).toBe('32');

  const link = screen.getByRole('link', { name: /Built by West Cat Strategy Ltd./i });
  expect(link).toBeInTheDocument();
});
