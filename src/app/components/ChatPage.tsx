import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
    ArrowLeft, Search, MoreVertical, Smile, Paperclip, Mic, Check,
    Trash2, Ban, UserX, Image as ImageIcon, FileText, X
} from 'lucide-react';
import api from '../../services/api';
import EmojiPicker, { Theme as EmojiTheme } from 'emoji-picker-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { toast } from 'sonner';
import { useTheme } from '../../contexts/ThemeContext';

export function ChatPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const threadId = searchParams.get('thread');
    const { isDarkMode } = useTheme();

    const [messages, setMessages] = useState<any[]>([]);
    const [threadInfo, setThreadInfo] = useState<any>(null);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // New features state
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [chatTheme, setChatTheme] = useState('default'); // default, gradient
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (threadId) {
            fetchChatData();
        }
    }, [threadId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchChatData = async (inBackground = false) => {
        if (!inBackground) setLoading(true);
        try {
            const threadData = await api.contactMessages.threads.get(threadId!);
            setThreadInfo(threadData);

            const messagesResponse = await api.contactMessages.messages.list({ thread: threadId });
            const msgs = Array.isArray(messagesResponse) ? messagesResponse : messagesResponse?.results || [];
            setMessages(msgs);
        } catch (error) {
            console.error('Failed to fetch chat data:', error);
        } finally {
            if (!inBackground) setLoading(false);
        }
    };

    const handleSendMessage = async (attachment?: File) => {
        if ((!newMessage.trim() && !attachment) || !threadId) return;

        setSending(true);
        try {
            if (attachment) {
                const formData = new FormData();
                formData.append('thread', threadId);
                formData.append('is_admin', 'true');
                // Ensure message is sent or empty string if allowed by backend
                // Backend now allows blank message
                if (newMessage.trim()) {
                    formData.append('message', newMessage);
                } else {
                    formData.append('message', '');
                }
                formData.append('attachment', attachment);
                await api.contactMessages.messages.create(formData as any);
            } else {
                await api.contactMessages.messages.create({
                    thread: parseInt(threadId),
                    message: newMessage,
                    is_admin: true
                });
            }

            setNewMessage('');
            setShowEmojiPicker(false);
            await fetchChatData(true); // Fetch in background
        } catch (error: any) {
            console.error('Failed to send message:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to send message';
            toast.error(errorMsg);
        } finally {
            setSending(false);
        }
    };

    const handleEmojiClick = (emojiObject: any) => {
        setNewMessage((prev) => prev + emojiObject.emoji);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleSendMessage(e.target.files[0]);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks: BlobPart[] = [];

            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                const file = new File([blob], 'voice-note.webm', { type: 'audio/webm' });
                handleSendMessage(file);
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
        } catch (err) {
            console.error('Error accessing microphone:', err);
            toast.error('Microphone access denied');
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            setIsRecording(false);
            setMediaRecorder(null);
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
    };

    const handleBlockUser = async () => {
        if (!threadInfo) return;
        try {
            await api.contactMessages.threads.toggleBlock(threadInfo.id);
            toast.success(threadInfo.is_blocked ? 'User Unblocked' : 'User Blocked');
            fetchChatData();
        } catch (error) {
            toast.error('Failed to update block status');
        }
    };

    const handleClearChat = async () => {
        if (!threadInfo || !window.confirm('Are you sure you want to clear this chat history?')) return;
        try {
            await api.contactMessages.threads.clearHistory(threadInfo.id);
            toast.success('Chat cleared');
            fetchChatData();
        } catch (error) {
            toast.error('Failed to clear chat');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    if (loading) return <div className={`p-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading chat...</div>;
    if (!threadId) return <div className={`p-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No thread selected.</div>;

    const getInitials = (name: string) => name ? name.charAt(0).toUpperCase() : 'U';

    const getBgStyle = () => {
        if (chatTheme === 'gradient') return 'bg-gradient-to-br from-indigo-50 to-pink-50';
        return isDarkMode ? 'bg-gray-900' : 'bg-gray-50';
    };

    return (
        <div className={`flex flex-col h-[calc(100vh-80px)] ${getBgStyle()}`}>
            {/* Header */}
            <div className={`px-4 py-4 shadow-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white'}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" onClick={() => navigate('/contact/threads')} className="text-white hover:bg-white/20">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div className="w-12 h-12 rounded-full bg-white text-blue-600 flex items-center justify-center font-bold text-lg">
                            {getInitials(threadInfo?.user || threadInfo?.name || 'U')}
                        </div>
                        <div>
                            <h2 className="font-semibold text-lg">{threadInfo?.name || threadInfo?.phone_no || 'Unknown'}</h2>
                            <p className="text-sm text-white/80">
                                {threadInfo?.phone_no || 'No Phone Number'}
                                {threadInfo?.is_blocked && <span className="ml-2 text-red-200 font-bold">(BLOCKED)</span>}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 transition-all duration-200">
                                    <MoreVertical className="w-5 h-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className={`w-56 p-2 rounded-xl border shadow-xl backdrop-blur-sm ${isDarkMode
                                    ? 'bg-gray-800/95 border-gray-700 text-gray-100'
                                    : 'bg-white/95 border-gray-100 text-gray-700'
                                    }`}
                            >
                                <div className={`px-2 py-1.5 text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Chat Settings
                                </div>
                                <DropdownMenuItem
                                    onClick={handleBlockUser}
                                    className={`cursor-pointer rounded-lg mb-1 px-3 py-2.5 transition-colors duration-200 ${isDarkMode
                                        ? 'focus:bg-indigo-500/20 focus:text-indigo-300'
                                        : 'focus:bg-indigo-50 focus:text-indigo-600'
                                        }`}
                                >
                                    {threadInfo?.is_blocked ? (
                                        <>
                                            <Check className="w-4 h-4 mr-3 text-green-500" />
                                            <span className="font-medium">Unblock User</span>
                                        </>
                                    ) : (
                                        <>
                                            <Ban className="w-4 h-4 mr-3 text-orange-500" />
                                            <span className="font-medium">Block User</span>
                                        </>
                                    )}
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                    onClick={() => setChatTheme(prev => prev === 'default' ? 'gradient' : 'default')}
                                    className={`cursor-pointer rounded-lg mb-1 px-3 py-2.5 transition-colors duration-200 ${isDarkMode
                                        ? 'focus:bg-purple-500/20 focus:text-purple-300'
                                        : 'focus:bg-purple-50 focus:text-purple-600'
                                        }`}
                                >
                                    <ImageIcon className="w-4 h-4 mr-3 text-purple-500" />
                                    <span className="font-medium">
                                        {chatTheme === 'gradient' ? 'Disable Gradient' : 'Enable Gradient'}
                                    </span>
                                </DropdownMenuItem>

                                <div className={`my-1 h-px ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`} />

                                <DropdownMenuItem
                                    onClick={handleClearChat}
                                    className={`cursor-pointer rounded-lg px-3 py-2.5 transition-colors duration-200 ${isDarkMode
                                        ? 'text-red-400 focus:bg-red-500/10 focus:text-red-300'
                                        : 'text-red-500 focus:bg-red-50 focus:text-red-600'
                                        }`}
                                >
                                    <Trash2 className="w-4 h-4 mr-3" />
                                    <span className="font-medium">Clear Chat History</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className={`text-center py-12 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>No messages yet.</div>
                ) : (
                    messages.map((msg: any, idx: number) => (
                        <div key={idx} className={`flex items-end gap-2 ${msg.is_admin ? 'justify-end' : 'justify-start'}`}>
                            {!msg.is_admin && (
                                <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                                    {getInitials(threadInfo?.user || threadInfo?.name || 'U')}
                                </div>
                            )}

                            <div className={`max-w-[70%] ${msg.is_admin ? 'order-1' : 'order-2'}`}>
                                <div className={`rounded-2xl px-4 py-3 ${msg.is_admin
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-none'
                                    : `${isDarkMode ? 'bg-gray-700 text-gray-100 shadow-md' : 'bg-white text-gray-800 shadow-sm'} rounded-bl-none`
                                    }`}>
                                    {msg.attachment && (
                                        <div className="mb-2">
                                            {msg.attachment.endsWith('.mp3') || msg.attachment.endsWith('.webm') || msg.attachment.endsWith('.wav') ? (
                                                <audio controls src={msg.attachment} className="max-w-full" />
                                            ) : (
                                                <a href={msg.attachment} target="_blank" rel="noopener noreferrer" className={`underline flex items-center gap-1 text-sm ${msg.is_admin ? 'text-white' : 'text-blue-500'}`}>
                                                    <FileText className="w-4 h-4" /> Attachment
                                                </a>
                                            )}
                                        </div>
                                    )}
                                    <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                                </div>
                                <div className={`flex items-center gap-1 mt-1 px-2 text-xs ${msg.is_admin ? 'justify-end' : 'justify-start'} ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                    <span>{msg.sent_at ? new Date(msg.sent_at * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}</span>
                                    {msg.is_admin && <Check className="w-3 h-3 text-blue-500" />}
                                </div>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className={`border-t px-4 py-3 shadow-lg ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                {threadInfo?.is_blocked ? (
                    <div className="text-center text-red-500 font-medium py-2">
                        You have blocked this user. <Button variant="link" onClick={handleBlockUser} className="text-red-600 underline">Unblock</Button> to reply.
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Button variant="ghost" size="sm" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`${isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}`}>
                                <Smile className="w-5 h-5" />
                            </Button>
                            {showEmojiPicker && (
                                <div className="absolute bottom-12 left-0 z-50">
                                    <EmojiPicker theme={isDarkMode ? EmojiTheme.DARK : EmojiTheme.LIGHT} onEmojiClick={handleEmojiClick} />
                                </div>
                            )}
                        </div>

                        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
                        <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} className={`${isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}`}>
                            <Paperclip className="w-5 h-5" />
                        </Button>

                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type a message..."
                            disabled={sending}
                            className={`flex-1 rounded-full focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'}`}
                        />

                        {newMessage.trim() ? (
                            <Button onClick={() => handleSendMessage()} disabled={sending} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full px-6">
                                Send
                            </Button>
                        ) : (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={isRecording ? stopRecording : startRecording}
                                className={`${isRecording ? 'text-red-500 animate-pulse bg-red-50' : isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}`}
                            >
                                {isRecording ? <div className="w-3 h-3 bg-red-500 rounded-sm" /> : <Mic className="w-5 h-5" />}
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
