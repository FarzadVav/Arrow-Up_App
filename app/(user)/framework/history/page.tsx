import { redirect } from 'next/navigation';

export default function FrameworkHistoryPage() {
  redirect('/history?tab=framework');
}
