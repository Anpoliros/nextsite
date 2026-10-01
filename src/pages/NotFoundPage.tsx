/** 未找到页面：静态服务和开发预览共用的错误页面。 */
import PageShell from '@/components/layout/PageShell';
export default function NotFoundPage() {
  return <PageShell><section className="py-16"><h1 className="text-3xl font-bold mb-6">404 · 页面不存在</h1><a href="/" className="text-blue-500 hover:underline">返回首页</a></section></PageShell>;
}
