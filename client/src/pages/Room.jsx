import React, { useEffect, useCallback, useState } from "react";
import ReactPlayer from "react-player";
import peer from "../services/Peer";
import { useSocket } from "../providers/Socket";
import { Video, Mic, MicOff, VideoOff, Phone, PhoneOff, Users, Share, MessageSquare } from "lucide-react";

const RoomPage = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isCalling, setIsCalling] = useState(false);

  // Existing callback handlers remain the same
  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} joined room`);
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    setIsCalling(true);
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
  }, [remoteSocketId, socket]);

  // All other existing handlers remain the same...
  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      console.log(`Incoming Call`, from, offer);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      console.log("Call Accepted!");
      sendStreams();
      setIsCalling(false);
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("GOT TRACKS!!");
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
  ]);

  // New handlers for audio/video controls
  const toggleAudio = useCallback(() => {
    if (myStream) {
      const audioTrack = myStream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsAudioEnabled(audioTrack.enabled);
    }
  }, [myStream]);

  const toggleVideo = useCallback(() => {
    if (myStream) {
      const videoTrack = myStream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoEnabled(videoTrack.enabled);
    }
  }, [myStream]);

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Header remains the same */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-800">
        <div className="flex items-center">
          <Video className="w-8 h-8 text-blue-500 mr-2" />
          <h1 className="text-xl font-bold text-white">MeetUp Room</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-gray-700 px-3 py-1 rounded-lg">
            <Users className="w-5 h-5 text-gray-400 mr-2" />
            <span className="text-gray-300">
              {remoteSocketId ? "2 participants" : "1 participant"}
            </span>
          </div>
          <div className={`px-3 py-1 rounded-lg flex items-center ${
            remoteSocketId ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'
          }`}>
            <span className="text-sm font-medium">
              {remoteSocketId ? "Connected" : "Waiting for others"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content - Updated video container styling */}
      <div className="flex-1 p-6 flex flex-col lg:flex-row gap-6">
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {myStream && (
            <div className="relative rounded-xl overflow-hidden bg-gray-800 aspect-video">
              <div className="absolute inset-0">
                <ReactPlayer
                  playing
                  muted
                  height="100%"
                  width="100%"
                  url={myStream}
                  style={{ objectFit: 'cover' }}
                  config={{
                    file: {
                      attributes: {
                        style: {
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }
                      }
                    }
                  }}
                />
              </div>
              <div className="absolute bottom-4 left-4 bg-gray-900 bg-opacity-75 px-3 py-1 rounded-lg">
                <span className="text-white text-sm">You</span>
              </div>
            </div>
          )}
          
          {remoteStream && (
            <div className="relative rounded-xl overflow-hidden bg-gray-800 aspect-video">
              <div className="absolute inset-0">
                <ReactPlayer
                  playing
                  height="100%"
                  width="100%"
                  url={remoteStream}
                  style={{ objectFit: 'cover' }}
                  config={{
                    file: {
                      attributes: {
                        style: {
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }
                      }
                    }
                  }}
                />
              </div>
              <div className="absolute bottom-4 left-4 bg-gray-900 bg-opacity-75 px-3 py-1 rounded-lg">
                <span className="text-white text-sm">Remote User</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls section remains the same */}
      <div className="bg-gray-800 px-6 py-4">
        <div className="flex justify-center items-center space-x-4">
          <button
            onClick={toggleAudio}
            className={`p-4 rounded-full transition-colors duration-200 ${
              isAudioEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            {isAudioEnabled ? (
              <Mic className="w-6 h-6 text-white" />
            ) : (
              <MicOff className="w-6 h-6 text-white" />
            )}
          </button>
          
          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-colors duration-200 ${
              isVideoEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            {isVideoEnabled ? (
              <Video className="w-6 h-6 text-white" />
            ) : (
              <VideoOff className="w-6 h-6 text-white" />
            )}
          </button>

          {remoteSocketId && !myStream && (
            <button
              onClick={handleCallUser}
              className={`p-4 rounded-full transition-colors duration-200 ${
                isCalling ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              <Phone className="w-6 h-6 text-white" />
            </button>
          )}

          {myStream && (
            <button
              onClick={sendStreams}
              className="p-4 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors duration-200"
            >
              <Share className="w-6 h-6 text-white" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomPage;