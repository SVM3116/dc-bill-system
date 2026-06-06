"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, LogOut } from "lucide-react";

// Production limits: 15 minutes total, warn 2 minutes before
const IDLE_LIMIT_MS = 15 * 60 * 1000;
const WARN_LIMIT_MS = 13 * 60 * 1000;

export function SessionGuard() {
  const router = useRouter();
  const supabase = createClient();
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(120); // 2 minutes warning countdown
  
  const lastActivityRef = useRef<number>(Date.now());
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogout = async () => {
    // Clear intervals
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    
    try {
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("SessionGuard signout failed:", err);
      // Fallback redirect
      window.location.href = "/login";
    }
  };

  const resetTimer = () => {
    lastActivityRef.current = Date.now();
    if (showWarning) {
      setShowWarning(false);
      setCountdown(120);
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    }
  };

  // Activity listeners
  useEffect(() => {
    const events = ["mousedown", "keydown", "scroll", "click", "touchstart"];
    const handleActivity = () => resetTimer();

    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    // Main check interval (checks every 5 seconds)
    checkIntervalRef.current = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivityRef.current;
      
      if (timeSinceLastActivity >= IDLE_LIMIT_MS) {
        // Exceeded total idle time - log out immediately
        handleLogout();
      } else if (timeSinceLastActivity >= WARN_LIMIT_MS) {
        // In the warning window
        if (!showWarning) {
          setShowWarning(true);
          const remainingSeconds = Math.max(0, Math.floor((IDLE_LIMIT_MS - timeSinceLastActivity) / 1000));
          setCountdown(remainingSeconds);
        }
      }
    }, 5000);

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [showWarning]);

  // Countdown timer effect
  useEffect(() => {
    if (showWarning) {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      
      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            handleLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    }

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [showWarning]);

  return (
    <Dialog open={showWarning} onOpenChange={(open) => { if (!open) resetTimer(); }}>
      <DialogContent className="sm:max-w-md bg-white border border-slate-200">
        <DialogHeader className="flex flex-col items-center text-center space-y-2">
          <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center border border-amber-100 mb-2">
            <AlertTriangle className="h-6 w-6 text-amber-600 animate-pulse" />
          </div>
          <DialogTitle className="text-slate-800 font-extrabold text-lg flex items-center gap-1.5 justify-center">
            Session Expiring Soon
          </DialogTitle>
          <DialogDescription className="text-slate-500 text-xs max-w-xs leading-relaxed">
            You have been inactive for a while. For security reasons, your session will automatically end in:
          </DialogDescription>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-md font-mono text-xl font-black text-slate-800 my-2">
            <Clock className="h-5 w-5 text-blue-600" />
            {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, "0")}
          </div>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 pt-2 w-full">
          <Button
            type="button"
            variant="outline"
            className="flex-1 h-10 text-xs border-slate-200 hover:bg-slate-50 font-bold"
            onClick={handleLogout}
          >
            <LogOut className="h-3.5 w-3.5 mr-1" />
            Logout Now
          </Button>
          <Button
            type="button"
            className="flex-1 h-10 text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white cursor-pointer"
            onClick={resetTimer}
          >
            Keep Me Logged In
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
