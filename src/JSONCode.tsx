import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { ghcolors as codeTheme } from "react-syntax-highlighter/dist/esm/styles/prism";
import stringify from "json-stringify-pretty-compact";

codeTheme['pre[class*="language-"]'].padding = "0.25em 0.5em";
codeTheme['pre[class*="language-"]'].margin = "0";

export default function JSONCode({code}: {code: any}) {
  return (
    <SyntaxHighlighter
    language="json"
    style={codeTheme}
  >
    {stringify(code)}
  </SyntaxHighlighter>
  )
}