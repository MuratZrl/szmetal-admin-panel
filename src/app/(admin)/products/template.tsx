// app/(admin)/products/template.tsx
import CompareWrapper from '@/features/products/components/CompareWrapper.client';

export default function ProductsTemplate({ children }: { children: React.ReactNode }) {
  return <CompareWrapper>{children}</CompareWrapper>;
}
