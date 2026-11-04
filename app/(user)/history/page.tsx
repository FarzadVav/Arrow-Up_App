import { redirect } from 'next/navigation';

export default async function HistoryPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const sp = await searchParams;
  const tab = sp?.tab?.toLowerCase();

  if (tab === 'framework') {
    redirect('/framework/history');
  }
  if (tab === 'journals') {
    redirect('/journals/history');
  }
  if (tab === 'upcoming' || tab === 'missions') {
    redirect(`/todos/history?tab=${tab}`);
  }

  redirect('/todos/history');
}
