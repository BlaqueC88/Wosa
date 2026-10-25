import { Link, useLocation } from 'react-router';
import { ChevronRight } from 'lucide-react';

const routeNames: Record<string, string> = {
  'products': 'Products',
  'cart': 'Cart',
  // add more as needed
};

export default function Breadcrumbs() {
  const location = useLocation();
  const paths = location.pathname.split('/').filter(Boolean);

  return (
    <nav className="flex items-center text-sm text-muted-foreground mb-6">
      <Link to="/" className="hover:text-foreground">Home</Link>
      
      {paths.map((path, index) => {
        const href = '/' + paths.slice(0, index + 1).join('/');
        const isLast = index === paths.length - 1;
        
        return (
          <span key={href} className="flex items-center">
            <ChevronRight className="mx-2 h-4 w-4" />
            {isLast ? (
              <span className="text-foreground font-medium capitalize">
                {routeNames[path] || path}
              </span>
            ) : (
              <Link to={href} className="hover:text-foreground capitalize">
                {routeNames[path] || path}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}