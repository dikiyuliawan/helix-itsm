import { KbArticle } from "@/components/kb/kb-article";

export default async function ArticlePage(props: PageProps<"/kb/[id]">) {
  const { id } = await props.params;
  return <KbArticle articleId={id} />;
}
