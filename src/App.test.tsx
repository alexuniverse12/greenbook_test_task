import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('should render the correct sorting options', () => {
    render(<App />);

    if(screen.getByText('Loading, wait please')) return;

    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('Kudos')).toBeInTheDocument();
    expect(screen.getByText('Level')).toBeInTheDocument();
  });
});