import { redirect } from 'next/navigation';

export default function JournalsHistoryPage() {
  redirect('/history?tab=journals');
}
