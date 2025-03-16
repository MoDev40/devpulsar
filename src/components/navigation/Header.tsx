import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { CustomButton } from '@/components/ui/custom-button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, X, LogOut, Github } from 'lucide-react';

const Header: React.FC = () => {
  const { user, signOut } = useAuthStore();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">TaskFlow</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link
              to="/"
              className={`transition-colors hover:text-foreground/80 ${
                isActive('/') ? 'text-foreground' : 'text-foreground/60'
              }`}
            >
              Tasks
            </Link>
            <Link
              to="/github"
              className={`transition-colors hover:text-foreground/80 ${
                isActive('/github') ? 'text-foreground' : 'text-foreground/60'
              }`}
            >
              GitHub
            </Link>
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2">
          {user ? (
            <>
              <div className="hidden md:flex items-center">
                <Link to="/github">
                  <CustomButton variant="ghost" size="sm" className="gap-2">
                    <Github className="h-4 w-4" />
                    GitHub
                  </CustomButton>
                </Link>
                <CustomButton
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </CustomButton>
              </div>
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon">
                    {isMenuOpen ? (
                      <X className="h-5 w-5" />
                    ) : (
                      <Menu className="h-5 w-5" />
                    )}
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <nav className="flex flex-col gap-4 text-lg font-medium">
                    <Link
                      to="/"
                      onClick={closeMenu}
                      className="flex items-center gap-2 hover:text-primary"
                    >
                      Tasks
                    </Link>
                    <Link
                      to="/github"
                      onClick={closeMenu}
                      className="flex items-center gap-2 hover:text-primary"
                    >
                      <Github className="h-4 w-4" />
                      GitHub
                    </Link>
                    <button
                      onClick={() => {
                        closeMenu();
                        handleSignOut();
                      }}
                      className="flex items-center gap-2 hover:text-primary"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </nav>
                </SheetContent>
              </Sheet>
            </>
          ) : (
            <Link to="/auth">
              <CustomButton size="sm">Sign in</CustomButton>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
