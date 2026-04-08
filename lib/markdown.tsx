import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

export type Post = {
  slug: string;
  frontMatter: {
    title: string;
    date: string;
    // 其他 frontMatter 字段...
  };
  htmlContent: string;
};

export async function getPostBySlug(slug: string, dir = 'content/posts'): Promise<Post> {
  if (!slug) {
    throw new Error('Slug is required');
  }

  const fullPath = path.join(process.cwd(), dir, `${slug}.md`).replace(/\//g, path.sep);
  console.log('Reading file:', fullPath); // 调试：检查路径是否正确

  try {
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data: frontMatter, content } = matter(fileContents);

    const processedContent = await remark().use(html).process(content);
    const htmlContent = processedContent.toString();

    return {
      slug,
      frontMatter,
      htmlContent,
    };
  } catch (error) {
    console.error('Error reading Markdown file:', error);
    throw error;
  }
}


export async function getAllPosts(dir = 'content/posts') {
  const posts: string[] = [];

  function getAllFiles(dirPath: string) {
    const files = fs.readdirSync(dirPath);
    files.forEach((file) => {
      const filePath = path.join(dirPath, file);
      if (fs.statSync(filePath).isDirectory()) {
        getAllFiles(filePath);
      } else if (file.endsWith('.md')) {
        const relativePath = path.relative(dir, filePath);
        posts.push(relativePath.replace(/\.md$/, '').replace(/\\/g, '/'));
      }
    });
  }

  getAllFiles(path.join(process.cwd(), dir));
  return posts;
}