import React, { useState } from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Bookmark, MessageCircle, MoreHorizontal, Send } from "lucide-react";
import { Button } from "./ui/button";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import CommentDialog from "./CommentDialog";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "sonner";
import { setPosts, setSelectedPost } from "@/redux/postSlice";
import { Badge } from "./ui/badge";

const Post = ({ post, index }) => {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const { posts } = useSelector((store) => store.post);
  const [liked, setLiked] = useState(post.likes.includes(user?._id) || false);
  const [postLike, setPostLike] = useState(post.likes.length);
  const [comment, setComment] = useState(post.comments);
  const dispatch = useDispatch();

  const postVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay: index * 0.1 },
    },
  };

  const likeAnimation = {
    scale: [1, 1.2, 1],
    transition: { duration: 0.3 },
  };

  const changeEventHandler = (e) => {
    const inputText = e.target.value;
    if (inputText.trim()) {
      setText(inputText);
    } else {
      setText("");
    }
  };

  const likeOrDislikeHandler = async () => {
    try {
      const action = liked ? "dislike" : "like";
      const res = await axios.get(
        `http://localhost:3000/api/v1/post/${post._id}/${action}`,
        { withCredentials: true }
      );
      if (res.data.success) {
        const updatedLikes = liked ? postLike - 1 : postLike + 1;
        setPostLike(updatedLikes);
        setLiked(!liked);

        const updatedPostData = posts.map((p) =>
          p._id === post._id
            ? {
                ...p,
                likes: liked
                  ? p.likes.filter((id) => id !== user._id)
                  : [...p.likes, user._id],
              }
            : p
        );
        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to update like status");
    }
  };

  const commentHandler = async () => {
    try {
      const res = await axios.post(
        `http://localhost:3000/api/v1/post/${post._id}/comment`,
        { text },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        const updatedCommentData = [...comment, res.data.comment];
        setComment(updatedCommentData);

        const updatedPostData = posts.map((p) =>
          p._id === post._id ? { ...p, comments: updatedCommentData } : p
        );

        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
        setText("");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to add comment");
    }
  };

  const bookmarkHandler = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3000/api/v1/post/${post?._id}/bookmark`,
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to bookmark post");
    }
  };

  const deletePostHandler = async () => {
    try {
      const res = await axios.delete(
        `http://localhost:3000/api/v1/post/delete/${post?._id}`,
        { withCredentials: true }
      );
      if (res.data.success) {
        const updatedPostData = posts.filter(
          (postItem) => postItem?._id !== post?._id
        );
        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete post");
    }
  };

  return (
    <motion.div
      variants={postVariants}
      initial="hidden"
      animate="visible"
      className="my-8 w-full max-w-sm mx-auto bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="ring-2 ring-primary-200 ring-offset-2">
              <AvatarImage src={post.author?.profilePicture} alt="post_image" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-semibold text-dark-100">
                {post.author?.username}
              </h1>
              {user?._id === post.author._id && (
                <Badge variant="secondary" className="animate-fade-in">
                  Author
                </Badge>
              )}
            </div>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <motion.div
                whileHover={{ rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                <MoreHorizontal className="cursor-pointer text-gray-600" />
              </motion.div>
            </DialogTrigger>
            <DialogContent className="flex flex-col items-center text-sm text-center">
              {post?.author?._id !== user?._id && (
                <Button
                  variant="ghost"
                  className="cursor-pointer w-fit text-[#ED4956] font-bold"
                >
                  Unfollow
                </Button>
              )}
              <Button variant="ghost" className="cursor-pointer w-fit">
                Add to favorites
              </Button>
              {user && user?._id === post?.author._id && (
                <Button
                  onClick={deletePostHandler}
                  variant="ghost"
                  className="cursor-pointer w-fit"
                >
                  Delete
                </Button>
              )}
            </DialogContent>
          </Dialog>
        </div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
          className="relative rounded-lg overflow-hidden"
        >
          <img
            className="w-full aspect-square object-cover"
            src={post.image}
            alt="post_img"
          />
        </motion.div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div whileTap={likeAnimation}>
              {liked ? (
                <FaHeart
                  onClick={likeOrDislikeHandler}
                  size={24}
                  className="cursor-pointer text-red-500"
                />
              ) : (
                <FaRegHeart
                  onClick={likeOrDislikeHandler}
                  size={24}
                  className="cursor-pointer hover:text-gray-700"
                />
              )}
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }}>
              <MessageCircle
                onClick={() => {
                  dispatch(setSelectedPost(post));
                  setOpen(true);
                }}
                className="cursor-pointer hover:text-gray-700"
                size={24}
              />
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }}>
              <Send className="cursor-pointer hover:text-gray-700" size={24} />
            </motion.div>
          </div>
          <motion.div whileHover={{ scale: 1.1 }}>
            <Bookmark
              onClick={bookmarkHandler}
              className="cursor-pointer hover:text-gray-700"
              size={24}
            />
          </motion.div>
        </div>

        <div className="mt-3">
          <span className="font-semibold text-sm">{postLike} likes</span>
          <p className="mt-1">
            <span className="font-semibold mr-2">{post.author?.username}</span>
            {post.caption}
          </p>
          {comment.length > 0 && (
            <motion.span
              whileHover={{ color: "#2563eb" }}
              onClick={() => {
                dispatch(setSelectedPost(post));
                setOpen(true);
              }}
              className="cursor-pointer text-sm text-gray-500 block mt-2"
            >
              View all {comment.length} comments
            </motion.span>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <input
            type="text"
            placeholder="Add a comment..."
            value={text}
            onChange={changeEventHandler}
            className="flex-1 outline-none text-sm bg-gray-50 rounded-full px-4 py-2 focus:bg-gray-100 transition-colors"
          />
          {text && (
            <motion.span
              whileHover={{ scale: 1.05 }}
              onClick={commentHandler}
              className="text-primary-500 font-semibold cursor-pointer text-sm"
            >
              Post
            </motion.span>
          )}
        </div>
      </div>
      <CommentDialog open={open} setOpen={setOpen} />
    </motion.div>
  );
};

export default Post;
