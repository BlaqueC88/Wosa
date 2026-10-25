import { Outlet } from "react-router";
import { Link } from "react-router";
import { ShoppingCart, Home } from "lucide-react";
import { useCartStore } from "../../store/cartStore";

export function TestLayout() {
  const { items } = useCartStore();
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <Home className="w-5 h-5" /> MyStore
          </Link>
          
          <div className="flex gap-6">
            <Link to="/products">Products</Link>
            <Link to="/cart" className="flex items-center gap-2 relative">
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}