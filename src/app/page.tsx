import { redirect } from 'next/navigation';

export default function Home() {
  // Root redirects to partner dashboard
  // Auth check happens in the partner layout
  redirect('/partner');
}
