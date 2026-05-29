"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, ShoppingBag, Search, User, LogOut } from "lucide-react"
import { CartDrawer } from "./cart-drawer"
import { useCart } from "./cart-context"
import { useAuth } from "@/lib/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { setIsOpen, itemCount } = useCart()
  const { user, profile, isAdmin, signOut, isLoading } = useAuth()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
      <nav className="max-w-7xl mx-auto px-6 lg:px-8 backdrop-blur-md rounded-lg py-0 my-0 animate-scale-fade-in bg-[rgba(255,255,255,0.4)] border border-[rgba(255,255,255,0.32)]" style={{ boxShadow: 'rgba(0, 0, 0, 0.1) 0px 10px 50px' }}>
        <div className="flex items-center justify-between h-[68px]">
          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden p-2 text-foreground/80 hover:text-foreground boty-transition"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Desktop Navigation - Left */}
          <div className="hidden lg:flex items-center gap-8">
            <Link
              href="/shop"
              className="text-sm tracking-wide text-foreground/70 hover:text-foreground boty-transition"
            >
              Shop
            </Link>
            <Link
              href="/apartments"
              className="text-sm tracking-wide text-foreground/70 hover:text-foreground boty-transition"
            >
              Apartments
            </Link>
            <Link
              href="/about"
              className="text-sm tracking-wide text-foreground/70 hover:text-foreground boty-transition"
            >
              About
            </Link>
          </div>

          {/* Logo */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
            <h1 className="font-serif text-3xl tracking-wider text-foreground">Mulla</h1>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="p-2 text-foreground/70 hover:text-foreground boty-transition"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            
            {/* User Account Dropdown */}
            {!isLoading && (
              user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-2 p-2 text-foreground/70 hover:text-foreground boty-transition"
                      aria-label="Account menu"
                    >
                      <User className="w-5 h-5" />
                      {profile?.first_name && (
                        <span className="text-sm hidden sm:inline">{profile.first_name}</span>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/account" className="cursor-pointer">
                        My Account
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account/orders" className="cursor-pointer">
                        My Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account/wishlist" className="cursor-pointer">
                        Wishlist
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="cursor-pointer font-medium">
                            Admin Dashboard
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => signOut()}
                      className="cursor-pointer text-destructive"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  href="/auth/login"
                  className="block p-2 text-foreground/70 hover:text-foreground boty-transition"
                  aria-label="Sign in"
                >
                  <User className="w-5 h-5" />
                </Link>
              )
            )}
            
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="relative p-2 text-foreground/70 hover:text-foreground boty-transition"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0 -right-0 w-4 h-4 bg-primary text-primary-foreground text-[10px] flex items-center justify-center rounded-full">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <CartDrawer />

        {/* Mobile Navigation */}
        <div
          className={`lg:hidden overflow-hidden boty-transition ${
            isMenuOpen ? "max-h-96 pb-6" : "max-h-0"
          }`}
        >
          <div className="flex flex-col gap-4 pt-4 border-t border-border/50">
            <Link
              href="/shop"
              className="text-sm tracking-wide text-foreground/70 hover:text-foreground boty-transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Shop
            </Link>
            <Link
              href="/apartments"
              className="text-sm tracking-wide text-foreground/70 hover:text-foreground boty-transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Apartments
            </Link>
            <Link
              href="/about"
              className="text-sm tracking-wide text-foreground/70 hover:text-foreground boty-transition"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            
            {/* Mobile Auth Links */}
            {!isLoading && (
              user ? (
                <>
                  <div className="border-t border-border/50 pt-4 mt-2">
                    <Link
                      href="/account"
                      className="text-sm tracking-wide text-foreground/70 hover:text-foreground boty-transition block mb-4"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Account
                    </Link>
                    <Link
                      href="/account/orders"
                      className="text-sm tracking-wide text-foreground/70 hover:text-foreground boty-transition block mb-4"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Orders
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="text-sm tracking-wide text-foreground font-medium hover:text-foreground boty-transition block mb-4"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        signOut()
                        setIsMenuOpen(false)
                      }}
                      className="text-sm tracking-wide text-destructive hover:text-destructive/80 boty-transition"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <div className="border-t border-border/50 pt-4 mt-2">
                  <Link
                    href="/auth/login"
                    className="text-sm tracking-wide text-foreground font-medium hover:text-foreground boty-transition"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In / Create Account
                  </Link>
                </div>
              )
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}
