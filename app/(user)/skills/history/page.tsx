import { redirect } from 'next/navigation';

export default function SkillsHistoryPage() {
  redirect('/history?tab=skills');
}
