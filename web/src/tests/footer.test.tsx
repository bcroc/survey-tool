import { render, screen } from '@testing-library/react';
import App from '../App';

test('footer shows westcat logo and link', async () => {
  render(<App />);

  const img = await screen.findByAltText(/West Cat logo/i);
  expect(img).toBeInTheDocument();
  // src may be absolute or relative; check it includes the filename
  expect(img.getAttribute('src')?.includes('westcat')).toBe(true);
  // check width/height attributes (string values)
  expect(img.getAttribute('width')).toBe('32');
  expect(img.getAttribute('height')).toBe('32');

  const link = screen.getByRole('link', { name: /Built by West Cat Strategy Ltd./i });
  expect(link).toBeInTheDocument();
});
