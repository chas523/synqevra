"use client";

import { Bell, Check, ArrowRight } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useNotifications } from "@/hooks/thingsboard/notifications/useNotifications";

const formatTimeAgo = (timestamp: number) => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const NotificationButton = () => {
  const { notifications, unreadCount, markAsRead, fetchNotifications } =
    useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (newState) {
      fetchNotifications();
    }
  };

  const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    markAsRead([id]);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        size="icon"
        variant="outline"
        className="cursor-pointer bg-white/80 dark:bg-white/10 border-slate-200 dark:border-white/20 hover:bg-slate-100 dark:hover:bg-white/20 text-slate-700 dark:text-white relative"
        onClick={handleToggle}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="rounded-lg bg-white dark:bg-slate-900 absolute right-0 w-80 z-[1000] shadow-lg animate-in fade-in zoom-in-95 duration-200 border-slate-200 dark:border-slate-700">
          <div className="border-b p-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold dark:text-white">
                Notifications
              </CardTitle>
            </div>
          </div>
          <CardContent className="p-0 max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No notifications
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => {
                  const isRead =
                    notification.status === "READ" || notification.read;
                  return (
                    <div
                      key={notification.id.id}
                      className={cn(
                        "flex gap-3 p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 group",
                        !isRead && "bg-blue-50/50 dark:bg-blue-900/10"
                      )}
                    >
                      <div className="flex-1 space-y-1">
                        <p
                          className={cn(
                            "text-sm font-medium leading-none",
                            !isRead && "text-blue-600 dark:text-blue-400"
                          )}
                        >
                          {notification.subject || "Notification"}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                          {notification.text}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {formatTimeAgo(notification.createdTime)}
                        </p>
                      </div>
                      {!isRead && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0 text-slate-400 hover:text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                          onClick={(e) => handleMarkAsRead(notification.id.id, e)}
                          title="Mark as read"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
          <CardFooter className="p-2 border-t bg-slate-50 dark:bg-slate-900/50">
            <Link
              href="/notifications"
              className="flex items-center justify-center w-full text-xs text-blue-500 hover:text-blue-600 font-medium py-1"
              onClick={() => setIsOpen(false)}
            >
              See all
              <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </CardFooter>
        </div>
      )}
    </div>
  );
};

export default NotificationButton;
