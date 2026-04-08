import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export type Post = {
  slug: string;
  frontMatter: {
    title?: string;
    date?: string;
    [key: string]: any;
  };
  htmlContent: string;
};

export async function getPostBySlug(slug: string, dir = 'content/posts'): Promise<Post> {
  if (!slug) {
    throw new Error('Slug is required');
  }

  const fullPath = path.join(process.cwd(), dir, `${slug}.md`).replace(/\//g, path.sep);

  try {
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data: frontMatter, content } = matter(fileContents);

    const processedContent = await remark()
      .use(remarkMath)
      .use(html)
      .use(rehypeKatex)
      .process(content);
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