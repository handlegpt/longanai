import PodcastDetailPage from '../../../podcast/[id]/page';

export default function ChinesePodcastDetailPage({ params }: { params: { id: string } }) {
  return <PodcastDetailPage params={params} />;
} 