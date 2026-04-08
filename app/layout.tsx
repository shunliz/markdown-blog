import '@/styles/globals.css';
import Link from 'next/link';
import { getAllPosts } from '@/lib/markdown';
import path from 'path';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const posts = await getAllPosts('content/posts');

  // 构建树形结构
  const tree = buildTree(posts);

  return (
    <html lang="zh-CN">
      <head>
        <title>Markdown Blog</title>
      </head>
      <body className="h-screen flex flex-col overflow-hidden">
        {/* 顶部导航栏 */}
        <header className="bg-gray-800 text-white p-4">
          <div className="max-w-6xl mx-auto">
            <Link href="/" className="text-xl font-bold hover:text-gray-200">
              My Markdown Blog
            </Link>
          </div>
        </header>

        {/* 主内容区：左右两列 */}
        <div className="flex-1 flex">
          {/* 左侧树形菜单 */}
          <div className="w-[20%] border-r p-4 overflow-y-auto">
            <TreeView nodes={tree} />
          </div>

          {/* 右侧内容 */}
          <div className="flex-1 p-6 overflow-y-auto">
            {children}
          </div>
        </div>

        {/* 底部 */}
        <footer className="border-t p-4 text-center text-gray-500">
          {/* 底部预留 */}
        </footer>
      </body>
    </html>
  );
}

// 树形结构构建
type TreeNode = {
  name: string;
  path: string;
  children: TreeNode[];
};

function buildTree(posts: string[]): TreeNode[] {
  const root: TreeNode[] = [];

  posts.forEach(post => {
    const parts = post.split('/');
    let current = root;

    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1;
      const existing = current.find(node => node.name === part);

      if (existing) {
        current = existing.children;
      } else {
        const newNode: TreeNode = {
          name: part,
          path: isFile ? post : '',
          children: []
        };
        current.push(newNode);
        current = newNode.children;
      }
    });
  });

  return root;
}

// 树形菜单组件
function TreeView({ nodes }: { nodes: TreeNode[] }) {
  return (
    <ul className="space-y-1">
      {nodes.map((node, i) => (
        <TreeItem key={i} node={node} />
      ))}
    </ul>
  );
}

function TreeItem({ node }: { node: TreeNode }) {
  if (node.children.length === 0) {
    // 文件节点
    return (
      <li>
        <Link
          href={`/blog/${node.path}`}
          className="block py-1 px-2 hover:bg-gray-100 rounded"
        >
          {node.name}
        </Link>
      </li>
    );
  }

  // 文件夹节点
  return (
    <li>
      <details>
        <summary className="cursor-pointer py-1 px-2 hover:bg-gray-100 rounded font-medium">
          📁 {node.name}
        </summary>
        <ul className="ml-4 mt-1">
          {node.children.map((child, i) => (
            <TreeItem key={i} node={child} />
          ))}
        </ul>
      </details>
    </li>
  );
}