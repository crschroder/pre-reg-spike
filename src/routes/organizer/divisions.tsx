import { createFileRoute } from '@tanstack/react-router';
import { DivisionDraw } from '@/components/Organizer/DivisionDraw';

export const Route = createFileRoute('/organizer/divisions')({
  component: DivisionDraw,
});
