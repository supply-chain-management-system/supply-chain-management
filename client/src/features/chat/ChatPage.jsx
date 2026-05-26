import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import {
  MessageSquare,
  Hash,
  User as UserIcon,
  Send,
  Search,
  Plus,
  Palette,
  Loader2,
  AlertCircle,
  Activity,
  Check,
  Info,
  Volume2,
  VolumeX,
  Smile,
  Shield,
  Mail,
  Layers,
  X,
  FileText,
  Trash2,
  Edit3,
  UserPlus,
  Bell,
} from "lucide-react";
import api from "../../api/api";
import { useLocation } from "react-router-dom";

const THEMES = {
  classic: {
    id: "classic",
    name: "Classic Mono",
    isLight: true,
    bg: "bg-white text-slate-900 font-sans",
    sidebar: "bg-slate-50 border-slate-200 text-slate-800",
    header: "bg-white border-slate-200 text-slate-900 shadow-sm",
    activeItem: "bg-slate-950 text-white border-slate-950 shadow-sm",
    inputBg: "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-slate-800 focus:ring-1 focus:ring-slate-800",
    bubbleIncoming: "bg-slate-100 text-slate-900 border border-slate-200",
    bubbleOutgoing: "bg-slate-950 text-white border-transparent shadow-sm",
    accentText: "text-slate-950 font-black",
    btnPrimary: "bg-slate-950 text-white hover:bg-slate-900 transition-all shadow-sm border border-slate-900 active:scale-95",
    badge: "bg-slate-200 text-slate-800 border border-slate-300",
    systemMsg: "text-slate-500 bg-slate-100 border border-slate-200",
  },
  aurora: {
    id: "aurora",
    name: "Aurora Glow",
    isLight: false,
    bg: "bg-slate-950 text-slate-100 font-sans",
    sidebar: "bg-slate-900/60 backdrop-blur-xl border-violet-500/20",
    header: "bg-slate-900/80 backdrop-blur-xl border-violet-500/25 shadow-[0_4px_30px_rgba(139,92,246,0.15)]",
    activeItem: "bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 text-violet-300 border-violet-500/40 shadow-[0_0_15px_rgba(167,139,250,0.1)]",
    inputBg: "bg-slate-900/90 border-violet-500/25 text-slate-100 placeholder-slate-500 focus:border-violet-400 focus:ring-1 focus:ring-violet-400",
    bubbleIncoming: "bg-slate-900/90 text-slate-100 border border-violet-500/10",
    bubbleOutgoing: "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)] border-transparent",
    accentText: "text-violet-400",
    btnPrimary: "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:opacity-95 shadow-[0_0_15px_rgba(139,92,246,0.25)]",
    badge: "bg-violet-500/20 text-violet-300 border border-violet-500/30",
    systemMsg: "text-violet-300/60 bg-violet-950/20 border border-violet-900/30",
  },
  matrix: {
    id: "matrix",
    name: "Digital Rain",
    isLight: false,
    bg: "bg-[#020202] text-[#39ff14] font-mono",
    sidebar: "bg-[#080808] border-[#39ff14]/20",
    header: "bg-[#060606] border-[#39ff14]/30 shadow-[0_0_10px_rgba(57,255,20,0.1)]",
    activeItem: "bg-[#39ff14]/5 text-[#39ff14] border-[#39ff14]/40 shadow-[0_0_5px_rgba(57,255,20,0.2)]",
    inputBg: "bg-[#050505] border-[#39ff14]/25 text-[#39ff14] placeholder-green-900 focus:border-[#39ff14] focus:ring-0",
    bubbleIncoming: "bg-[#0a0a0a] text-[#39ff14]/80 border border-[#39ff14]/15",
    bubbleOutgoing: "bg-[#39ff14]/10 text-[#39ff14] border border-[#39ff14]/40 shadow-[0_0_10px_rgba(57,255,20,0.15)]",
    accentText: "text-[#39ff14]",
    btnPrimary: "bg-[#181818] border border-[#39ff14] text-[#39ff14] hover:bg-[#39ff14]/10 transition-all",
    badge: "bg-[#39ff14]/10 text-[#39ff14] border border-[#39ff14]/30",
    systemMsg: "text-[#39ff14]/50 bg-black border border-[#39ff14]/10",
  },
  sunset: {
    id: "sunset",
    name: "Solar Winds",
    isLight: false,
    bg: "bg-[#0f0c1b] text-orange-100",
    sidebar: "bg-[#171329] border-orange-500/20",
    header: "bg-[#1d1833] border-orange-500/30 shadow-[0_4px_25px_rgba(249,115,22,0.1)]",
    activeItem: "bg-orange-500/10 text-orange-300 border-orange-500/40 shadow-[0_0_15px_rgba(249,115,22,0.1)]",
    inputBg: "bg-[#131022] border-orange-500/20 text-orange-100 placeholder-orange-900/55 focus:border-orange-400 focus:ring-1 focus:ring-orange-400",
    bubbleIncoming: "bg-[#251f40] text-orange-200 border border-orange-500/10",
    bubbleOutgoing: "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-[0_0_15px_rgba(249,115,22,0.25)] border-transparent",
    accentText: "text-orange-400",
    btnPrimary: "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:opacity-95 shadow-[0_0_12px_rgba(249,115,22,0.2)]",
    badge: "bg-orange-500/20 text-orange-300 border border-orange-500/30",
    systemMsg: "text-orange-300/50 bg-[#251f40]/30 border border-orange-950/20",
  },
  ice: {
    id: "ice",
    name: "Nebula Frost",
    isLight: false,
    bg: "bg-[#0b1528] text-slate-100",
    sidebar: "bg-white/[0.03] backdrop-blur-xl border-white/10",
    header: "bg-white/[0.05] backdrop-blur-xl border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)]",
    activeItem: "bg-cyan-500/25 text-cyan-200 border-cyan-400/30 shadow-[inset_0_0_8px_rgba(6,182,212,0.2)]",
    inputBg: "bg-white/[0.03] border-white/10 text-slate-100 placeholder-slate-500 focus:border-cyan-400",
    bubbleIncoming: "bg-white/[0.03] text-slate-200 border border-white/5",
    bubbleOutgoing: "bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-white border border-cyan-400/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]",
    accentText: "text-cyan-400",
    btnPrimary: "bg-cyan-600/80 hover:bg-cyan-600 text-white border border-cyan-500/20",
    badge: "bg-cyan-500/10 text-cyan-300 border border-cyan-400/20",
    systemMsg: "text-slate-400/60 bg-white/[0.02] border border-white/5",
  },
};

const ChatPage = () => {
  const currentUser = useSelector((state) => state.auth.user);
  const location = useLocation();
  const path = location.pathname;

  // Dynamic layout alignment and height checks to clear specific header/sidebar menus
  let layoutClasses = "";
  let layoutHeight = "h-[calc(100vh-140px)]";

  if (path.includes("admin-chat")) {
    layoutClasses = "ml-64 p-6";
    layoutHeight = "h-[calc(100vh-48px)]";
  } else if (path.includes("ware-chat")) {
    layoutClasses = "p-6";
    layoutHeight = "h-[calc(100vh-150px)]";
  } else if (path.includes("logistics-chat")) {
    layoutClasses = "";
    layoutHeight = "h-[calc(100vh-130px)]";
  } else if (path.includes("factory-chat")) {
    layoutClasses = "";
    layoutHeight = "h-[calc(100vh-150px)]";
  } else if (path.includes("business-manager") || path.includes("supplier-manager")) {
    layoutClasses = "";
    layoutHeight = "h-[calc(100vh-280px)]";
  }
  
  // Theme state
  const [activeTheme, setActiveTheme] = useState(() => {
    return localStorage.getItem("korvex_chat_theme") || "classic";
  });
  const theme = THEMES[activeTheme] || THEMES.classic;

  // Dynamic design variables derived from theme styling
  const isLight = theme.isLight;
  const tTextTitle = isLight ? "text-slate-900" : "text-white";
  const tTextMuted = isLight ? "text-slate-500" : "text-gray-400";
  const tBorder = isLight ? "border-slate-200" : "border-white/5";
  const tHoverBg = isLight ? "hover:bg-slate-200/60" : "hover:bg-white/5";
  const tCardBg = isLight ? "bg-slate-100/60 border border-slate-200/80" : "bg-white/5 border border-white/5";
  const tHoverText = isLight ? "hover:text-slate-900" : "hover:text-white";
  const tModalBg = isLight ? "bg-white border border-slate-200 text-slate-900 shadow-2xl" : "bg-slate-900 border border-white/10 text-slate-100 shadow-2xl";

  // Active user's custom status state
  const [myStatus, setMyStatus] = useState("online");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // Search, Rooms & Users states
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState(""); // left-panel filter
  const [msgSearchQuery, setMsgSearchQuery] = useState(""); // message-stream filter

  // Group creation state
  const [newRoomName, setNewRoomName] = useState("");
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [activeTab, setActiveTab] = useState("groups");

  // Message & WebSockets states
  const [messages, setMessages] = useState([]);
  const [userPresenceMap, setUserPresenceMap] = useState({});

  // Helper to parse system messages and update presence map
  const updatePresenceFromMessages = (msgs) => {
    setUserPresenceMap((prev) => {
      const updated = { ...prev };
      msgs.forEach((m) => {
        if (m.message_type === "system") {
          const text = m.content || "";
          if (text.includes("has joined the chat")) {
            const name = text.split(" has joined ")[0].trim();
            updated[name] = "online";
          } else if (text.includes("left the chat")) {
            const name = text.split(" left ")[0].trim();
            updated[name] = "offline";
          }
        }
      });
      return updated;
    });
  };
  const [newMessage, setNewMessage] = useState("");
  const [wsStatus, setWsStatus] = useState("disconnected");
  const [errorMsg, setErrorMsg] = useState("");
  const [hoveredMsgId, setHoveredMsgId] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);

  // Typing states
  const [typingUsers, setTypingUsers] = useState({});
  const [isTypingSent, setIsTypingSent] = useState(false);

  // Audio configuration & side drawers
  const [showRoomInfo, setShowRoomInfo] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  // Group editing / inviting states
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditGroupModal, setShowEditGroupModal] = useState(false);
  const [inviteSelectedUserIds, setInviteSelectedUserIds] = useState([]);
  const [editGroupName, setEditGroupName] = useState("");
  const [editGroupDescription, setEditGroupDescription] = useState("");
  const [inviteSearchQuery, setInviteSearchQuery] = useState("");

  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  // Fetch notifications list
  const fetchNotifications = async () => {
    try {
      const res = await api.get("/chat/notifications");
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  const handleAcceptInvite = async (notif, e) => {
    e.stopPropagation();
    try {
      const res = await api.post(`/chat/notifications/${notif.id}/accept`);
      const updatedRoom = res.data;
      
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: true, status: "accepted" } : n))
      );
      
      // Refresh rooms list
      const roomsRes = await api.get("/chat/rooms");
      setRooms(roomsRes.data);
      
      // Activate the room
      setActiveRoom(updatedRoom);
      setShowNotifDropdown(false);
    } catch (err) {
      console.error("Failed to accept invitation:", err);
      alert("Failed to join group room. It may have been deleted or is no longer accessible.");
    }
  };

  const handleDeclineInvite = async (notif, e) => {
    e.stopPropagation();
    try {
      await api.post(`/chat/notifications/${notif.id}/decline`);
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: true, status: "declined" } : n))
      );
    } catch (err) {
      console.error("Failed to decline invitation:", err);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (notif.status === "pending") {
      return;
    }
    try {
      if (!notif.is_read) {
        await api.post(`/chat/notifications/${notif.id}/read`);
        // Update local state
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
        );
      }
      
      // Find the room in the existing list
      const targetRoom = rooms.find((r) => r.id === notif.room_id);
      if (targetRoom) {
        setActiveRoom(targetRoom);
      } else {
        // If room is not in local state, fetch rooms first, then select
        const res = await api.get("/chat/rooms");
        setRooms(res.data);
        const refetchedRoom = res.data.find((r) => r.id === notif.room_id);
        if (refetchedRoom) {
          setActiveRoom(refetchedRoom);
        } else {
          alert("This group room was deleted or is no longer accessible.");
        }
      }
      setShowNotifDropdown(false);
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await api.post("/chat/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  // Refs
  const socketRef = useRef(null);
  const feedEndRef = useRef(null);
  const feedContainerRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const activeRoomIdRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const audioContextRef = useRef(null);

  // Sync active room ID to ref for WS thread
  useEffect(() => {
    activeRoomIdRef.current = activeRoom?.id;
  }, [activeRoom]);

  // Load rooms and users directory & register gesture listeners for AudioContext initialization
  useEffect(() => {
    fetchRooms();
    fetchUsers();

    const initAudio = () => {
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioContextRef.current.state === "suspended") {
          audioContextRef.current.resume();
        }
      } catch (err) {
        console.warn("Could not initialize AudioContext on user gesture:", err);
      }
    };

    window.addEventListener("click", initAudio, { once: true });
    window.addEventListener("keydown", initAudio, { once: true });

    return () => {
      if (socketRef.current) socketRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      window.removeEventListener("click", initAudio);
      window.removeEventListener("keydown", initAudio);
    };
  }, []);

  // Set up 15-second polling for notifications and rooms
  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
      fetchRooms(true);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // Prevent parent layout-level scrolling when Chat is active so it never slides under sticky navbars
  useEffect(() => {
    const mainElements = document.getElementsByTagName("main");
    const originalStyles = [];
    
    // Reset all window/viewport scroll coordinate states to top
    window.scrollTo(0, 0);
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;

    for (let main of mainElements) {
      originalStyles.push({ element: main, style: main.style.overflow });
      main.scrollTop = 0;
      main.style.overflow = "hidden";
    }

    return () => {
      for (let item of originalStyles) {
        item.element.style.overflow = item.style;
      }
    };
  }, []);

  // Set default room (with roomId query parameter support)
  useEffect(() => {
    if (rooms.length > 0 && !activeRoom) {
      const params = new URLSearchParams(window.location.search);
      const queryRoomId = params.get("roomId");
      if (queryRoomId) {
        const found = rooms.find((r) => r.id === queryRoomId);
        if (found) {
          setActiveRoom(found);
          return;
        }
      }
      const general = rooms.find((r) => r.name.toLowerCase() === "general chat");
      setActiveRoom(general || rooms[0]);
    }
  }, [rooms]);

  // Sync activeTab when activeRoom changes
  useEffect(() => {
    if (activeRoom) {
      setActiveTab(activeRoom.type === "direct" ? "dms" : "groups");
    }
  }, [activeRoom]);

  // Triggered on active room change: load history and connect WS
  useEffect(() => {
    if (!activeRoom) return;

    // Reset local typing indicator state
    setTypingUsers({});
    setIsTypingSent(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    setEditGroupName(activeRoom.name || "");
    setEditGroupDescription(activeRoom.description || "");

    // Clear messages for the previous room immediately to prevent UI ghosting/leakage
    setMessages([]);

    fetchMessageHistory(activeRoom.id);
    connectWebSocket(activeRoom.id);
  }, [activeRoom]);

  // Scroll to bottom on new message without causing layout shift/scroll on parent containers
  useEffect(() => {
    if (feedContainerRef.current) {
      feedContainerRef.current.scrollTo({
        top: feedContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, typingUsers]);

  // Synth notification sound
  const playNotificationSound = () => {
    if (isMuted) return;
    try {
      let audioCtx = audioContextRef.current;
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        audioContextRef.current = audioCtx;
      }
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }

      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(550, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(750, audioCtx.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      console.warn("Notification sound blocked by autoplay policy.", e);
    }
  };

  // Fetch rooms list
  const fetchRooms = async (silent = false) => {
    try {
      if (!silent) setLoadingRooms(true);
      const res = await api.get("/chat/rooms");
      setRooms(res.data);
    } catch (err) {
      console.error("Failed to fetch rooms:", err);
      if (!silent) setErrorMsg("Failed to fetch chat rooms.");
    } finally {
      if (!silent) setLoadingRooms(false);
    }
  };

  // Fetch users directory
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await api.get("/company/users");
      const filtered = res.data.filter((u) => String(u.id) !== String(currentUser?.id));
      setUsers(filtered);
    } catch (err) {
      console.error("Failed to fetch staff directory:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch message history
  const fetchMessageHistory = async (roomId) => {
    try {
      const res = await api.get(`/chat/rooms/${roomId}/messages?limit=50`);
      setMessages((prev) => {
        // Discard any messages from previous rooms that are still in state due to async batching
        const currentRoomPrev = prev.filter((m) => m.room_id === roomId);
        const existingIds = new Set(res.data.map((m) => m.id));
        const newMessagesDuringLoad = currentRoomPrev.filter((m) => !existingIds.has(m.id));
        const combined = [...res.data, ...newMessagesDuringLoad];
        updatePresenceFromMessages(combined);
        return combined;
      });
    } catch (err) {
      console.error("Failed to fetch messages history:", err);
    }
  };

  // Edit group details
  const handleEditGroup = async (e) => {
    e.preventDefault();
    if (!activeRoom) return;
    try {
      const res = await api.patch(`/chat/rooms/${activeRoom.id}`, {
        name: editGroupName,
        description: editGroupDescription,
      });
      setRooms((prev) =>
        prev.map((r) => (r.id === activeRoom.id ? res.data : r))
      );
      setActiveRoom(res.data);
      setShowEditGroupModal(false);
    } catch (err) {
      console.error("Failed to update group details:", err);
      alert("Failed to update group details.");
    }
  };

  // Delete group room
  const handleDeleteGroup = async () => {
    if (!activeRoom) return;
    if (
      !window.confirm(
        `Are you sure you want to delete the group "${activeRoom.name}"? This action is permanent and deletes all messages.`
      )
    ) {
      return;
    }
    try {
      await api.delete(`/chat/rooms/${activeRoom.id}`);
      const remainingRooms = rooms.filter((r) => r.id !== activeRoom.id);
      setRooms(remainingRooms);
      const general = remainingRooms.find((r) => r.name.toLowerCase() === "general chat");
      setActiveRoom(general || remainingRooms[0] || null);
    } catch (err) {
      console.error("Failed to delete room:", err);
      alert("Failed to delete group room.");
    }
  };

  // Invite selected staff members
  const handleInviteMembers = async () => {
    if (!activeRoom || inviteSelectedUserIds.length === 0) return;
    try {
      const res = await api.post(`/chat/rooms/${activeRoom.id}/invite`, {
        user_ids: inviteSelectedUserIds,
      });
      setRooms((prev) =>
        prev.map((r) => (r.id === activeRoom.id ? res.data : r))
      );
      setActiveRoom(res.data);
      setShowInviteModal(false);
      setInviteSelectedUserIds([]);
    } catch (err) {
      console.error("Failed to invite staff members:", err);
      alert("Failed to invite selected staff members.");
    }
  };

  // Connect websocket
  const connectWebSocket = (roomId) => {
    if (
      socketRef.current &&
      (socketRef.current.readyState === WebSocket.OPEN ||
        socketRef.current.readyState === WebSocket.CONNECTING) &&
      socketRef.current.url.includes(`/ws/chat/${roomId}`)
    ) {
      console.log("WebSocket already open or connecting to this room. Skipping reconnection.");
      return;
    }

    if (socketRef.current) socketRef.current.close();
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);

    setWsStatus("connecting");

    let wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    let host = window.location.host;

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "";
    if (apiBaseUrl.startsWith("http")) {
      try {
        const parsedUrl = new URL(apiBaseUrl);
        wsProtocol = parsedUrl.protocol === "https:" ? "wss:" : "ws:";
        host = parsedUrl.host;
      } catch (err) {
        console.error("Failed to parse VITE_API_BASE_URL for WebSocket:", err);
      }
    }

    const wsUrl = `${wsProtocol}//${host}/ws/chat/${roomId}`;
    console.log(`Connecting WebSocket: ${wsUrl}`);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connection established.");
      if (activeRoomIdRef.current === roomId) {
        setWsStatus("connected");
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "typing") {
          if (data.sender_id !== currentUser?.id) {
            setTypingUsers((prev) => ({
              ...prev,
              [data.sender_id]: data.is_typing ? data.sender_name : null,
            }));
          }
        } else if (data.type === "room_deleted") {
          setRooms((prevRooms) => {
            const updated = prevRooms.filter((r) => r.id !== data.room_id);
            if (activeRoomIdRef.current === data.room_id) {
              alert("This group has been deleted by its creator/admin.");
              const general = updated.find((r) => r.name.toLowerCase() === "general chat");
              setActiveRoom(general || updated[0] || null);
            }
            return updated;
          });
        } else if (data.type === "reaction_update") {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === data.message_id
                ? { ...msg, reactions: data.reactions }
                : msg
            )
          );
        } else if (data.type === "message_edit") {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === data.id
                ? { ...msg, content: data.content, edited: true }
                : msg
            )
          );
        } else {
          if (data.room_id === activeRoomIdRef.current) {
            setMessages((prev) => {
              // Ensure we don't append duplicate messages (e.g. system join messages races)
              if (prev.some((m) => m.id === data.id)) {
                return prev;
              }
              const updated = [...prev, data];
              updatePresenceFromMessages([data]);
              return updated;
            });
            if (data.sender_id !== currentUser?.id) {
              playNotificationSound();
            }
            if (data.sender_id) {
              setTypingUsers((prev) => ({
                ...prev,
                [data.sender_id]: null,
              }));
            }
          }
        }
      } catch (err) {
        console.error("Error parsing WS message:", err);
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
      if (activeRoomIdRef.current === roomId) {
        setWsStatus("disconnected");
      }
    };

    ws.onclose = (event) => {
      console.log(`WebSocket closed: ${event.code}`);
      if (activeRoomIdRef.current === roomId) {
        setWsStatus("disconnected");
        if (event.code !== 4001 && event.code !== 4002) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket(roomId);
          }, 3000);
        }
      }
    };

    socketRef.current = ws;
  };

  // Input listener tracking typing state
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    if (socketRef.current && wsStatus === "connected") {
      if (!isTypingSent) {
        setIsTypingSent(true);
        socketRef.current.send(
          JSON.stringify({
            type: "typing",
            is_typing: true,
          })
        );
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        if (socketRef.current && wsStatus === "connected") {
          socketRef.current.send(
            JSON.stringify({
              type: "typing",
              is_typing: false,
            })
          );
        }
        setIsTypingSent(false);
      }, 1500);
    }
  };

  // Send message
  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!newMessage.trim() || !socketRef.current || wsStatus !== "connected") return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    socketRef.current.send(
      JSON.stringify({
        type: "typing",
        is_typing: false,
      })
    );
    setIsTypingSent(false);

    socketRef.current.send(
      JSON.stringify({
        type: "message",
        content: newMessage.trim(),
      })
    );
    setNewMessage("");
  };

  // Save edited message
  const handleSaveEdit = (e) => {
    e?.preventDefault();
    if (!newMessage.trim() || !socketRef.current || wsStatus !== "connected" || !editingMessageId) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    socketRef.current.send(
      JSON.stringify({
        type: "typing",
        is_typing: false,
      })
    );
    setIsTypingSent(false);

    socketRef.current.send(
      JSON.stringify({
        type: "edit",
        message_id: editingMessageId,
        content: newMessage.trim(),
      })
    );
    setEditingMessageId(null);
    setNewMessage("");
  };

  // Toggle emoji reactions
  const handleToggleReaction = (msgId, emoji) => {
    if (!socketRef.current || wsStatus !== "connected") return;

    const msg = messages.find((m) => m.id === msgId);
    if (!msg) return;

    const reactions = msg.reactions || {};
    const userList = reactions[emoji] || [];
    const uid = String(currentUser?.id);
    const hasReacted = userList.includes(uid);

    socketRef.current.send(
      JSON.stringify({
        type: "reaction",
        message_id: msgId,
        emoji: emoji,
        action: hasReacted ? "remove" : "add",
      })
    );
  };

  // Suggestions based on staff role
  const getSuggestions = () => {
    const role = currentUser?.role || "";
    switch (role) {
      case "admin":
        return ["System diagnostics clear", "Audit user access permissions", "System log check completed", "Review database metrics"];
      case "business_manager":
        return ["Approve budget allocation", "Send financial forecast", "Let's align on next steps", "Schedule operations sync"];
      case "supply_manager":
        return ["Verify raw materials stock", "Onboard new parts vendor", "Supplier contract signed", "Restock quantities optimal"];
      case "factory_manager":
        return ["Assembly lines running at capacity", "Completed batch quality audit", "Maintenance checklist updated", "Ready for shipping"];
      case "warehouse_manager":
        return ["Loading dock 3 clear", "Inventory records matching", "Order dispatch complete", "Space allocation maximized"];
      case "logistics_manager":
        return ["Reroute delivery trucks", "Transit delay resolved", "Dispatched next order batch", "Route plans optimized"];
      default:
        return ["Got it!", "On it now", "Let me check...", "Approved"];
    }
  };

  // Send suggestion instantly
  const handleSendSuggestion = (text) => {
    if (!socketRef.current || wsStatus !== "connected") return;
    socketRef.current.send(
      JSON.stringify({
        type: "message",
        content: text,
      })
    );
  };

  // Create group room
  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!newRoomName.trim() || creatingRoom) return;

    try {
      setCreatingRoom(true);
      const res = await api.post("/chat/rooms", {
        name: newRoomName.trim(),
        type: "group",
      });
      setRooms((prev) => [res.data, ...prev]);
      setActiveRoom(res.data);
      setNewRoomName("");
    } catch (err) {
      console.error("Failed to create room:", err);
      setErrorMsg("Failed to create new room.");
    } finally {
      setCreatingRoom(false);
    }
  };

  // Start DM chat
  const handleStartDirectChat = async (targetUser) => {
    const sortedIds = [currentUser.id, targetUser.id].sort((a, b) => a - b);
    const roomName = `direct_DM_${sortedIds[0]}_${sortedIds[1]}`;

    const existing = rooms.find((r) => r.name === roomName && r.type === "direct");
    if (existing) {
      setActiveRoom(existing);
      return;
    }

    try {
      const res = await api.post("/chat/rooms", {
        name: roomName,
        type: "direct",
      });
      setRooms((prev) => [res.data, ...prev]);
      setActiveRoom(res.data);
    } catch (err) {
      console.error("Failed to create direct chat room:", err);
    }
  };

  // Change active theme
  const changeTheme = (themeId) => {
    setActiveTheme(themeId);
    localStorage.setItem("korvex_chat_theme", themeId);
  };

  // Time formatter
  const formatTime = (isoString) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch (e) {
      return "";
    }
  };

  // Resolve direct room title
  const resolveRoomName = (room) => {
    if (!room) return "";
    if (room.type !== "direct") return room.name;

    const tokens = room.name.split("_");
    if (tokens.length < 4) return "Direct Message";
    const idA = parseInt(tokens[2]);
    const idB = parseInt(tokens[3]);
    const partnerId = idA === currentUser?.id ? idB : idA;

    const partner = users.find((u) => u.id === partnerId);
    return partner ? partner.name : `User #${partnerId}`;
  };

  // Helper: Resolve partner info for the info sidebar
  const getDMInfo = () => {
    if (!activeRoom || activeRoom.type !== "direct") return null;
    const tokens = activeRoom.name.split("_");
    if (tokens.length < 4) return null;
    const idA = parseInt(tokens[2]);
    const idB = parseInt(tokens[3]);
    const partnerId = idA === currentUser?.id ? idB : idA;
    return users.find((u) => u.id === partnerId) || { name: `Staff Member #${partnerId}`, email: "N/A", role: "N/A" };
  };

  // Helper: Resolve list of group members
  const getGroupMembers = () => {
    if (!activeRoom || !activeRoom.participant_ids) return [];
    const members = [];
    const seenIds = new Set();

    const currentUserIdStr = currentUser?.id ? String(currentUser.id) : null;
    const hasCurrentUser = activeRoom.participant_ids.some(id => String(id) === currentUserIdStr);
    
    if (hasCurrentUser && currentUser) {
      members.push({
        id: currentUser.id,
        name: currentUser.name + " (You)",
        role: currentUser.role,
        email: currentUser.email,
      });
      seenIds.add(currentUserIdStr);
    }

    users.forEach((u) => {
      const uidStr = String(u.id);
      const isParticipant = activeRoom.participant_ids.some(id => String(id) === uidStr);
      if (isParticipant && !seenIds.has(uidStr)) {
        members.push(u);
        seenIds.add(uidStr);
      }
    });

    return members;
  };

  // Staff list status code generator (dynamic representation)
  const getUserStatus = (user) => {
    const code = user.name.charCodeAt(0) % 4;
    if (code === 0) return { label: "Online", color: "bg-emerald-500" };
    if (code === 1) return { label: "Away", color: "bg-amber-500" };
    if (code === 2) return { label: "DND", color: "bg-rose-500" };
    return { label: "Offline", color: "bg-gray-600" };
  };

  // Helper to get dynamic presence status for room header: Green=Joined, Yellow=Online, Red=Left
  const getRoomHeaderStatus = (room) => {
    if (!room) return null;
    if (room.type === "direct") {
      const partner = getDMInfo();
      if (!partner) return { label: "Left", color: "bg-red-500", text: "text-red-500" };
      
      const realPresence = userPresenceMap[partner.name];
      if (realPresence === "online") {
        return { label: "Joined", color: "bg-emerald-500", text: "text-emerald-500" };
      } else if (realPresence === "offline") {
        return { label: "Left", color: "bg-rose-500", text: "text-rose-500" };
      }

      // Static fallback using status generator
      const staticStatus = getUserStatus(partner);
      const isOnline = staticStatus.label === "Online" || staticStatus.label === "Away" || staticStatus.label === "DND";
      return {
        label: isOnline ? "Joined" : "Left",
        color: isOnline ? "bg-emerald-500" : "bg-rose-500",
        text: isOnline ? "text-emerald-500" : "text-rose-500",
      };
    } else {
      // Group: Green if WebSocket connected (active), Yellow if connecting, Red if disconnected
      if (wsStatus === "connected") {
        return { label: "Joined", color: "bg-emerald-500", text: "text-emerald-500" };
      } else if (wsStatus === "connecting") {
        return { label: "Online", color: "bg-amber-500", text: "text-amber-500" };
      } else {
        return { label: "Left", color: "bg-rose-500", text: "text-rose-500" };
      }
    }
  };

  // Text highlighting for search filter
  const highlightText = (text, highlight) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, "gi"));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={i} className="bg-yellow-500/40 text-yellow-100 rounded px-0.5 border border-yellow-500/30">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  // Filters rooms / users list on the left sidebar
  const filteredRooms = rooms.filter((r) => {
    const name = resolveRoomName(r);
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "groups" ? r.type !== "direct" : r.type === "direct";
    return matchesSearch && matchesTab;
  });

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`w-full ${layoutHeight} ${layoutClasses} flex transition-all duration-300`}>
      <div className={`w-full h-full flex rounded-3xl overflow-hidden border transition-all duration-300 ${tBorder} ${theme.bg}`}>
      
      {/* 1. LEFT PANEL: SIDEBAR DIRECTORY */}
      <div className={`w-80 flex flex-shrink-0 flex-col border-r transition-all duration-300 ${tBorder} ${theme.sidebar}`}>
        
        {/* User Card with Status dropdown */}
        <div className={`p-4 border-b flex items-center justify-between ${tBorder}`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-500 to-indigo-500 flex items-center justify-center font-black text-white text-xs shadow-md">
              {currentUser?.name?.charAt(0).toUpperCase() || "K"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className={`text-xs font-bold truncate ${tTextTitle}`}>{currentUser?.name || "Staff Member"}</span>
              <span className={`text-[9px] uppercase tracking-wider font-semibold truncate capitalize leading-none mt-0.5 ${tTextMuted}`}>
                {currentUser?.role?.replace("_", " ")}
              </span>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all text-[9px] font-black ${tCardBg} ${tTextTitle} ${tHoverBg}`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${myStatus === "online" ? "bg-emerald-500" : myStatus === "away" ? "bg-amber-500" : myStatus === "busy" ? "bg-rose-500" : "bg-gray-500"}`} />
              <span>{myStatus.toUpperCase()}</span>
            </button>

            {showStatusDropdown && (
              <div className={`absolute right-0 mt-1 w-28 rounded-xl p-1 z-20 shadow-2xl ${
                isLight ? "bg-white border border-slate-200" : "bg-slate-900 border border-white/10"
              }`}>
                {["online", "away", "busy", "offline"].map((statusOption) => (
                  <button
                    key={statusOption}
                    onClick={() => {
                      setMyStatus(statusOption);
                      setShowStatusDropdown(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all text-left ${tTextMuted} hover:${tTextTitle} ${tHoverBg}`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${statusOption === "online" ? "bg-emerald-500" : statusOption === "away" ? "bg-amber-500" : statusOption === "busy" ? "bg-rose-500" : "bg-gray-500"}`} />
                    <span className="capitalize">{statusOption}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Directory Search & Room Creator */}
        <div className={`p-4 border-b flex flex-col gap-3 ${tBorder}`}>
          <div className="relative">
            <Search size={14} className={`absolute left-3.5 top-3 ${tTextMuted}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chat or users..."
              className={`w-full h-9 pl-9 pr-4 rounded-xl text-xs font-semibold focus:outline-none transition-all ${theme.inputBg}`}
            />
          </div>

          {/* Pill Toggle for Groups vs DMs */}
          <div className={`flex p-1 rounded-xl border ${tCardBg} w-full`}>
            <button
              type="button"
              onClick={() => setActiveTab("groups")}
              className={`flex-1 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all text-center ${
                activeTab === "groups"
                  ? isLight ? "bg-slate-950 text-white shadow-sm" : "bg-white/10 text-white shadow-sm"
                  : `${tTextMuted} hover:${tTextTitle}`
              }`}
            >
              Groups
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("dms")}
              className={`flex-1 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all text-center ${
                activeTab === "dms"
                  ? isLight ? "bg-slate-950 text-white shadow-sm" : "bg-white/10 text-white shadow-sm"
                  : `${tTextMuted} hover:${tTextTitle}`
              }`}
            >
              DMs
            </button>
          </div>

          {activeTab === "groups" && (
            <form onSubmit={handleCreateRoom} className="flex gap-2 animate-fade-in">
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="Create group room..."
                className={`flex-1 h-9 px-3 rounded-lg text-[11px] font-semibold focus:outline-none transition-all ${theme.inputBg}`}
              />
              <button
                type="submit"
                disabled={creatingRoom || !newRoomName.trim()}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${theme.btnPrimary} disabled:opacity-40 disabled:scale-100 active:scale-95`}
              >
                {creatingRoom ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Plus size={16} />
                )}
              </button>
            </form>
          )}
        </div>

        {/* Channels/Colleagues lists */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">
          
          {/* Rooms */}
          <div>
            <p className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 mb-2 ${tTextMuted}`}>
              {activeTab === "groups" ? "Rooms & Channels" : "Direct Messages"}
            </p>
            {loadingRooms ? (
              <div className={`flex items-center gap-2 px-3 py-2 text-xs ${tTextMuted}`}>
                <Loader2 size={12} className="animate-spin" /> Loading...
              </div>
            ) : filteredRooms.length === 0 ? (
              <p className={`text-[11px] px-3 py-1 italic ${tTextMuted}`}>
                {activeTab === "groups" ? "No group rooms" : "No direct messages"}
              </p>
            ) : (
              <div className="space-y-0.5 animate-fade-in">
                {filteredRooms.map((room) => {
                  const isActive = activeRoom?.id === room.id;
                  const nameDisplay = resolveRoomName(room);
                  
                  // Get online status for direct or group rooms
                  let isOnline = false;
                  if (room.type === "direct") {
                    const tokens = room.name.split("_");
                    if (tokens.length >= 4) {
                      const idA = parseInt(tokens[2]);
                      const idB = parseInt(tokens[3]);
                      const partnerId = idA === currentUser?.id ? idB : idA;
                      const partner = users.find((u) => u.id === partnerId);
                      if (partner) {
                        const realPresence = userPresenceMap[partner.name];
                        const staticStatus = getUserStatus(partner);
                        isOnline = realPresence
                          ? realPresence === "online"
                          : (staticStatus.label === "Online" || staticStatus.label === "Away" || staticStatus.label === "DND");
                      }
                    }
                  } else {
                    // Group: connected if it's the active room and WS is connected
                    isOnline = isActive ? (wsStatus === "connected") : true; 
                  }
                  const dotColor = isOnline ? "bg-emerald-500" : "bg-rose-500";

                  return (
                    <button
                      key={room.id}
                      onClick={() => setActiveRoom(room)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left border border-transparent ${
                        isActive
                          ? theme.activeItem
                          : `text-slate-400 hover:${tTextTitle} ${tHoverBg}`
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black ${
                          isActive ? (isLight ? "bg-slate-800 text-white" : "bg-white/10 text-white") : tCardBg
                        } ${isActive ? "" : tTextTitle}`}>
                          {nameDisplay.charAt(0).toUpperCase()}
                        </div>
                        {/* Dot at the bottom-left corner */}
                        <div className={`absolute -bottom-0.5 -left-0.5 w-2 h-2 rounded-full border ${isLight ? "border-white" : "border-slate-900"} ${dotColor}`} />
                      </div>
                      <span className="truncate">{nameDisplay}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Company Staff Directory (DMs) */}
          {activeTab === "dms" && (
            <div className="animate-fade-in">
              <p className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 mb-2 ${tTextMuted}`}>
                Company Colleagues
              </p>
              {loadingUsers ? (
                <div className={`flex items-center gap-2 px-3 py-2 text-xs ${tTextMuted}`}>
                  <Loader2 size={12} className="animate-spin" /> Loading...
                </div>
              ) : filteredUsers.length === 0 ? (
                <p className={`text-[11px] px-3 py-1 italic ${tTextMuted}`}>No other staff</p>
              ) : (
                <div className="space-y-0.5">
                  {filteredUsers.map((user) => {
                    const userPresence = getUserStatus(user);
                    const realPresence = userPresenceMap[user.name];
                    const isOnline = realPresence
                      ? realPresence === "online"
                      : (userPresence.label === "Online" || userPresence.label === "Away" || userPresence.label === "DND");
                    const dotColor = isOnline ? "bg-emerald-500" : "bg-rose-500";

                    return (
                      <button
                        key={user.id}
                        onClick={() => handleStartDirectChat(user)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[11px] font-bold text-slate-400 hover:${tTextTitle} ${tHoverBg} transition-all text-left`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <div className="relative flex-shrink-0">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold ${tCardBg} ${tTextTitle}`}>
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            {/* Dot at the bottom-left corner */}
                            <div className={`absolute -bottom-0.5 -left-0.5 w-2 h-2 rounded-full border ${isLight ? "border-white" : "border-slate-900"} ${dotColor}`} />
                          </div>
                          <div className="flex flex-col truncate">
                            <span className={`truncate text-[11px] ${tTextTitle}`}>{user.name}</span>
                            <span className={`text-[9px] capitalize leading-none mt-0.5 ${tTextMuted}`}>
                              {user.role?.replace("_", " ")}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. CENTER PANEL: ACTIVE CHAT WINDOW */}
      <div className={`flex-1 flex flex-col min-w-0 ${isLight ? "bg-slate-50/50" : "bg-black/10"}`}>
        {activeRoom ? (
          <>
            {/* Header */}
            <div className={`h-16 px-6 border-b flex items-center justify-between transition-all duration-300 min-w-0 ${theme.header} ${tBorder}`}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative flex-shrink-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-all duration-300 ${tCardBg} ${tTextTitle}`}>
                    {resolveRoomName(activeRoom).charAt(0).toUpperCase()}
                  </div>
                  {/* Status dot in the bottom-left corner */}
                  {(() => {
                    const status = getRoomHeaderStatus(activeRoom);
                    const isOnline = status?.label === "Joined" || status?.label === "Online";
                    const dotColor = isOnline ? "bg-emerald-500" : "bg-rose-500";
                    return (
                      <div className={`absolute -bottom-0.5 -left-0.5 w-2.5 h-2.5 rounded-full border-2 ${
                        isLight ? "border-white" : "border-slate-900"
                      } ${dotColor}`} />
                    );
                  })()}
                </div>
                <div className="flex flex-col min-w-0">
                  <h3 className={`text-sm font-black truncate leading-none ${tTextTitle}`}>
                    {resolveRoomName(activeRoom)}
                  </h3>
                  {(() => {
                    const status = getRoomHeaderStatus(activeRoom);
                    if (!status) return null;
                    const isOnline = status.label === "Joined" || status.label === "Online";
                    return (
                      <span className={`text-[9px] font-black uppercase tracking-wider mt-1 ${
                        isOnline ? "text-emerald-500" : "text-rose-500"
                      }`}>
                        {isOnline ? "Online" : "Offline"}
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* Message Search, Info sidebar and Theme Toggles */}
              <div className="flex items-center gap-4">
                
                {/* Message Filter Input */}
                <div className="relative hidden md:block">
                  <Search size={12} className={`absolute left-2.5 top-2.5 ${tTextMuted}`} />
                  <input
                    type="text"
                    value={msgSearchQuery}
                    onChange={(e) => setMsgSearchQuery(e.target.value)}
                    placeholder="Search messages..."
                    className={`w-36 h-7 pl-7 pr-2 rounded-lg text-[10px] font-semibold focus:outline-none transition-all ${theme.inputBg}`}
                  />
                  {msgSearchQuery && (
                    <button
                      onClick={() => setMsgSearchQuery("")}
                      className={`absolute right-2 top-2.5 ${tTextMuted} hover:${tTextTitle}`}
                    >
                      <X size={10} />
                    </button>
                  )}
                </div>

                {/* Notifications Dropdown Bell */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                    className={`p-1.5 rounded-lg transition-all relative ${
                      showNotifDropdown
                        ? isLight ? "bg-slate-200 text-slate-900" : "bg-white/10 text-white"
                        : `${tTextMuted} hover:${tTextTitle} ${tHoverBg}`
                    }`}
                    title="Notifications"
                  >
                    <Bell size={15} />
                    {notifications.some((n) => !n.is_read) && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white/10 animate-pulse" />
                    )}
                  </button>

                  {showNotifDropdown && (
                    <div className={`absolute right-0 mt-2 w-80 rounded-2xl p-2 z-30 shadow-2xl animate-fade-in ${tModalBg} max-h-96 flex flex-col`}>
                      <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 mb-2">
                        <span className={`text-xs font-black uppercase tracking-wider ${tTextTitle}`}>Notifications</span>
                        {notifications.some((n) => !n.is_read) && (
                          <button
                            onClick={handleMarkAllNotificationsRead}
                            className="text-[10px] font-bold text-violet-400 hover:text-violet-300 transition-colors"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      
                      <div className="overflow-y-auto custom-scrollbar flex-1 space-y-1">
                        {notifications.length === 0 ? (
                          <div className={`text-center py-6 text-xs ${tTextMuted} italic`}>
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((notif) => {
                            const isPending = notif.status === "pending";
                            return (
                              <div
                                key={notif.id}
                                onClick={() => handleNotificationClick(notif)}
                                className={`w-full text-left p-2.5 rounded-xl transition-all flex flex-col gap-1 border border-transparent ${
                                  !notif.is_read
                                    ? isLight ? "bg-slate-100 border-slate-200/50" : "bg-white/[0.04] border-white/5"
                                    : ""
                                } ${isPending ? "" : `cursor-pointer hover:${tHoverBg}`}`}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span className={`text-xs font-black ${tTextTitle} truncate max-w-[180px]`}>
                                    {notif.title}
                                  </span>
                                  <span className={`text-[8px] font-bold uppercase tracking-wide ${tTextMuted}`}>
                                    {formatTime(notif.created_at)}
                                  </span>
                                </div>
                                <p className={`text-[11px] leading-snug font-semibold ${tTextMuted}`}>
                                  {notif.content}
                                </p>
                                
                                {isPending ? (
                                  <div className="flex items-center gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                                    <button
                                      onClick={(e) => handleAcceptInvite(notif, e)}
                                      className="flex-1 py-1 px-2.5 rounded-lg text-[10px] font-bold text-center transition-all bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm"
                                    >
                                      Accept
                                    </button>
                                    <button
                                      onClick={(e) => handleDeclineInvite(notif, e)}
                                      className="flex-1 py-1 px-2.5 rounded-lg text-[10px] font-bold text-center transition-all bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30"
                                    >
                                      Decline
                                    </button>
                                  </div>
                                ) : (
                                  notif.status && notif.status !== "pending" && (
                                    <span className={`text-[9px] font-bold mt-1 uppercase tracking-wider ${
                                      notif.status === "accepted" ? "text-emerald-400" : "text-rose-400"
                                    }`}>
                                      Invitation {notif.status}
                                    </span>
                                  )
                                )}
                                
                                {!isPending && !notif.is_read && (
                                  <span className={`text-[9px] font-bold mt-0.5 text-violet-400`}>
                                    Click to open room
                                  </span>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sound Indicator toggle */}
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-1.5 rounded-lg transition-all ${tTextMuted} hover:${tTextTitle} ${tHoverBg}`}
                  title={isMuted ? "Unmute sounds" : "Mute sounds"}
                >
                  {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                </button>

                {/* Info Sidebar toggle */}
                <button
                  onClick={() => setShowRoomInfo(!showRoomInfo)}
                  className={`p-1.5 rounded-lg transition-all ${
                    showRoomInfo
                      ? isLight ? "bg-slate-200 text-slate-900" : "bg-white/10 text-white"
                      : `${tTextMuted} hover:${tTextTitle} ${tHoverBg}`
                  }`}
                  title="Room Info"
                >
                  <Info size={15} />
                </button>

                {/* Theme Selector */}
                <div className={`flex items-center gap-1 p-1 rounded-xl border ${tCardBg}`}>
                  {Object.keys(THEMES).map((tId) => (
                    <button
                      key={tId}
                      onClick={() => changeTheme(tId)}
                      className={`px-2 py-0.5 rounded-lg text-[8px] font-bold uppercase tracking-wider transition-all ${
                        activeTheme === tId
                          ? isLight ? "bg-slate-950 text-white shadow-sm" : "bg-white/10 text-white shadow-sm"
                          : `${tTextMuted} hover:${tTextTitle}`
                      }`}
                    >
                      {THEMES[tId].name.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-2.5 flex items-center gap-2">
                <AlertCircle size={14} />
                <span>{errorMsg}</span>
                <button onClick={() => setErrorMsg("")} className="ml-auto text-red-400 hover:text-white font-bold">×</button>
              </div>
            )}

            {/* Message Thread */}
            <div ref={feedContainerRef} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
              {messages.map((msg) => {
                const isMe = msg.sender_id === currentUser?.id;
                const isSystem = msg.message_type === "system";

                if (isSystem) {
                  if (msg.content?.includes("has joined the chat") || msg.content?.includes("left the chat")) {
                    return null; // Hide join/left system messages in the stream
                  }
                  return (
                    <div key={msg.id} className="flex justify-center">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-bold tracking-wide shadow-sm ${theme.systemMsg}`}>
                        {msg.content}
                      </span>
                    </div>
                  );
                }

                const isHovered = hoveredMsgId === msg.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"} relative`}
                    onMouseEnter={() => setHoveredMsgId(msg.id)}
                    onMouseLeave={() => setHoveredMsgId(null)}
                  >
                    {/* Name */}
                    {!isMe && (
                      <span className={`text-[10px] font-bold mb-1 ml-1 ${tTextMuted}`}>
                        {msg.sender_name}
                      </span>
                    )}

                    <div className="flex items-end gap-2 max-w-[75%] relative">
                      {isMe && (
                        <div className="flex items-center gap-1.5 mb-1 shrink-0">
                          {isHovered && wsStatus === "connected" && (
                            <button
                              onClick={() => {
                                setEditingMessageId(msg.id);
                                setNewMessage(msg.content);
                              }}
                              className={`p-1 rounded-lg transition-all text-xs opacity-60 hover:opacity-100 hover:bg-slate-200/50 dark:hover:bg-white/10`}
                              title="Edit message"
                            >
                              <Edit3 size={10} className={tTextMuted} />
                            </button>
                          )}
                          <span className={`text-[8px] font-semibold ${tTextMuted}`}>
                            {formatTime(msg.timestamp)}
                          </span>
                        </div>
                      )}

                      {/* Reaction bar popover */}
                      {isHovered && wsStatus === "connected" && (
                        <div className={`absolute -top-7 ${isMe ? "right-0" : "left-0"} flex gap-1 p-1 rounded-xl shadow-2xl z-10 animate-fade-in ${tModalBg}`}>
                          {["👍", "❤️", "🔥", "👏", "⚠️"].map((emoji) => {
                            const reactions = msg.reactions || {};
                            const userList = reactions[emoji] || [];
                            const hasReacted = userList.includes(String(currentUser?.id));
                            return (
                              <button
                                key={emoji}
                                onClick={() => handleToggleReaction(msg.id, emoji)}
                                className={`w-5.5 h-5.5 flex items-center justify-center rounded-lg text-xs hover:scale-125 transition-transform ${
                                  hasReacted
                                    ? isLight ? "bg-slate-200" : "bg-white/15"
                                    : "opacity-75 hover:opacity-100"
                                }`}
                              >
                                {emoji}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Bubble */}
                      <div className={`px-4 py-2.5 rounded-2xl text-xs font-semibold leading-relaxed break-words border ${
                        isMe
                          ? `${theme.bubbleOutgoing} rounded-br-none border-transparent`
                          : `${theme.bubbleIncoming} rounded-bl-none`
                      }`}>
                        <div>{highlightText(msg.content, msgSearchQuery)}</div>
                        {msg.edited && (
                          <div className={`text-[8px] mt-0.5 opacity-60 font-semibold select-none ${isMe ? "text-right" : "text-left"}`}>
                            edited
                          </div>
                        )}
                      </div>

                      {!isMe && (
                        <span className={`text-[8px] font-semibold mb-1 ${tTextMuted}`}>
                          {formatTime(msg.timestamp)}
                        </span>
                      )}
                    </div>

                    {/* Reactions Display */}
                    {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                      <div className={`flex gap-1 mt-1 flex-wrap ${isMe ? "justify-end" : "justify-start"}`}>
                        {Object.entries(msg.reactions).map(([emoji, usersList]) => {
                          if (!usersList || usersList.length === 0) return null;
                          const hasReacted = usersList.includes(String(currentUser?.id));
                          return (
                            <button
                              key={emoji}
                              onClick={() => handleToggleReaction(msg.id, emoji)}
                              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold border transition-all ${
                                hasReacted
                                  ? "bg-violet-500/20 border-violet-500/30 text-violet-300"
                                  : `${tCardBg} ${tTextMuted} hover:${tTextTitle}`
                              }`}
                            >
                              <span>{emoji}</span>
                              <span>{usersList.length}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Dynamic typing bubbles */}
              {Object.entries(typingUsers).map(([userId, userName]) => {
                if (!userName) return null;
                return (
                  <div key={userId} className={`flex items-center gap-2 text-[10px] font-bold ml-1 py-1 ${tTextMuted}`}>
                    <div className="flex gap-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full animate-bounce ${isLight ? "bg-slate-400" : "bg-gray-500"}`} style={{ animationDelay: "0ms" }} />
                      <span className={`w-1.5 h-1.5 rounded-full animate-bounce ${isLight ? "bg-slate-400" : "bg-gray-500"}`} style={{ animationDelay: "150ms" }} />
                      <span className={`w-1.5 h-1.5 rounded-full animate-bounce ${isLight ? "bg-slate-400" : "bg-gray-500"}`} style={{ animationDelay: "300ms" }} />
                    </div>
                    <span>{userName} is typing...</span>
                  </div>
                );
              })}

              <div ref={feedEndRef} />
            </div>

            {/* Smart Suggestion Chips */}
            {wsStatus === "connected" && (
              <div className="px-6 py-1.5 flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none">
                {getSuggestions().map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendSuggestion(suggestion)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all active:scale-95 flex-shrink-0 ${tCardBg} ${tTextMuted} hover:${tTextTitle} ${tHoverBg}`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {/* Input form */}
            <div className={`p-4 border-t transition-all duration-300 ${isLight ? "bg-slate-50" : "bg-black/30"} ${tBorder}`}>
              {editingMessageId && (
                <div className="flex items-center justify-between max-w-4xl mx-auto w-full mb-2 text-[10px] font-bold">
                  <span className={`${tTextMuted}`}>Editing message...</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingMessageId(null);
                      setNewMessage("");
                    }}
                    className="text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
              <form onSubmit={editingMessageId ? handleSaveEdit : handleSendMessage} className="flex gap-3 max-w-4xl mx-auto w-full">
                <div className={`flex-1 flex items-center gap-2 px-4 py-1.5 rounded-2xl border transition-all ${tCardBg} focus-within:ring-2 ${
                  isLight ? "focus-within:ring-slate-900/10 focus-within:border-slate-500" : "focus-within:ring-white/10 focus-within:border-white/20"
                }`}>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={handleInputChange}
                    placeholder={
                      wsStatus === "connected"
                        ? `Message #${resolveRoomName(activeRoom)}...`
                        : "Establishing link to WebSocket..."
                    }
                    disabled={wsStatus !== "connected"}
                    className="flex-1 bg-transparent text-xs font-semibold focus:outline-none outline-none border-none py-2 text-current placeholder-slate-500/70 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={wsStatus !== "connected" || !newMessage.trim()}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${theme.btnPrimary} disabled:opacity-40 disabled:scale-100 active:scale-95 shrink-0`}
                  >
                    <Send size={12} />
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
            <MessageSquare size={36} className={`${tTextMuted}`} />
            <div>
              <p className={`font-bold text-sm ${tTextTitle}`}>No active conversation</p>
              <p className={`text-xs mt-1 ${tTextMuted}`}>
                Select a room or teammate on the left to start collaborating.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 3. RIGHT PANEL: DETAILS DRAWER */}
      {activeRoom && showRoomInfo && (
        <div className={`w-64 flex flex-shrink-0 flex-col border-l transition-all duration-300 p-4 ${tBorder} ${theme.sidebar}`}>
          
          <div className={`flex items-center justify-between pb-3 border-b mb-4 ${tBorder}`}>
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${tTextMuted}`}>
              Details & Info
            </span>
            <button
              onClick={() => setShowRoomInfo(false)}
              className={`transition-all ${tTextMuted} hover:${tTextTitle}`}
            >
              <X size={14} />
            </button>
          </div>

          <div className="flex flex-col gap-5 overflow-y-auto flex-1">
            
            {/* Room Core info */}
            <div className="space-y-2">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border flex-shrink-0 ${tCardBg}`}>
                {activeRoom.type === "direct" ? <UserIcon size={20} className={tTextTitle} /> : <Hash size={20} className={tTextTitle} />}
              </div>
              <div className="flex flex-col">
                <span className={`text-xs font-black ${tTextTitle}`}>{resolveRoomName(activeRoom)}</span>
                <span className={`text-[10px] capitalize mt-0.5 ${tTextMuted}`}>
                  Type: {activeRoom.type === "direct" ? "Direct Message" : "Group Channel"}
                </span>
              </div>
            </div>

            {/* Specific context information */}
            {activeRoom.type === "direct" ? (
              <div className={`space-y-3 p-3 rounded-2xl ${tCardBg}`}>
                <span className={`text-[9px] font-black uppercase tracking-wider block mb-1 ${tTextMuted}`}>
                  Teammate Details
                </span>
                {(() => {
                  const partner = getDMInfo();
                  if (!partner) return null;
                  return (
                    <div className="space-y-2 text-[10px]">
                      <div className="flex flex-col">
                        <span className={`font-bold ${tTextMuted}`}>Full Name</span>
                        <span className={`font-semibold ${tTextTitle}`}>{partner.name}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className={`font-bold ${tTextMuted}`}>Email Address</span>
                        <span className={`font-semibold truncate ${tTextTitle}`}>{partner.email}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className={`font-bold ${tTextMuted}`}>Assigned Role</span>
                        <span className={`font-semibold capitalize ${tTextTitle}`}>{partner.role?.replace("_", " ")}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Description Box */}
                <div className={`p-3 rounded-2xl text-[10px] space-y-1 ${tCardBg}`}>
                  <span className={`text-[9px] font-black uppercase tracking-wider block ${tTextMuted}`}>
                    Description
                  </span>
                  <p className={`italic leading-relaxed ${isLight ? "text-slate-600" : "text-slate-300"}`}>
                    {activeRoom.description || "No description provided for this group."}
                  </p>
                </div>

                {/* Group Details */}
                <div className={`p-3 rounded-2xl text-[10px] ${tCardBg}`}>
                  <span className={`text-[9px] font-black uppercase tracking-wider block mb-2 ${tTextMuted}`}>
                    Group Details
                  </span>
                  <div className={`flex justify-between py-1 border-b ${tBorder}`}>
                    <span className={`font-bold ${tTextMuted}`}>Created By</span>
                    <span className={`font-semibold ${tTextTitle}`}>
                      {activeRoom.created_by === currentUser?.id
                        ? "You"
                        : users.find((u) => u.id === activeRoom.created_by)?.name || "Creator"}
                    </span>
                  </div>
                  <div className={`flex justify-between py-1 border-b ${tBorder}`}>
                    <span className={`font-bold ${tTextMuted}`}>Scope</span>
                    <span className={`font-semibold ${tTextTitle}`}>
                      {activeRoom.participant_ids?.length > 0 ? "Private Members" : "Company-wide"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className={`font-bold ${tTextMuted}`}>Total Members</span>
                    <span className={`font-semibold ${tTextTitle}`}>
                      {activeRoom.participant_ids?.length > 0
                        ? `${activeRoom.participant_ids.length} Staff`
                        : "All Staff"}
                    </span>
                  </div>
                </div>

                {/* Member Administration Actions */}
                <div className="flex flex-col gap-2">
                  {/* General Chat cannot invite/edit/delete since it's global public */}
                  {activeRoom.name !== "General Chat" && (
                    <>
                      <button
                        onClick={() => {
                          setInviteSelectedUserIds([]);
                          setInviteSearchQuery("");
                          setShowInviteModal(true);
                        }}
                        className={`w-full py-2 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all ${theme.btnPrimary}`}
                      >
                        <UserPlus size={14} />
                        <span>Invite Colleagues</span>
                      </button>

                      {/* Edit / Delete actions if user is creator or admin */}
                      {(activeRoom.created_by === currentUser?.id || currentUser?.role === "admin") && (
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          <button
                            onClick={() => {
                              setEditGroupName(activeRoom.name);
                              setEditGroupDescription(activeRoom.description || "");
                              setShowEditGroupModal(true);
                            }}
                            className={`py-1.5 px-2.5 rounded-xl border flex items-center justify-center gap-1.5 text-[10px] font-bold transition-all ${tBorder} ${tHoverBg} ${tTextTitle}`}
                          >
                            <Edit3 size={12} />
                            <span>Edit Info</span>
                          </button>
                          <button
                            onClick={handleDeleteGroup}
                            className="py-1.5 px-2.5 rounded-xl border border-red-500/20 hover:border-red-500/30 hover:bg-red-500/10 text-red-400 hover:text-red-300 flex items-center justify-center gap-1.5 text-[10px] font-bold transition-all"
                          >
                            <Trash2 size={12} />
                            <span>Delete Group</span>
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Participant list */}
                {activeRoom.participant_ids?.length > 0 && (
                  <div className="space-y-2">
                    <span className={`text-[9px] font-black uppercase tracking-wider block ${tTextMuted}`}>
                      Group Members ({activeRoom.participant_ids.length})
                    </span>
                    <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                      {getGroupMembers().map((member) => (
                        <div
                          key={member.id}
                          className={`flex items-center justify-between p-1.5 rounded-lg border text-[10px] ${tCardBg}`}
                        >
                          <div className="flex flex-col min-w-0">
                            <span className={`font-bold truncate ${tTextTitle}`}>{member.name}</span>
                            <span className={`text-[8px] truncate ${tTextMuted}`}>{member.email}</span>
                          </div>
                          <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md ${
                            member.id === activeRoom.created_by
                              ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                              : `${isLight ? "bg-slate-200 text-slate-700" : "bg-white/5 text-gray-400"}`
                          }`}>
                            {member.id === activeRoom.created_by ? "Owner" : member.role?.replace("_", " ")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quick Shared Resources */}
            <div className="space-y-2">
              <span className={`text-[9px] font-black uppercase tracking-wider block ${tTextMuted}`}>
                Shared Documents
              </span>
              <div className="space-y-1.5">
                {[
                  { name: "Supply Chain Standard.pdf", size: "2.4 MB" },
                  { name: "Inventory Log Template.xlsx", size: "1.1 MB" },
                  { name: "Route Maps.png", size: "5.8 MB" }
                ].map((doc, i) => (
                  <div key={i} className={`flex items-center gap-2 p-2 rounded-xl cursor-pointer transition-all ${tCardBg} hover:${tHoverBg}`}>
                    <FileText size={14} className={`${tTextMuted} flex-shrink-0`} />
                    <div className="flex flex-col min-w-0 text-[10px]">
                      <span className={`truncate font-bold ${tTextTitle}`}>{doc.name}</span>
                      <span className={`text-[8px] font-semibold ${tTextMuted}`}>{doc.size}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notification settings block */}
            <div className={`pt-2 border-t ${tBorder}`}>
              <label className={`flex items-center gap-2.5 cursor-pointer text-[10px] font-bold transition-all select-none ${tTextMuted} hover:${tTextTitle}`}>
                <input
                  type="checkbox"
                  checked={isMuted}
                  onChange={(e) => setIsMuted(e.target.checked)}
                  className={`rounded text-violet-500 focus:ring-0 focus:ring-offset-0 ${
                    isLight ? "bg-white border-slate-300 text-slate-900" : "bg-slate-900 border-white/10 text-violet-500"
                  }`}
                />
                <span>Mute Notification Sound</span>
              </label>
            </div>

          </div>
        </div>
      )}

      {/* 4. MODALS */}
      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md rounded-3xl p-5 shadow-2xl space-y-4 ${tModalBg}`}>
            <div className={`flex items-center justify-between pb-2 border-b ${tBorder}`}>
              <h3 className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 ${tTextTitle}`}>
                <UserPlus size={16} className={theme.accentText} />
                <span>Invite Colleagues</span>
              </h3>
              <button onClick={() => setShowInviteModal(false)} className={`transition-all ${tTextMuted} hover:${tTextTitle}`}>
                <X size={16} />
              </button>
            </div>

            {/* Staff Search Filter */}
            <div className="relative">
              <Search className={`absolute left-3 top-2.5 h-3.5 w-3.5 ${tTextMuted}`} />
              <input
                type="text"
                placeholder="Search staff members..."
                value={inviteSearchQuery}
                onChange={(e) => setInviteSearchQuery(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 text-xs rounded-2xl ${theme.inputBg}`}
              />
            </div>

            {/* Checklist of staff members who are NOT already in the room */}
            <div className="max-h-60 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
              {users
                .filter((u) => !activeRoom.participant_ids?.some(id => String(id) === String(u.id)))
                .filter((u) => u.name.toLowerCase().includes(inviteSearchQuery.toLowerCase()))
                .map((user) => {
                  const isChecked = inviteSelectedUserIds.includes(user.id);
                  return (
                    <label
                      key={user.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all select-none ${tCardBg} hover:${tHoverBg}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            setInviteSelectedUserIds((prev) =>
                              isChecked
                                ? prev.filter((id) => id !== user.id)
                                : [...prev, user.id]
                            );
                          }}
                          className={`rounded focus:ring-0 focus:ring-offset-0 ${
                            isLight ? "bg-white border-slate-300 text-slate-900" : "bg-slate-950 border-white/10"
                          }`}
                        />
                        <div className="flex flex-col text-xs">
                          <span className={`font-bold ${tTextTitle}`}>{user.name}</span>
                          <span className={`text-[10px] truncate ${tTextMuted}`}>{user.email}</span>
                        </div>
                      </div>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                        isLight ? "bg-slate-200 text-slate-700" : "bg-white/5 text-gray-400"
                      }`}>
                        {user.role?.replace("_", " ")}
                      </span>
                    </label>
                  );
                })}
              {users.filter(
                (u) =>
                  !activeRoom.participant_ids?.some(id => String(id) === String(u.id)) &&
                  u.name.toLowerCase().includes(inviteSearchQuery.toLowerCase())
              ).length === 0 && (
                <p className={`text-center text-xs py-4 ${tTextMuted}`}>No staff members available to invite.</p>
              )}
            </div>

            {/* Actions */}
            <div className={`flex justify-end gap-2.5 pt-2 border-t ${tBorder}`}>
              <button
                onClick={() => setShowInviteModal(false)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${tTextMuted} hover:${tTextTitle} ${tHoverBg}`}
              >
                Cancel
              </button>
              <button
                disabled={inviteSelectedUserIds.length === 0}
                onClick={handleInviteMembers}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${theme.btnPrimary}`}
              >
                Add Members
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Group Modal */}
      {showEditGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form
            onSubmit={handleEditGroup}
            className={`w-full max-w-md rounded-3xl p-5 shadow-2xl space-y-4 ${tModalBg}`}
          >
            <div className={`flex items-center justify-between pb-2 border-b ${tBorder}`}>
              <h3 className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 ${tTextTitle}`}>
                <Edit3 size={16} className={theme.accentText} />
                <span>Edit Group Details</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowEditGroupModal(false)}
                className={`transition-all ${tTextMuted} hover:${tTextTitle}`}
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className={`text-[10px] font-black uppercase tracking-wider ${tTextMuted}`}>
                  Group Name
                </label>
                <input
                  type="text"
                  required
                  value={editGroupName}
                  onChange={(e) => setEditGroupName(e.target.value)}
                  className={`w-full px-4 py-2 text-xs rounded-2xl ${theme.inputBg}`}
                />
              </div>

              <div className="space-y-1">
                <label className={`text-[10px] font-black uppercase tracking-wider ${tTextMuted}`}>
                  Description
                </label>
                <textarea
                  value={editGroupDescription}
                  onChange={(e) => setEditGroupDescription(e.target.value)}
                  rows={3}
                  className={`w-full px-4 py-2 text-xs rounded-2xl resize-none ${theme.inputBg}`}
                  placeholder="Enter group purpose, topics, or guidelines..."
                />
              </div>
            </div>

            {/* Actions */}
            <div className={`flex justify-end gap-2.5 pt-2 border-t ${tBorder}`}>
              <button
                type="button"
                onClick={() => setShowEditGroupModal(false)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${tTextMuted} hover:${tTextTitle} ${tHoverBg}`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${theme.btnPrimary}`}
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
    </div>
  );
};

export default ChatPage;
