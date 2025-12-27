"use client";

import { Button } from '@impulsar/ui';

export function InteractiveButtons() {
  return (
    <div className="flex gap-4">
      <Button variant="primary" onClick={() => alert('¡Hola desde el monorepo!')}>
        Primary Button
      </Button>
      <Button variant="secondary">
        Secondary Button
      </Button>
    </div>
  );
}
