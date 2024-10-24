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

  return (
    <div className="overflow-y-auto flex-1 p-6 bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center mb-8"
      >
        <div className="flex flex-col items-center justify-center bg-white p-6 rounded-xl shadow-sm">
          <Avatar className="h-20 w-20 ring-4 ring-primary-100">
            <AvatarImage src={selectedUser?.profilePicture} alt="profile" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <span className="mt-4 font-medium text-gray-900">
            {selectedUser?.username}
          </span>
          <Link to={`/profile/${selectedUser?._id}`}>
            <Button className="h-8 mt-4" variant="secondary">
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
                <div
                  className={`p-3 rounded-2xl max-w-xs break-words ${
                    isSender
                      ? "bg-primary-500 text-white rounded-br-none"
                      : "bg-white text-gray-800 rounded-bl-none shadow-sm"
                  }`}
                >
                  {msg.message}
                </div>
              </motion.div>
            );
          })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default Messages;
