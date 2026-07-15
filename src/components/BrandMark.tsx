import { brand } from "../config/brand";

export function BrandMark() {
  return (
    <div className="brand-mark" aria-hidden="true">
      <span className="brand-mark__fallback">L3</span>
      <img src={brand.compactLogoUrl} alt="" />
    </div>
  );
}
