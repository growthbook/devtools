import { useEffect } from "react";
import { Message } from "../../../../devtools";

/**
 * Use this hook to send messages to backaround script and to receive messages from it.
 */
export default function useMessage({
  messageHandler,
  outgoingMessage,
}: {
  messageHandler: (event: Message) => void;
  outgoingMessage: Message;
}) {
  useEffect(() => {
    const onMsg = (event: MessageEvent<Message>) => messageHandler(event.data);

    // process incoming messages
    window.addEventListener("message", onMsg);

    // send outgoing msg
    window.postMessage(outgoingMessage, "*");

    // clean up
    return () => window.removeEventListener("message", onMsg);
  }, []);
}
