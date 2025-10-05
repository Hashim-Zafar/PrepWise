"use client";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Vapi from "@vapi-ai/web";

const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_WEB_TOKEN!);

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}
interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}
function Agent({ userName, userId, type }: AgentProps) {
  const router = useRouter();
  const [isSpeaking, SetIsSpeaking] = useState(false);
  const [callStatus, SetCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, Setmessages] = useState<SavedMessage[]>([]);

  useEffect(() => {
    //When call starts
    const onCallStart = () => SetCallStatus(CallStatus.ACTIVE);
    //When call ends
    const onCallEnd = () => SetCallStatus(CallStatus.FINISHED);
    //When a new message comes
    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = {
          role: message.role,
          content: message.transcript,
        };
        Setmessages((prev) => [...prev, newMessage]);
      }
    };
    //When the assistant is speaking
    const onSpeechStart = () => SetIsSpeaking(true);
    //When the assistant stops speaking
    const onSpeechEnd = () => SetIsSpeaking(false);
    //In case of an error
    const onError = (error: Error) => console.log(error);

    //Adding event listneres
    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    //Removing event listeners
    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, []);

  useEffect(() => {
    if (callStatus === CallStatus.FINISHED) router.push("/");
  }, [messages, callStatus, type, userId]);

  //Handle the call
  const handleCall = async () => {
    SetCallStatus(CallStatus.CONNECTING); // set the call status to connecting
    //start the call by giving it our workflow id
    await vapi.start(
      undefined, // assistant
      undefined, // assistantOverrides
      undefined, // squad
      process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, // workflow
      {
        variableValues: {
          username: userName,
          userid: userId,
        },
      } // workflowOverrides
    );
  };

  //Disocnnect call
  const handleDisconnect = async () => {
    SetCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  const LatestMessage = messages[messages.length - 1]?.content;

  const isInActiveOrFinished =
    callStatus === CallStatus.FINISHED || CallStatus.INACTIVE;

  return (
    <>
      <div className="call-view">
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="vapi"
              width={65}
              height={54}
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
        </div>

        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user-avatar.png"
              alt="profile-image"
              width={539}
              height={539}
              className="rounded-full object-cover size-[120px]"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p
              key={LatestMessage}
              className={cn(
                "transition-opacity duration-500 opacity-0",
                "animate-fadeIn opacity-100"
              )}
            >
              {LatestMessage}
            </p>
          </div>
        </div>
      )}

      <div className="w-full flex justify-center">
        {callStatus !== "ACTIVE" ? (
          <button className="relative btn-call" onClick={() => handleCall()}>
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== "CONNECTING" && "hidden"
              )}
            />

            <span className="relative">
              {callStatus === "INACTIVE" || callStatus === "FINISHED"
                ? "Call"
                : ". . ."}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={() => handleDisconnect()}>
            End
          </button>
        )}
      </div>
    </>
  );
}

export default Agent;
