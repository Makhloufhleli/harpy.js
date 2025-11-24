'use client';

import React from 'react';

function AboutCounter() {
  const [count, setCount] = React.useState(0);
  return (
    <div>
      <h1>Counter: {count}</h1>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

export default AboutCounter;
