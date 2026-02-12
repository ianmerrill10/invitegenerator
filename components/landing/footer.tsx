"use client";

import * as React from "react";
import Link from "next/link";
import {
  Mail,
  Twitter,
  Instagram,
  Facebook,
  Heart,
} from "lucide-react";
import { APP_CONFIG, NAVIGATION } from "@/lib/constants";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface-900 text-surface-300">
      {/* Main Footer */}
      <div className="container-custom py-16 lg:py-20">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-6 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-6">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <span className="font-heading font-bold text-xl text-white">
                {APP_CONFIG.name}
              </span>
            </Link>
            <p className="text-surface-400 text-sm leading-relaxed mb-6 max-w-xs">
              Create stunning, professional invitations for any event in seconds
              using AI-powered generation. Free to start, no credit card required.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {[
                { icon: Twitter, href: APP_CONFIG.socialLinks.twitter, label: "Twitter" },
                { icon: Instagram, href: APP_CONFIG.socialLinks.instagram, label: "Instagram" },
                { icon: Facebook, href: APP_CONFIG.socialLinks.facebook, label: "Facebook" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-lg bg-surface-800 flex items-center justify-center text-surface-400 hover:text-white hover:bg-surface-700 transition-colors"
                  aria-label={label}
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Column */}
          <div>
            <h3 className="font-heading font-semibold text-white text-sm mb-4">
              Product
            </h3>
            <ul className="space-y-3">
              {NAVIGATION.footer.product.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-surface-400 hover:text-white transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h3 className="font-heading font-semibold text-white text-sm mb-4">
              Resources
            </h3>
            <ul className="space-y-3">
              {NAVIGATION.footer.resources.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-surface-400 hover:text-white transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="font-heading font-semibold text-white text-sm mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              {NAVIGATION.footer.company.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-surface-400 hover:text-white transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="font-heading font-semibold text-white text-sm mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              {NAVIGATION.footer.legal.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-surface-400 hover:text-white transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-surface-800">
        <div className="container-custom py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-surface-500 text-center sm:text-left">
              © {currentYear} {APP_CONFIG.name}. All rights reserved.
            </p>
            <p className="text-sm text-surface-500 flex items-center gap-1">
              Made with{" "}
              <Heart className="h-4 w-4 text-brand-500 fill-brand-500" />{" "}
              for celebrating life's moments
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
