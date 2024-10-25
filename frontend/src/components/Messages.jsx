import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import useGetAllMessage from "@/hooks/useGetAllMessage";
import useGetRTM from "@/hooks/useGetRTM";

const Messages = ({ selectedUser }) => {
  useGetRTM();
  useGetAllMessage();
  const { messages } = useSelector((store) => store.chat);
  const { user } = useSelector((store) => store.auth);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const profileCardVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <div className="overflow-y-auto flex-1 p-6 bg-gradient-to-b from-blue-50/50 to-white">
      <motion.div
        variants={profileCardVariants}
        initial="hidden"
        animate="visible"
        className="flex justify-center mb-8"
      >
        <div className="flex flex-col items-center justify-center bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-blue-100">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Avatar className="h-20 w-20 ring-4 ring-blue-100">
              <AvatarImage src={selectedUser?.profilePicture} alt="profile" />
              <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
                {selectedUser?.username?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </motion.div>
          <span className="mt-4 font-medium text-gray-900 text-lg">
            {selectedUser?.username}
          </span>
          <Link to={`/profile/${selectedUser?._id}`}>
            <Button 
              className="h-8 mt-4 bg-blue-600 hover:bg-blue-700 transition-colors"
              variant="default"
            >
              View profile
            </Button>
          </Link>
        </div>
      </motion.div>

      <div className="flex flex-col gap-4">
        {messages &&
          messages.map((msg, index) => {
            const isSender = msg.senderId === user?._id;
            return (
              <motion.div
                key={msg._id}
                variants={messageVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.1 }}
                className={`flex ${isSender ? "justify-end" : "justify-start"}`}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`p-4 rounded-2xl max-w-md break-words ${
                    isSender
                      ? "bg-blue-600 text-white rounded-br-none shadow-blue-100"
                      : "bg-white text-gray-800 rounded-bl-none border border-blue-100"
                  } shadow-lg`}
                >
                  {msg.message}
                </motion.div>
              </motion.div>
            );
          })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default Messages;