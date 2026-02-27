import { redirect } from 'next/navigation';

export default function Home() {
  // Primary entry point redirects to the community feed
  redirect('/feed');
}