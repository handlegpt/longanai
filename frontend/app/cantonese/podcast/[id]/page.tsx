import PodcastDetailPage from '../../../podcast/[id]/page';

export default function CantonesePodcastDetailPage({ params }: { params: { id: string } }) {
  return <PodcastDetailPage params={params} />;
} 