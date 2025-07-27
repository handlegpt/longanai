import PodcastDetailPage from '../../../podcast/[id]/page';

export default function EnglishPodcastDetailPage({ params }: { params: { id: string } }) {
  return <PodcastDetailPage params={params} />;
} 