import React, { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { readFileAsDataURL } from "@/lib/utils";
import { Loader2, ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "@/redux/postSlice";
import { motion, AnimatePresence } from "framer-motion";

const CreatePost = ({ open, setOpen }) => {
  const imageRef = useRef();
  const [file, setFile] = useState("");
  const [caption, setCaption] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const { posts } = useSelector((store) => store.post);
  const dispatch = useDispatch();

  const fileChangeHandler = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      const dataUrl = await readFileAsDataURL(file);
      setImagePreview(dataUrl);
    }
  };

  const createPostHandler = async (e) => {
    if (!caption.trim() && !imagePreview) {
      toast.error("Please add a caption or image");
      return;
    }

    const formData = new FormData();
    formData.append("caption", caption);
    if (imagePreview) formData.append("image", file);
    
    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:3000/api/v1/post/addpost",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        dispatch(setPosts([res.data.post, ...posts]));
        toast.success(res.data.message);
        setOpen(false);
        // Reset form
        setCaption("");
        setImagePreview("");
        setFile("");
      }
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    setImagePreview("");
    setFile("");
  };

  return (
    <Dialog open={open}>
      <DialogContent 
        className="sm:max-w-[500px] overflow-hidden bg-white/95 backdrop-blur-sm border border-violet-200"
        onInteractOutside={() => !loading && setOpen(false)}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
            Create New Post
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="flex gap-3 items-center p-3 bg-gradient-to-r from-violet-50 to-fuchsia-50 rounded-xl">
            <Avatar className="ring-2 ring-violet-200 transition-all duration-300 hover:ring-violet-400">
              <AvatarImage src={user?.profilePicture} alt={user?.username} />
              <AvatarFallback className="bg-gradient-to-r from-violet-400 to-fuchsia-400 text-white">
                {user?.username?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-semibold text-sm bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                {user?.username}
              </h1>
              <span className="text-gray-600 text-xs">Share your thoughts...</span>
            </div>
          </div>

          <Textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="focus-visible:ring-violet-400 min-h-[100px] border-violet-100 placeholder:text-gray-400 transition-all duration-300"
            placeholder="Write a caption..."
          />

          <AnimatePresence>
            {imagePreview && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="relative w-full h-64 group"
              >
                <img
                  src={imagePreview}
                  alt="preview"
                  className="w-full h-full object-cover rounded-xl ring-2 ring-violet-200"
                />
                <button
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-3">
            <Button
              onClick={() => imageRef.current.click()}
              className="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:opacity-90 transition-all duration-300"
              disabled={loading}
            >
              <ImagePlus className="mr-2 h-4 w-4" />
              Add Photo
            </Button>

            <Button
              onClick={createPostHandler}
              disabled={loading || (!caption.trim() && !imagePreview)}
              className="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:opacity-90 transition-all duration-300"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                'Share Post'
              )}
            </Button>
          </div>
        </div>

        <input
          ref={imageRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={fileChangeHandler}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreatePost;