import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/requirements');
  return null;
}
