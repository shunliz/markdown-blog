import { getPostBySlug } from '@/lib/markdown';

type BlogPostProps = {
  params: Promise<{
    slug: string[];
  }>;
};

export default async function BlogPost({ params }: BlogPostProps) {
  const { slug } = await params;
  const slugPath = slug.map(s => decodeURIComponent(s)).join('/');
  try {
    const post = await getPostBySlug(slugPath);

    return (
      <div className="prose mx-auto max-w-3xl p-4">
        <h1>{post.frontMatter.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: post.htmlContent }} />
      </div>
    );
  } catch (error) {
    console.error('Failed to load post:', error);
    return <div>Error loading post</div>;
  }
}

export async function generateStaticParams() {
  const fs = require('fs');
  const path = require('path');

  const posts: string[] = [];

  function getAllFiles(dirPath: string) {
    const files = fs.readdirSync(dirPath);
    files.forEach((file) => {
      const filePath = path.join(dirPath, file);
      if (fs.statSync(filePath).isDirectory()) {
        getAllFiles(filePath);
      } else if (file.endsWith('.md')) {
        const relativePath = path.relative(path.join(process.cwd(), 'content/posts'), filePath);
        posts.push(relativePath.replace(/\.md$/, ''));
      }
    });
  }

  getAllFiles(path.join(process.cwd(), 'content/posts'));

  return posts.map((slug) => ({
    slug: slug.split(path.sep),
  }));
}
