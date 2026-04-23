import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypePrettyCode from 'rehype-pretty-code';

const md = `\`\`\`
const x = 1;
\`\`\``;

const processor = unified()
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypePrettyCode, {
    theme: {
      light: "github-light",
      dark: "github-dark",
    },
    defaultLang: { block: "text" },
    keepBackground: true,
  })
  .use(rehypeStringify);

console.log(String(await processor.process(md)));
