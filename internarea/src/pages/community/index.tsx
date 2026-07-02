import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { selectuser } from "@/Feature/Userslice";
import { toast } from "react-toastify";

export default function Community() {
  const user = useSelector(selectuser);
  const [posts, setPosts] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string>("");
  const [users, setUsers] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);

  // For comments
  const [activeComments, setActiveComments] = useState<Record<string, boolean>>({});
  const [commentsData, setCommentsData] = useState<Record<string, any[]>>({});
  const [commentInput, setCommentInput] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchPosts();
    if (user) {
      fetchUsers();
      fetchFriends();
    }
  }, [user]);

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/community/posts`);
      setPosts(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/community/users?uid=${user.uid}`);
      setUsers(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchFriends = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/community/friends?uid=${user.uid}`);
      setFriends(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handleMediaChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMediaFile(file);
      const b64 = await toBase64(file);
      setMediaPreview(b64);
    }
  };

  const handlePost = async () => {
    if (!content && !mediaFile) return;

    let mediaUrl = "";
    let mediaType = "none";
    if (mediaFile) {
      mediaUrl = mediaPreview;
      mediaType = mediaFile.type.startsWith("video") ? "video" : "image";
    }

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/community/post`, {
        uid: user.uid,
        content,
        mediaUrl,
        mediaType,
      });
      toast.success("Posted successfully!");
      setContent("");
      setMediaFile(null);
      setMediaPreview("");
      fetchPosts();
    } catch (e: any) {
      if (e.response && e.response.status === 403) {
        toast.error(e.response.data.error);
      } else {
        toast.error("Failed to post.");
      }
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/community/post/${postId}/like`, {
        uid: user.uid,
      });
      fetchPosts();
    } catch (e) {
      toast.error("Failed to toggle like.");
    }
  };

  const fetchComments = async (postId: string) => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/community/post/${postId}/comments`);
      setCommentsData((prev) => ({ ...prev, [postId]: res.data }));
    } catch (e) {
      console.error(e);
    }
  };

  const toggleComments = (postId: string) => {
    if (!activeComments[postId]) {
      fetchComments(postId);
    }
    setActiveComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleComment = async (postId: string) => {
    const text = commentInput[postId];
    if (!text) return;
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/community/post/${postId}/comment`, {
        uid: user.uid,
        content: text,
      });
      setCommentInput((prev) => ({ ...prev, [postId]: "" }));
      fetchComments(postId);
    } catch (e) {
      toast.error("Failed to add comment.");
    }
  };

  const handleAddFriend = async (recipientUid: string) => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/community/friend/request`, {
        requesterUid: user.uid,
        recipientUid,
      });
      toast.success("Friend request sent!");
      fetchFriends();
    } catch (e: any) {
      toast.error(e.response?.data?.error || "Failed to send request.");
    }
  };

  const handleAcceptFriend = async (friendshipId: string) => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/community/friend/accept`, {
        friendshipId,
      });
      toast.success("Friend request accepted!");
      fetchFriends();
    } catch (e) {
      toast.error("Failed to accept request.");
    }
  };

  // Determine user's ID
  const dbUserId = user && friends.length > 0
    ? (friends[0].requester?.uid === user.uid ? friends[0].requester._id : friends[0].recipient?._id)
    : null; // Simplification, better to fetch from /api/user

  const acceptedFriendsCount = friends.filter(f => f.status === "accepted").length;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto py-8 px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Feed */}
        <div className="md:col-span-2 space-y-6">
          {user && user.role === "jobseeker" && (
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Create a Post</h2>
              <textarea
                className="w-full border border-gray-300 rounded-lg p-3 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="What's on your mind?"
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <div className="flex justify-between items-center">
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleMediaChange}
                  className="text-sm text-gray-500"
                />
                <button
                  onClick={handlePost}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
                >
                  Post
                </button>
              </div>
              {mediaPreview && (
                <div className="mt-3">
                  {mediaPreview.startsWith("data:video") ? (
                    <video src={mediaPreview} controls className="max-h-48 rounded" />
                  ) : (
                    <img src={mediaPreview} alt="Preview" className="max-h-48 rounded" />
                  )}
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post._id} className="bg-white p-4 rounded-xl shadow-sm">
                <div className="flex items-center space-x-3 mb-3">
                  <img src={post.userPhoto || "/default-avatar.png"} alt={post.userName} className="w-10 h-10 rounded-full" />
                  <div>
                    <h3 className="font-medium text-gray-900">{post.userName}</h3>
                    <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <p className="text-gray-800 mb-3">{post.content}</p>
                {post.mediaUrl && post.mediaType !== "none" && (
                  <div className="mb-3">
                    {post.mediaType === "video" ? (
                      <video src={post.mediaUrl} controls className="w-full max-h-96 rounded-lg object-contain bg-gray-50" />
                    ) : (
                      <img src={post.mediaUrl} alt="Post media" className="w-full max-h-96 rounded-lg object-contain bg-gray-50" />
                    )}
                  </div>
                )}
                
                <div className="flex items-center border-t pt-3 space-x-6">
                  <button onClick={() => user && handleLike(post._id)} className="flex items-center space-x-1 text-gray-500 hover:text-blue-600">
                    <svg className="w-5 h-5" fill={user && post.likes.includes(user.uid) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.514"></path></svg>
                    <span>{post.likes.length}</span>
                  </button>
                  <button onClick={() => toggleComments(post._id)} className="flex items-center space-x-1 text-gray-500 hover:text-blue-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                    <span>Comments</span>
                  </button>
                </div>

                {activeComments[post._id] && (
                  <div className="mt-4 pt-4 border-t bg-gray-50 p-3 rounded-lg">
                    {commentsData[post._id]?.map((comment: any) => (
                      <div key={comment._id} className="flex space-x-2 mb-3">
                        <img src={comment.userPhoto || "/default-avatar.png"} alt="" className="w-8 h-8 rounded-full" />
                        <div className="bg-white p-2 rounded-lg shadow-sm w-full">
                          <p className="font-medium text-sm">{comment.userName}</p>
                          <p className="text-sm text-gray-700">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                    {user && (
                      <div className="flex mt-2">
                        <input
                          type="text"
                          value={commentInput[post._id] || ""}
                          onChange={(e) => setCommentInput(prev => ({ ...prev, [post._id]: e.target.value }))}
                          placeholder="Write a comment..."
                          className="flex-1 border border-gray-300 rounded-l-lg p-2 focus:outline-none"
                        />
                        <button onClick={() => handleComment(post._id)} className="bg-blue-600 text-white px-4 rounded-r-lg hover:bg-blue-700">Send</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            {posts.length === 0 && <p className="text-gray-500 text-center py-8">No posts yet.</p>}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {user && (
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <h2 className="font-semibold text-lg border-b pb-2 mb-3">Your Network</h2>
              <p className="text-sm text-gray-600 mb-2">
                Accepted Friends: <span className="font-bold">{acceptedFriendsCount}</span>
              </p>
              
              <h3 className="font-medium mt-4 mb-2 text-gray-800">Friend Requests</h3>
              {friends.filter(f => f.status === "pending" && f.recipient?.uid === user.uid).map(f => (
                <div key={f._id} className="flex items-center justify-between bg-gray-50 p-2 rounded mb-2">
                  <div className="flex items-center space-x-2">
                    <img src={f.requester?.photo || "/default-avatar.png"} className="w-8 h-8 rounded-full" alt="" />
                    <span className="text-sm">{f.requester?.name}</span>
                  </div>
                  <button onClick={() => handleAcceptFriend(f._id)} className="text-xs bg-green-500 text-white px-2 py-1 rounded">Accept</button>
                </div>
              ))}
              {friends.filter(f => f.status === "pending" && f.recipient?.uid === user.uid).length === 0 && (
                <p className="text-xs text-gray-500 mb-4">No pending requests.</p>
              )}

              <h3 className="font-medium mt-4 mb-2 text-gray-800">Find Friends</h3>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {users.map(u => {
                  const status = friends.find(f => (f.requester?.uid === u.uid && f.recipient?.uid === user.uid) || (f.recipient?.uid === u.uid && f.requester?.uid === user.uid));
                  
                  return (
                    <div key={u.uid} className="flex items-center justify-between text-sm p-1 border-b last:border-0">
                      <div className="flex items-center space-x-2 truncate pr-2">
                        <img src={u.photo || "/default-avatar.png"} className="w-6 h-6 rounded-full" alt="" />
                        <span className="truncate">{u.name}</span>
                      </div>
                      {!status ? (
                        <button onClick={() => handleAddFriend(u.uid)} className="text-blue-600 hover:underline text-xs flex-shrink-0">Add</button>
                      ) : (
                        <span className="text-xs text-gray-400 flex-shrink-0">{status.status}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
