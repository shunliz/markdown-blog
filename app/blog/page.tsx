import Link from 'next/link';
import { getAllPosts } from '@/lib/markdown';

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <div className="mx-auto max-w-3xl p-4">
      <h1>目录</h1>
      <ul>
        {posts.map((slug) => (
          <li key={slug}>
            <Link href={`/blog/${slug}`}>{slug}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
