import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { toast } from 'sonner';

type Product = {
  id: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
};

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem(product);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="p-0">
        <img 
          src={
						product.image ||
						"/images/Steak_with_Mushroom_sauce.jpg"
					}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">
						{product.name}
					</CardTitle>
          {product.category && <Badge variant="secondary">{product.category}</Badge>}
        </div>
        <p className="text-2xl font-bold mt-2">R{product.price}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button onClick={handleAddToCart} className="w-full">
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}