import { redirect } from 'next/navigation';

export default function TodosHistoryPage() {
  redirect('/history?tab=daily');
}
