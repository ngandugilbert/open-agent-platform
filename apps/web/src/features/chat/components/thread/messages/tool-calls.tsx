import { AIMessage, ToolMessage } from "@langchain/langgraph-sdk";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

function isComplexValue(value: any): boolean {
  return Array.isArray(value) || (typeof value === "object" && value !== null);
}

export function ToolCalls({
  toolCalls,
}: {
  toolCalls: AIMessage["tool_calls"];
}) {
  if (!toolCalls || toolCalls.length === 0) return null;

  return (
    <div className="w-full max-w-4xl space-y-4">
      {toolCalls.map((tc, idx) => {
        const args = tc.args as Record<string, any>;
        const hasArgs = Object.keys(args).length > 0;
        return (
          <div
            key={idx}
            className="overflow-hidden rounded-lg border border-border shadow-md transition-shadow hover:shadow-lg"
          >
            <div className="border-b border-border bg-accent px-4 py-2 text-accent-foreground">
              <h3 className="font-medium">
                {tc.name}
                {tc.id && (
                  <code className="ml-2 rounded bg-accent-foreground/10 px-2 py-1 text-sm text-accent-foreground">
                    {tc.id}
                  </code>
                )}
              </h3>
            </div>
            {hasArgs ? (
              <table className="min-w-full divide-y divide-border">
                <tbody className="divide-y divide-border">
                  {Object.entries(args).map(([key, value], argIdx) => (
                    <tr key={argIdx}>
                      <td className="px-4 py-2 text-sm font-medium whitespace-nowrap text-card-foreground">
                        {key}
                      </td>
                      <td className="px-4 py-2 text-sm text-muted-foreground">
                        {isComplexValue(value) ? (
                          <code className="rounded bg-muted px-2 py-1 font-mono text-sm break-all text-primary">
                            {JSON.stringify(value, null, 2)}
                          </code>
                        ) : (
                          String(value)
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <code className="block p-3 text-sm text-muted-foreground">{"{}"}</code>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function ToolResult({ message }: { message: ToolMessage }) {
  const [isExpanded, setIsExpanded] = useState(false);

  let parsedContent: any;
  let isJsonContent = false;

  try {
    if (typeof message.content === "string") {
      parsedContent = message.content;
    } else if (typeof message.content === "object") {
      if (Array.isArray(message.content) && message.content.length === 1) {
        parsedContent = message.content[0];
      } else {
        parsedContent = message.content;
      }
      isJsonContent = true;
    }
  } catch {
    // Content is not JSON, use as is
    parsedContent = message.content;
  }

  const contentStr = isJsonContent
    ? JSON.stringify(parsedContent, null, 2)
    : String(message.content);
  const contentLines = contentStr.split("\n");
  const shouldTruncate = contentLines.length > 4;
  const displayedContent =
    shouldTruncate && !isExpanded
      ? contentStr.length > 500
        ? contentStr.slice(0, 500) + "..."
        : contentLines.slice(0, 4).join("\n") + "\n..."
      : contentStr;

  return (
    <div className="w-full max-w-4xl overflow-hidden rounded-lg border border-border shadow-md transition-shadow hover:shadow-lg">
      <div className="border-b border-border bg-accent px-4 py-2 text-accent-foreground">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {message.name ? (
            <h3 className="font-medium">
              Tool Result:{" "}
              <code className="rounded bg-accent-foreground/10 px-2 py-1 text-accent-foreground">
                {message.name}
              </code>
            </h3>
          ) : (
            <h3 className="font-medium">Tool Result</h3>
          )}
          {message.tool_call_id && (
            <code className="ml-2 rounded bg-accent-foreground/10 px-2 py-1 text-sm text-accent-foreground">
              {message.tool_call_id}
            </code>
          )}
        </div>
      </div>
      <motion.div
        className="min-w-full bg-muted"
        initial={false}
        animate={{ height: "auto" }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-3">
          <AnimatePresence
            mode="wait"
            initial={false}
          >
            <motion.div
              key={isExpanded ? "expanded" : "collapsed"}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {isJsonContent ? (
                <table className="min-w-full divide-y divide-border overflow-x-auto">
                  <tbody className="divide-y divide-border">
                    {(Array.isArray(parsedContent)
                      ? isExpanded
                        ? parsedContent
                        : parsedContent.slice(0, 5)
                      : Object.entries(parsedContent)
                    ).map((item, argIdx) => {
                      const [key, value] = Array.isArray(parsedContent)
                        ? [argIdx, item]
                        : [item[0], item[1]];
                      return (
                        <tr key={argIdx}>
                          <td className="px-4 py-2 text-sm font-medium whitespace-nowrap text-card-foreground">
                            {key}
                          </td>
                          <td className="px-4 py-2 text-sm text-muted-foreground">
                            {isComplexValue(value) ? (
                              <code className="rounded bg-muted/50 px-2 py-1 font-mono text-sm break-all text-primary">
                                {JSON.stringify(value, null, 2)}
                              </code>
                            ) : (
                              String(value)
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <code className="block overflow-x-auto text-sm text-muted-foreground">
                  {displayedContent}
                </code>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        {((shouldTruncate && !isJsonContent) ||
          (isJsonContent &&
            Array.isArray(parsedContent) &&
            parsedContent.length > 5)) && (
          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex w-full cursor-pointer items-center justify-center border-t-[1px] border-border py-2 text-accent transition-all duration-200 ease-in-out hover:bg-accent/10 hover:text-accent-hover"
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}
