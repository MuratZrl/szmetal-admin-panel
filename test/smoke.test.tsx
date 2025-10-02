// test/smoke.test.tsx
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

function ButtonDemo() {
  const [n, setN] = React.useState(0);
  return <button onClick={() => setN(v => v + 1)}>Clicks: {n}</button>;
}

it('buton sayaç artar', () => {
  render(<ButtonDemo />);
  const btn = screen.getByRole('button', { name: /Clicks:/i });
  fireEvent.click(btn);
  expect(btn).toHaveTextContent('Clicks: 1');
});
  