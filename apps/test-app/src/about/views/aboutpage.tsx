import React from 'react';
import AboutCounter from './about-counter';
import ColorChangeComponent from './color-change';

export interface PageProps {
  title: string;
  items: string[];
}

export default function Page({ title, items }: PageProps) {
  return (
    <div className="container">
      {title}, We have {items.length} items <br />
      <AboutCounter />
      <ColorChangeComponent />
      <a href="/">Back to home page</a>
    </div>
  );
}
