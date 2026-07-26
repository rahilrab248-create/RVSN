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
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-100/50">Related products</p>
        <h2 className="mt-3 text-3xl font-normal tracking-[-0.05em] text-white sm:text-5xl">Complete the rotation.</h2>
      </div>
      <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4 [&::-webkit-scrollbar]:hidden">
        {products.map((product, index) => (
          <div key={product.id} className="w-[78vw] min-w-[78vw] snap-start sm:w-auto sm:min-w-0">
            <ProductCard product={product} index={index} />
          </div>
        ))}
      </div>
    </section>
  );
}
