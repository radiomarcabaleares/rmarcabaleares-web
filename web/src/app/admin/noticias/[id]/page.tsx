'use client';

import { useParams } from 'next/navigation';
import NewsEditor from '@/components/admin/NewsEditor';

export default function EditNoticiaPage() {
  const params = useParams();
  const id = params.id as string;
  return <NewsEditor newsId={id} />;
}
