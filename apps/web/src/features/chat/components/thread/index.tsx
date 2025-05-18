import { v4 as uuidv4 } from "uuid";
import {
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import { cn } from "@/lib/utils";
import { useStreamContext } from "@/features/chat/providers/Stream";
import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Checkpoint, Message } from "@langchain/langgraph-sdk";
import {
  AssistantMessage,
  AssistantMessageLoading,
} from "@/features/chat/components/thread/messages/ai";
import { HumanMessage } from "@/features/chat/components/thread/messages/human";
import { LangGraphLogoSVG } from "@/components/icons/langgraph";
import { TooltipIconButton } from "@/components/ui/tooltip-icon-button";
import { ArrowDown, LoaderCircle, SquarePen, AlertCircle, SendHorizontal } from "lucide-react";
import { useQueryState, parseAsBoolean } from "nuqs";
import { StickToBottom, useStickToBottomContext } from "use-stick-to-bottom";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ensureToolCallsHaveResponses } from "@/features/chat/utils/tool-responses";
import { DO_NOT_RENDER_ID_PREFIX } from "@/constants";
import { useConfigStore } from "../../hooks/use-config-store";
import { useAuthContext } from "@/providers/Auth";
import { AgentsCombobox } from "@/components/ui/agents-combobox";
import { useAgentsContext } from "@/providers/Agents";
import { isUserSpecifiedDefaultAgent } from "@/lib/agent-utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function StickyToBottomContent(props: {
  content: ReactNode;
  footer?: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  const context = useStickToBottomContext();
  return (
    <div
      ref={context.scrollRef}
      style={{ width: "100%", height: "100%" }}
      className={props.className}
    >
      <div
        ref={context.contentRef}
        className={props.contentClassName}
      >
        {props.content}
      </div>

      {props.footer}
    </div>
  );
}

function ScrollToBottom(props: { className?: string }) {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();

  if (isAtBottom) return null;
  return (
    <Button
      variant="outline"
      className={props.className}
      onClick={() => scrollToBottom()}
    >
      <ArrowDown className="h-4 w-4" />
      <span>Scroll to bottom</span>
    </Button>
  );
}

function NewThreadButton(props: { hasMessages: boolean }) {
  const { agents, loading } = useAgentsContext();
  const [open, setOpen] = useState(false);

  const [agentId, setAgentId] = useQueryState("agentId");
  const [deploymentId, setDeploymentId] = useQueryState("deploymentId");
  const [_, setThreadId] = useQueryState("threadId");

  const handleNewThread = useCallback(() => {
    setThreadId(null);
  }, [setThreadId]);

  const isMac = useMemo(
    () => /(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent),
    [],
  );

  useLayoutEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.metaKey || e.ctrlKey) &&
        e.shiftKey &&
        e.key.toLocaleLowerCase() === "o"
      ) {
        e.preventDefault();
        handleNewThread();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNewThread]);

  const onAgentChange = useCallback(
    (v: string | string[] | undefined) => {
      const nextValue = Array.isArray(v) ? v[0] : v;
      if (!nextValue) return;

      const [agentId, deploymentId] = nextValue.split(":");
      setAgentId(agentId);
      setDeploymentId(deploymentId);
      setThreadId(null);
    },
    [setAgentId, setDeploymentId, setThreadId],
  );

  const agentValue =
    agentId && deploymentId ? `${agentId}:${deploymentId}` : undefined;

  useEffect(() => {
    if (agentValue || !agents.length) {
      return;
    }
    const defaultAgent = agents.find(isUserSpecifiedDefaultAgent);
    if (defaultAgent) {
      onAgentChange(
        `${defaultAgent.assistant_id}:${defaultAgent.deploymentId}`,
      );
    }
  }, [agents, agentValue, onAgentChange]);

  if (!props.hasMessages) {
    return (
      <AgentsCombobox
        agents={agents}
        agentsLoading={loading}
        value={agentValue}
        setValue={onAgentChange}
        open={open}
        setOpen={setOpen}
        triggerAsChild
        className="min-w-auto"
      />
    );
  }

  return (
    <div className="flex rounded-md shadow-sm hover:shadow-md transition-shadow">
      <AgentsCombobox
        agents={agents}
        agentsLoading={loading}
        value={agentValue}
        setValue={onAgentChange}
        open={open}
        setOpen={setOpen}
        triggerAsChild
        className="relative min-w-auto shadow-none focus-within:z-10 border-primary/20"
        style={{
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
          borderRight: 0,
        }}
        footer={
          <div className="text-secondary-foreground bg-secondary flex gap-2 p-3 pr-10 pb-3 text-xs">
            <SquarePen className="size-4 shrink-0 text-primary" />
            <span className="text-secondary-foreground mb-[1px] text-xs">
              Selecting a different agent will create a new thread.
            </span>
          </div>
        }
      />

      {props.hasMessages && (
        <TooltipIconButton
          size="lg"
          className="relative size-9 p-4 shadow-none focus-within:z-10 border-primary/20 hover:bg-secondary transition-colors"
          tooltip={
            isMac ? "New thread (Cmd+Shift+O)" : "New thread (Ctrl+Shift+O)"
          }
          variant="outline"
          onClick={handleNewThread}
          style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
        >
          <SquarePen className="size-4 text-primary" />
        </TooltipIconButton>
      )}
    </div>
  );
}

export function Thread() {
  const [agentId] = useQueryState("agentId");
  const [hideToolCalls, setHideToolCalls] = useQueryState(
    "hideToolCalls",
    parseAsBoolean.withDefault(false),
  );
  const [hasInput, setHasInput] = useState(false);
  const [firstTokenReceived, setFirstTokenReceived] = useState(false);

  const { session } = useAuthContext();

  const stream = useStreamContext();
  const messages = stream.messages;
  const isLoading = stream.isLoading;

  const lastError = useRef<string | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!stream.error) {
      lastError.current = undefined;
      setErrorMessage("");
      return;
    }
    try {
      const message = (stream.error as any).message;
      if (!message || lastError.current === message) {
        // Message has already been logged. do not modify ref, return early.
        return;
      }

      // Message is defined, and it has not been logged yet. Save it, and send the error
      lastError.current = message;
      setErrorMessage(message);
      toast.error("An error occurred. Please try again.", {
        description: (
          <p>
            <strong>Error:</strong> <code>{message}</code>
          </p>
        ),
        richColors: true,
        closeButton: true,
      });
    } catch {
      // no-op
    }
  }, [stream.error]);

  // TODO: this should be part of the useStream hook
  const prevMessageLength = useRef(0);
  useEffect(() => {
    if (
      messages.length !== prevMessageLength.current &&
      messages?.length &&
      messages[messages.length - 1].type === "ai"
    ) {
      setFirstTokenReceived(true);
    }

    prevMessageLength.current = messages.length;
  }, [messages]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const content = (formData.get("input") as string | undefined)?.trim() ?? "";

    setHasInput(false);

    if (!content || isLoading) return;
    if (!agentId) return;
    setFirstTokenReceived(false);

    const newHumanMessage: Message = {
      id: uuidv4(),
      type: "human",
      content,
    };

    const toolMessages = ensureToolCallsHaveResponses(stream.messages);
    const { getAgentConfig } = useConfigStore.getState();

    stream.submit(
      { messages: [...toolMessages, newHumanMessage] },
      {
        streamMode: ["values"],
        optimisticValues: (prev) => ({
          ...prev,
          messages: [
            ...(prev.messages ?? []),
            ...toolMessages,
            newHumanMessage,
          ],
        }),
        config: {
          configurable: getAgentConfig(agentId),
        },
        metadata: {
          supabaseAccessToken: session?.accessToken,
        },
        streamSubgraphs: true,
      },
    );

    form.reset();
  };

  const handleRegenerate = (
    parentCheckpoint: Checkpoint | null | undefined,
    optimisticValues?: (prev: { messages?: Message[] }) => {
      messages?: Message[] | undefined;
    },
  ) => {
    if (!agentId) return;
    const { getAgentConfig } = useConfigStore.getState();

    // Do this so the loading state is correct
    prevMessageLength.current = prevMessageLength.current - 1;
    setFirstTokenReceived(false);
    stream.submit(undefined, {
      checkpoint: parentCheckpoint,
      streamMode: ["values"],
      config: {
        configurable: getAgentConfig(agentId),
      },
      optimisticValues,
      metadata: {
        supabaseAccessToken: session?.accessToken,
      },
      streamSubgraphs: true,
    });
  };

  const hasMessages = messages.length > 0;
  const hasNoAIOrToolMessages = !messages.find(
    (m) => m.type === "ai" || m.type === "tool",
  );

  return (
    <div className="flex h-full w-full overflow-hidden">
      <StickToBottom className="relative flex-1 overflow-hidden">
        <StickyToBottomContent
          className={cn(
            "absolute inset-0 overflow-y-scroll px-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary/30 [&::-webkit-scrollbar-track]:bg-transparent",
            !hasMessages && "mt-[25vh] flex flex-col items-stretch",
            hasMessages && "grid grid-rows-[1fr_auto]",
          )}
          contentClassName="pt-8 pb-16 max-w-3xl mx-auto flex flex-col gap-6 w-full message-container"
          content={
            <>
              {messages
                .filter((m) => !m.id?.startsWith(DO_NOT_RENDER_ID_PREFIX))
                .map((message, index) =>
                  message.type === "human" ? (
                    <HumanMessage
                      key={message.id || `${message.type}-${index}`}
                      message={message}
                      isLoading={isLoading}
                    />
                  ) : (
                    <AssistantMessage
                      key={message.id || `${message.type}-${index}`}
                      message={message}
                      isLoading={isLoading}
                      handleRegenerate={handleRegenerate}
                    />
                  ),
                )}
              {/* Special rendering case where there are no AI/tool messages, but there is an interrupt.
                    We need to render it outside of the messages list, since there are no messages to render */}
              {hasNoAIOrToolMessages && !!stream.interrupt && (
                <AssistantMessage
                  key="interrupt-msg"
                  message={undefined}
                  isLoading={isLoading}
                  handleRegenerate={handleRegenerate}
                />
              )}
              {isLoading && !firstTokenReceived && <AssistantMessageLoading />}
              {errorMessage && (
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertTitle>An error occurred:</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
            </>
          }
          footer={
            <div className="sticky bottom-0 flex flex-col items-center gap-8 bg-background">
              {!hasMessages && (
                <div className="flex items-center gap-3">
                  <LangGraphLogoSVG className="h-8 flex-shrink-0 text-accent" />
                  <h1 className="text-2xl font-semibold tracking-tight text-primary">
                    IntelliChat
                  </h1>
                </div>
              )}

              <ScrollToBottom className="animate-in fade-in-0 zoom-in-95 absolute bottom-full left-1/2 mb-4 -translate-x-1/2" />

              <div className="bg-card relative z-10 mx-auto mb-8 w-full max-w-3xl rounded-2xl border border-primary/20 shadow-lg transition-shadow focus-within:shadow-xl focus-within:border-primary/40">
                <form
                  onSubmit={handleSubmit}
                  className="mx-auto grid max-w-3xl grid-rows-[1fr_auto] gap-2"
                >
                  <textarea
                    name="input"
                    onChange={(e) => setHasInput(!!e.target.value.trim())}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        !e.shiftKey &&
                        !e.nativeEvent.isComposing
                      ) {
                        e.preventDefault();
                        const el = e.target as HTMLElement | undefined;
                        const form = el?.closest("form");
                        form?.requestSubmit();
                      }
                    }}
                    placeholder="Type your message..."
                    className="field-sizing-content resize-none border-none bg-transparent p-4 pb-2 shadow-none ring-0 outline-none focus:ring-0 focus:outline-none text-base placeholder:text-foreground/40"
                  />

                  <div className="flex items-center justify-between p-3 pt-2 border-t border-primary/10">
                    <div>
                      <div className="flex items-center space-x-3">
                        <NewThreadButton hasMessages={hasMessages} />

                        <div className="flex items-center space-x-2 bg-primary/5 px-2 py-1 rounded-lg">
                          <Switch
                            id="render-tool-calls"
                            checked={hideToolCalls ?? false}
                            onCheckedChange={setHideToolCalls}
                          />
                          <Label
                            htmlFor="render-tool-calls"
                            className="text-sm text-foreground/80"
                          >
                            Hide Tool Calls
                          </Label>
                        </div>
                      </div>
                    </div>
                    {stream.isLoading ? (
                      <Button
                        key="stop"
                        variant="destructive"
                        onClick={() => stream.stop()}
                        className="shadow-md transition-all px-4 hover:-translate-y-0.5 duration-150 hover:shadow-lg"
                      >
                        <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                        Cancel
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        className="shadow-md transition-all px-5 hover:shadow-lg"
                        disabled={isLoading || !hasInput}
                      >
                        <SendHorizontal className="h-4 w-4 mr-2" />
                        <span>Send</span>
                      </Button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          }
        />
      </StickToBottom>
    </div>
  );
}
