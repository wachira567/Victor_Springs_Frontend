import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { MessageCircle, X, Send, Phone, MessageSquare } from "lucide-react";

const WhatsAppChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showOptions, setShowOptions] = useState(true);
  const [chatMode, setChatMode] = useState(null); // 'whatsapp' or 'tawk'
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const connectToWhatsApp = () => {
    if (socketRef.current) return;

    setIsConnecting(true);
    try {
      const bridgeUrl =
        import.meta.env.VITE_WHATSAPP_BRIDGE_URL || "http://localhost:3001";
      socketRef.current = io(bridgeUrl, {
        transports: ["websocket", "polling"],
      });

      socketRef.current.on("connect", () => {
        console.log("Connected to WhatsApp bridge");
        setIsConnected(true);
        setIsConnecting(false);
        setMessages([
          {
            sender: "system",
            text: "Connected! You can now chat directly with our admin via WhatsApp.",
            timestamp: new Date(),
          },
        ]);
      });

      socketRef.current.on("receive_message", (data) => {
        setMessages((prev) => [
          ...prev,
          {
            sender: "admin",
            text: data.text,
            timestamp: new Date(),
          },
        ]);
      });

      socketRef.current.on("error", (error) => {
        console.error("Socket error:", error);
        setIsConnected(false);
        setIsConnecting(false);
        setMessages([
          {
            sender: "system",
            text: "Connection failed. The WhatsApp chat feature is currently unavailable. Please try Tawk.to chat instead.",
            timestamp: new Date(),
          },
        ]);
      });

      socketRef.current.on("disconnect", () => {
        console.log("Disconnected from WhatsApp bridge");
        setIsConnected(false);
        setIsConnecting(false);
      });
    } catch (error) {
      console.error("Failed to connect:", error);
      setIsConnecting(false);
      setMessages([
        {
          sender: "system",
          text: "Failed to connect. The WhatsApp chat feature is currently unavailable.",
          timestamp: new Date(),
        },
      ]);
    }
  };

  const startWhatsAppChat = () => {
    setShowOptions(false);
    setChatMode("whatsapp");
    connectToWhatsApp();
  };

  const startTawkChat = () => {
    setShowOptions(false);
    setChatMode("tawk");

    // Load Tawk.to widget if available
    if (window.Tawk_API) {
      window.Tawk_API.showWidget();
      window.Tawk_API.maximize();
    } else {
      // Fallback: open WhatsApp web with admin number
      const adminNumber =
        import.meta.env.VITE_ADMIN_WHATSAPP_NUMBER || "+254754096684";
      const cleanNumber = adminNumber.replace("+", "");
      window.open(
        `https://wa.me/${cleanNumber}?text=Hi%20Victor%20Springs%20Support`,
        "_blank"
      );
      setIsOpen(false);
    }
  };

  const sendMessage = () => {
    if (!input.trim() || !isConnected) return;

    // Add to own UI
    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: input,
        timestamp: new Date(),
      },
    ]);

    // Send to admin via WhatsApp
    socketRef.current.emit("send_message", { text: input });
    setInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const closeChat = () => {
    setIsOpen(false);
    setShowOptions(true);
    setChatMode(null);
    setMessages([]);
    setIsConnected(false);
    setIsConnecting(false);

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 z-50 group"
        title="Chat with us"
      >
        <MessageCircle size={24} />
        <div className="absolute -top-2 -left-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          ?
        </div>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white border border-gray-300 rounded-lg shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="bg-green-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <div className="flex items-center gap-2">
          {chatMode === "whatsapp" && <Phone size={20} />}
          {chatMode === "tawk" && <MessageSquare size={20} />}
          <div>
            <h3 className="font-semibold">
              {chatMode === "whatsapp" && "WhatsApp Support"}
              {chatMode === "tawk" && "Live Chat Support"}
              {!chatMode && "Contact Support"}
            </h3>
            <p className="text-sm opacity-90">
              {chatMode === "whatsapp" &&
                (isConnected
                  ? "Connected"
                  : isConnecting
                  ? "Connecting..."
                  : "Disconnected")}
              {chatMode === "tawk" && "Live chat available"}
              {!chatMode && "Choose your preferred method"}
            </p>
          </div>
        </div>
        <button
          onClick={closeChat}
          className="hover:bg-green-700 p-1 rounded transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {showOptions ? (
          /* Options Screen */
          <div className="p-6 h-full flex flex-col justify-center">
            <h4 className="text-lg font-semibold mb-4 text-center">
              How would you like to contact us?
            </h4>

            <div className="space-y-3">
              <button
                onClick={startWhatsAppChat}
                className="w-full bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg flex items-center gap-3 transition-colors"
              >
                <Phone size={20} />
                <div className="text-left">
                  <div className="font-semibold">WhatsApp Direct</div>
                  <div className="text-sm opacity-90">
                    Chat directly with our admin
                  </div>
                </div>
              </button>

              <button
                onClick={startTawkChat}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg flex items-center gap-3 transition-colors"
              >
                <MessageSquare size={20} />
                <div className="text-left">
                  <div className="font-semibold">Live Chat</div>
                  <div className="text-sm opacity-90">Use our chat widget</div>
                </div>
              </button>
            </div>

            <div className="mt-6 text-center text-sm text-gray-600">
              <p>💡 WhatsApp chat connects you directly to our support team</p>
            </div>
          </div>
        ) : (
          /* Chat Interface */
          <div className="h-full flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg text-sm ${
                      msg.sender === "user"
                        ? "bg-green-600 text-white"
                        : msg.sender === "admin"
                        ? "bg-gray-100 text-gray-800"
                        : "bg-yellow-100 text-yellow-800 text-center"
                    }`}
                  >
                    {msg.text}
                    {msg.timestamp && (
                      <div
                        className={`text-xs mt-1 ${
                          msg.sender === "user"
                            ? "text-green-100"
                            : "text-gray-500"
                        }`}
                      >
                        {msg.timestamp.toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            {chatMode === "whatsapp" && (
              <div className="p-4 border-t bg-gray-50">
                {!isConnected && !isConnecting && (
                  <div className="text-center text-red-600 text-sm mb-2">
                    ⚠️ WhatsApp chat is currently unavailable. Please try live
                    chat instead.
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={
                      isConnected ? "Type your message..." : "Chat unavailable"
                    }
                    disabled={!isConnected}
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!isConnected || !input.trim()}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white p-2 rounded-lg transition-colors"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            )}

            {chatMode === "tawk" && (
              <div className="p-4 text-center text-gray-600">
                <p>Live chat widget should open automatically.</p>
                <p className="text-sm mt-2">
                  If it doesn't work, try refreshing the page.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppChatWidget;
