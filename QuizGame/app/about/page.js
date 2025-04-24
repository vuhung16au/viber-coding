import { redirect } from 'next/navigation';

export default function AboutPage() {
  // Redirect to the English version of the about page
  redirect('/en/about');
}