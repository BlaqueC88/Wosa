import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProductCard } from '../components/product-card';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

async function fetchProducts() {
  const res = await fetch('http://localhost:3000/api/products');
  if (!res.ok) throw new Error('Failed to load products');
  return res.json();
}

export function Products() {
  const queryClient = useQueryClient();

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  // Seed Products Mutation
  const seedMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('http://localhost:3000/api/seed', { method: 'GET' });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Sample products loaded!');
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-80 rounded-xl" />)}
      </div>
    );
  }

  if (error) return <p className="text-red-500 text-center">Error loading products. Try seeding below.</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Our Products</h1>
        <Button 
          onClick={() => seedMutation.mutate()} 
          variant="outline"
          disabled={seedMutation.isPending}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          {seedMutation.isPending ? 'Seeding...' : 'Seed Sample Products'}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product: any) => (
          <ProductCard key={product._id || product.id} product={product} />
        ))}
      </div>
    </div>
  );
}