"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type UserProfile = {
  name: string;
  email: string;
  role: string;
  avatarColor: string; // "cyan" | "rose" | "emerald" | "amber" | "violet"
};

type ProfileContextType = {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
};

const defaultProfile: UserProfile = {
  name: "Alex Mercer",
  email: "alex.mercer@omniroot.ai",
  role: "SOC Lead Engineer",
  avatarColor: "cyan",
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("omniroot_profile");
      if (stored) {
        setProfile(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load profile", e);
    }
    setIsLoaded(true);
  }, []);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem("omniroot_profile", JSON.stringify(next));
      } catch (e) {
        console.error("Failed to save profile", e);
      }
      return next;
    });
  };

  return (
    <ProfileContext.Provider value={{ profile, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}
