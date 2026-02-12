import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the InviteGenerator team. We're here to help with questions about creating invitations, technical support, partnerships, and more.",
  keywords: [
    "contact",
    "support",
    "help",
    "customer service",
    "get in touch",
    "InviteGenerator support",
  ],
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
