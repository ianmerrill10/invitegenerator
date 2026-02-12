import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help Center",
  description: "Get help with InviteGenerator. Find answers to common questions, contact support, and learn how to make the most of your invitations.",
  openGraph: {
    title: "Help Center | InviteGenerator",
    description: "Get help with InviteGenerator. Find answers to common questions and contact support.",
  },
};

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
