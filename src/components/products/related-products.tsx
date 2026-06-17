import type { CatalogProduct } from "@/config/products";
import { ProductCard } from "@/components/products/product-card";

type RelatedProductsProps = {
  products: CatalogProduct[];
};

export function RelatedProducts({ products }: RelatedProductsProps) {
  if (!products.length) {
    return null;
  }

  return (
    <section className="container-shell py-20 sm:py-24">
      <div className="mb-10 max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Related products</p>
        <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">Complete the rotation.</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>
    </section>
  );
}
