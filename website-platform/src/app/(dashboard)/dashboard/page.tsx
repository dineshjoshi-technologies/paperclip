"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";

interface Website {
  id: string;
  name: string;
  domain: string | null;
  status: "draft" | "published" | "archived";
  template: string;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWebsites = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const response = await fetch("http://localhost:4000/api/websites", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setWebsites(data);
        }
      } catch (error) {
        console.error("Failed to fetch websites:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWebsites();
  }, []);

  const stats = [
    { label: "Total Websites", value: websites.length.toString(), change: "" },
    { label: "Published", value: websites.filter((w) => w.status === "published").length.toString(), change: "" },
    { label: "Drafts", value: websites.filter((w) => w.status === "draft").length.toString(), change: "" },
    { label: "Account Type", value: "Free", change: "Upgrade to Pro" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Welcome back, {user?.name || "User"}
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-1">
          Manage your websites and create new ones.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6"
          >
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{stat.label}</p>
            <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mt-2">
              {stat.value}
            </p>
            {stat.change && (
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">{stat.change}</p>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/websites/new"
            className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            Create New Website
          </Link>
          <Link
            href="/websites"
            className="border border-zinc-300 dark:border-zinc-700 px-4 py-2 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            View All Websites
          </Link>
        </div>
      </div>

      {/* Recent Websites */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Recent Websites
          </h2>
          <Link
            href="/websites"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            View all →
          </Link>
        </div>

        {isLoading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-zinc-100"></div>
          </div>
        ) : websites.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              You haven&apos;t created any websites yet.
            </p>
            <Link
              href="/websites/new"
              className="inline-block bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
            >
              Create Your First Website
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {websites.slice(0, 5).map((website) => (
              <div key={website.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">
                    {website.name}
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {website.domain || "No domain connected"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      website.status === "published"
                        ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                        : website.status === "draft"
                        ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    {website.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
