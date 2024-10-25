import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AtSign, Bookmark, Grid, Heart, MessageCircle, Settings, UserRound, Video } from 'lucide-react';
import useGetUserProfile from '@/hooks/useGetUserProfile';
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage, 
} from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';


const ProfileStats = ({ label, value }) => (
  <div className="text-center">
    <div className="font-semibold text-lg">{value}</div>
    <div className="text-gray-500 text-sm">{label}</div>
  </div>
);

const ProfileBio = ({ username, bio }) => (
  <div className="space-y-2">
    <h2 className="font-semibold text-lg">{bio || 'Bio'}</h2>
    <Badge variant="secondary" className="gap-1">
      <AtSign className="h-3 w-3" /> {username}
    </Badge>
    <div className="space-y-1 text-gray-600">
      <p>🚀 Learn code with patel mernstack style</p>
      <p>💻 Turning code into fun</p>
      <p>✨ DM for collaboration</p>
    </div>
  </div>
);

const PostGrid = ({ posts }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {posts?.map((post) => (
      <div key={post?._id} className="relative group aspect-square">
        <img
          src={post.image}
          alt="Post"
          className="w-full h-full object-cover rounded-lg"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-lg flex items-center justify-center">
          <div className="flex items-center gap-6 text-white">
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 fill-white" />
              <span className="text-lg font-semibold">{post?.likes.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-6 w-6 fill-white" />
              <span className="text-lg font-semibold">{post?.comments.length}</span>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);


const Profile = () => {
  const params = useParams();
  const userId = params.id;
  useGetUserProfile(userId);

  const { userProfile, user } = useSelector(store => store.auth);
  const isLoggedInUserProfile = user?._id === userProfile?._id;
  const isFollowing = false;

  const stats = [
    { label: 'posts', value: userProfile?.posts.length || 0 },
    { label: 'followers', value: userProfile?.followers.length || 0 },
    { label: 'following', value: userProfile?.following.length || 0 },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        <div className="flex justify-center md:w-1/3">
          <Avatar className="h-40 w-40 ring-4 ring-gray-100">
            <AvatarImage src={userProfile?.profilePicture} alt="Profile" />
            <AvatarFallback className="text-2xl">{userProfile?.username?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
        </div>

        <div className="flex flex-col gap-6 md:w-2/3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <h1 className="text-2xl font-semibold">{userProfile?.username}</h1>
            <div className="flex flex-wrap gap-2">
              {isLoggedInUserProfile ? (
                <>
                  <Link to="/account/edit">
                    <Button variant="secondary" className="h-9 px-4 font-medium">
                      Edit profile
                    </Button>
                  </Link>
                  <Button variant="secondary" className="h-9 px-4 font-medium">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </>
              ) : (
                <>
                  <Button className="bg-blue-500 hover:bg-blue-600 h-9 px-6 font-medium">
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                  <Button variant="secondary" className="h-9 px-4 font-medium">
                    Message
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-8">
            {stats.map((stat, index) => (
              <ProfileStats key={index} {...stat} />
            ))}
          </div>

          <ProfileBio username={userProfile?.username} bio={userProfile?.bio} />
        </div>
      </div>


      {/* Simple navigation buttons instead of Tabs */}
      <div className="grid grid-cols-4 max-w-2xl mx-auto gap-4 mb-8">
        <Button variant="ghost" className="flex items-center gap-2">
          <Grid className="h-4 w-4" /> Posts
        </Button>
        <Button variant="ghost" className="flex items-center gap-2">
          <Bookmark className="h-4 w-4" /> Saved
        </Button>
        <Button variant="ghost" className="flex items-center gap-2">
          <Video className="h-4 w-4" /> Reels
        </Button>
        <Button variant="ghost" className="flex items-center gap-2">
          <UserRound className="h-4 w-4" /> Tagged
        </Button>
      </div>

      {/* Default to showing posts */}
      <PostGrid posts={userProfile?.posts} />
    </div>
  );
};

export default Profile;