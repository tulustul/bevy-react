import { ExplanationData } from "@/explanationStore";
import { Code, CodeTabs } from "./Code";
import { P } from "./typography";

/**
 * Renders a doc entry's body: the rich `info` JSX when the page has migrated
 * to the docs kit, otherwise the legacy plain-string fields through the same
 * highlighted components — a TSX/Rust pair collapses into `CodeTabs`.
 */
export function InfoBody({ data }: { data: ExplanationData }) {
  if (data.info !== undefined) return <>{data.info}</>;
  return (
    <>
      {data.description !== undefined && <P>{data.description}</P>}
      {data.tsx !== undefined && data.rust !== undefined ? (
        <CodeTabs tsx={data.tsx} rust={data.rust} />
      ) : (
        <>
          {data.tsx !== undefined && <Code lang="tsx">{data.tsx}</Code>}
          {data.rust !== undefined && <Code lang="rust">{data.rust}</Code>}
        </>
      )}
    </>
  );
}
