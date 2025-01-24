import React, { useEffect, useRef, useState } from "react";
import { Video, VideoOff } from "lucide-react";

interface VideoStreamProps {
  socket: any;
  isStreaming: boolean;
  setIsStreaming: (value: boolean) => void;
}

const VideoStream: React.FC<VideoStreamProps> = ({ 
  socket, 
  isStreaming, 
  setIsStreaming 
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [streamError, setStreamError] = useState<string | null>(null);

  useEffect(() => {
    const handleVideoChunk = (chunk:Int32ArrayConstructor) => {
      try {
        if (!imgRef.current) return;
        setIsStreaming(true);

        // Convert buffer to base64
        const base64 = btoa(
            //@ts-ignore
          new Uint8Array(chunk).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ''
          )
        );
        
        imgRef.current.src = `data:image/jpeg;base64,${base64}`;
      } catch (error) {
        console.error('Error processing stream chunk:', error);
        setStreamError(`Error processing stream: ${error}`);
      }
    };

    const handleStreamError = (error: string) => {
      console.error('Stream error:', error);
      setStreamError(error);
      setIsStreaming(false);
    };

    const handleStreamEnd = () => {
      console.log('Stream ended');
      setIsStreaming(false);
    };

    // Setup socket listeners
    socket.on('video_chunk', handleVideoChunk);
    socket.on('stream_error', handleStreamError);
    socket.on('stream_end', handleStreamEnd);

    // Cleanup function
    return () => {
      socket.off('video_chunk', handleVideoChunk);
      socket.off('stream_error', handleStreamError);
      socket.off('stream_end', handleStreamEnd);
      setIsStreaming(false);
    };
  }, [socket, setIsStreaming]);

  return (
    <div className="relative bg-black rounded-lg overflow-hidden h-full w-full">
      <img
        ref={imgRef}
        className="w-full h-full object-contain"
        alt="Stream view"
      />

      {!isStreaming && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <VideoOff className="w-16 h-16 mx-auto mb-2" />
            <p>Waiting for stream...</p>
          </div>
        </div>
      )}

      {streamError && (
        <div className="absolute bottom-0 left-0 right-0 bg-red-500 text-white p-2 text-sm">
          {streamError}
          <button 
            onClick={() => setStreamError(null)}
            className="ml-2 underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {isStreaming && (
        <div className="absolute top-2 right-2 bg-red-500 px-2 py-1 rounded-md flex items-center gap-1">
          <Video className="w-4 h-4" />
          <span className="text-sm">Live</span>
        </div>
      )}
    </div>
  );
};

export default VideoStream;