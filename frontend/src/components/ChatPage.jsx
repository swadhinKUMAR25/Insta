import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { setSelectedUser } from "@/redux/authSlice";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { MessageCircleCode, Send } from "lucide-react";
import Messages from "./Messages";
import axios from "axios";
import { setMessages } from "@/redux/chatSlice";

const ChatPage = () => {
  const [textMessage, setTextMessage] = useState("");
  const { user, suggestedUsers, selectedUser } = useSelector(
    (store) => store.auth
  );
  const { onlineUsers, messages } = useSelector((store) => store.chat);
  const { socket } = useSelector((store) => store.socketio);
  const dispatch = useDispatch();

  const sendMessageHandler = async (receiverId) => {
    if (!textMessage.trim()) return;

    try {
      const res = await axios.post(
        `http://localhost:3000/api/v1/message/send/${receiverId}`,
        { textMessage },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        const newMessage = res.data.newMessage;
        dispatch(setMessages([...messages, newMessage]));

        // Emit the message through socket
        if (socket) {
          socket.emit("sendMessage", {
            message: newMessage,
            receiverId: selectedUser._id,
          });
        }

        setTextMessage("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessageHandler(selectedUser?._id);
    }
  };

  useEffect(() => {
    return () => {
      dispatch(setSelectedUser(null));
    };
  }, [dispatch]);

  const sidebarVariants = {
    hidden: { x: -50, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.3 } },
  };

  const listItemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: (i) => ({
      x: 0,
      opacity: 1,
      transition: { delay: i * 0.1 },
    }),
  };

  if (!user) return null; // Add protection for when user is not loaded

  return (
    <div className="flex ml-[16%] h-screen bg-gray-50">
      <motion.section
        variants={sidebarVariants}
        initial="hidden"
        animate="visible"
        className="w-full md:w-1/4 my-8 bg-white rounded-r-xl shadow-md"
      >
        <h1 className="font-bold mb-4 px-6 text-xl text-gray-800">
          {user.username}
        </h1>
        <div className="px-4">
          <Input
            type="search"
            placeholder="Search messages..."
            className="mb-4 bg-gray-50"
          />
        </div>
        <div className="overflow-y-auto h-[calc(100vh-12rem)] scrollbar-hide">
          {suggestedUsers.map((suggestedUser, i) => {
            const isOnline = onlineUsers.includes(suggestedUser?._id);
            return (
              <motion.div
                key={suggestedUser._id}
                custom={i}
                variants={listItemVariants}
                initial="hidden"
                animate="visible"
                onClick={() => dispatch(setSelectedUser(suggestedUser))}
                className={`flex gap-3 items-center p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedUser?._id === suggestedUser._id ? "bg-gray-100" : ""
                }`}
              >
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={suggestedUser?.profilePicture} />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  {isOnline && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white"
                    />
                  )}
                </div>
                <div className="flex flex-col flex-1">
                  <span className="font-medium text-gray-900">
                    {suggestedUser?.username}
                  </span>
                  <span className="text-xs text-gray-500">Active now</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      <AnimatePresence mode="wait">
        {selectedUser ? (
          <motion.section
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="flex-1 bg-white shadow-md rounded-l-xl flex flex-col h-full ml-4"
          >
            <div className="flex gap-3 items-center px-6 py-4 border-b border-gray-100">
              <Avatar>
                <AvatarImage src={selectedUser?.profilePicture} alt="profile" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium">{selectedUser?.username}</span>
                <span
                  className={`text-xs ${
                    onlineUsers.includes(selectedUser._id)
                      ? "text-green-500"
                      : "text-gray-500"
                  }`}
                >
                  {onlineUsers.includes(selectedUser._id)
                    ? "online"
                    : "offline"}
                </span>
              </div>
            </div>

            <Messages selectedUser={selectedUser} />

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex items-center gap-2 p-4 border-t border-gray-100"
            >
              <Input
                value={textMessage}
                onChange={(e) => setTextMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                type="text"
                className="flex-1 bg-gray-50 focus:bg-white transition-colors"
                placeholder="Type a message..."
              />
              <Button
                onClick={() => sendMessageHandler(selectedUser?._id)}
                disabled={!textMessage.trim()}
                className="bg-primary-500 hover:bg-primary-600"
              >
                <Send className="w-4 h-4" />
              </Button>
            </motion.div>
          </motion.section>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center flex-1"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <MessageCircleCode className="w-32 h-32 text-gray-300" />
            </motion.div>
            <h1 className="font-medium text-xl mt-6 text-gray-800">
              Your messages
            </h1>
            <span className="text-gray-500 mt-2">
              Select a chat to start messaging
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatPage;
