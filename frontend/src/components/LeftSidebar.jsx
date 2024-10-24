import {
  Heart,
  Home,
  LogOut,
  MessageCircle,
  PlusSquare,
  Search,
  TrendingUp,
  X,
} from "lucide-react";
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { toast } from "sonner";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";
import CreatePost from "./CreatePost";
import { setPosts, setSelectedPost } from "@/redux/postSlice";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";

const LeftSidebar = () => {
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);
  const { likeNotification } = useSelector((store) => store.realTimeNotification);
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);

  // Dummy data for search results
  const searchResults = [
    { id: 1, username: "john_doe", name: "John Doe", profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=John" },
    { id: 2, username: "jane_smith", name: "Jane Smith", profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane" },
    { id: 3, username: "mike_wilson", name: "Mike Wilson", profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike" },
  ];

  // Dummy data for explore section
  const exploreItems = [
    { id: 1, title: "Photography", posts: 1234, image: "https://source.unsplash.com/random/400x400?photography" },
    { id: 2, title: "Travel", posts: 856, image: "https://source.unsplash.com/random/400x400?travel" },
    { id: 3, title: "Food", posts: 2341, image: "https://source.unsplash.com/random/400x400?food" },
    { id: 4, title: "Technology", posts: 945, image: "https://source.unsplash.com/random/400x400?technology" },
  ];

  const logoutHandler = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/v1/user/logout", {
        withCredentials: true,
      });
      if (res.data.success) {
        dispatch(setAuthUser(null));
        dispatch(setSelectedPost(null));
        dispatch(setPosts([]));
        navigate("/login");
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const sidebarHandler = (textType) => {
    if (textType === "Logout") {
      logoutHandler();
    } else if (textType === "Create") {
      setOpen(true);
    } else if (textType === "Profile") {
      navigate(`/profile/${user?._id}`);
    } else if (textType === "Home") {
      navigate("/");
    } else if (textType === "Messages") {
      navigate("/chat");
    } else if (textType === "Search") {
      setSearchOpen(true);
    } else if (textType === "Explore") {
      setExploreOpen(true);
    }
  };

  const sidebarItems = [
    { icon: <Home />, text: "Home" },
    { icon: <Search />, text: "Search" },
    { icon: <TrendingUp />, text: "Explore" },
    { icon: <MessageCircle />, text: "Messages" },
    { icon: <Heart />, text: "Notifications" },
    { icon: <PlusSquare />, text: "Create" },
    {
      icon: (
        <Avatar className="w-6 h-6">
          <AvatarImage src={user?.profilePicture} alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      ),
      text: "Profile",
    },
    { icon: <LogOut />, text: "Logout" },
  ];

  return (
    <>
      <div className="fixed top-0 z-10 left-0 px-4 border-r border-gray-300 w-[16%] h-screen">
        <div className="flex flex-col">
          <h1 className="my-8 pl-3 font-bold text-xl">LOGO</h1>
          <div>
            {sidebarItems.map((item, index) => (
              <div
                onClick={() => sidebarHandler(item.text)}
                key={index}
                className="flex items-center gap-3 relative hover:bg-gray-100 cursor-pointer rounded-lg p-3 my-3"
              >
                {item.icon}
                <span>{item.text}</span>
                {item.text === "Notifications" && likeNotification.length > 0 && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        size="icon"
                        className="rounded-full h-5 w-5 bg-red-600 hover:bg-red-600 absolute bottom-6 left-6"
                      >
                        {likeNotification.length}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <div>
                        {likeNotification.length === 0 ? (
                          <p>No new notification</p>
                        ) : (
                          likeNotification.map((notification) => (
                            <div
                              key={notification.userId}
                              className="flex items-center gap-2 my-2"
                            >
                              <Avatar>
                                <AvatarImage
                                  src={notification.userDetails?.profilePicture}
                                />
                                <AvatarFallback>CN</AvatarFallback>
                              </Avatar>
                              <p className="text-sm">
                                <span className="font-bold">
                                  {notification.userDetails?.username}
                                </span>{" "}
                                liked your post
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <CreatePost open={open} setOpen={setOpen} />

      {/* Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Search</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <Input
              placeholder="Search users..."
              className="mb-4"
            />
            <div className="space-y-4">
              {searchResults.map((user) => (
                <div key={user.id} className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
                  <Avatar>
                    <AvatarImage src={user.profilePicture} />
                    <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-gray-500">@{user.username}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Explore Dialog */}
      <Dialog open={exploreOpen} onOpenChange={setExploreOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Explore</DialogTitle>
          </DialogHeader>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {exploreItems.map((item) => (
              <div key={item.id} className="group relative cursor-pointer">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h3 className="font-bold text-lg">{item.title}</h3>
                    <p className="text-sm">{item.posts} posts</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LeftSidebar;