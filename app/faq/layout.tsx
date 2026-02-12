import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ - Frequently Asked Questions",
  description:
    "Find answers to common questions about InviteGenerator. Learn about creating invitations, AI features, pricing, sharing options, and more.",
  keywords: [
    "FAQ",
    "frequently asked questions",
    "help",
    "support",
    "invitation questions",
    "how to create invitations",
  ],
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return children;
}
