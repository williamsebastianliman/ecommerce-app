import { Link } from "react-router-dom";
import Card from "./ui/Card";
import LinkButton from "./ui/LinkButton";

export default function ProductCard({
  id,
  name,
  price,
  stock,
  imageId,
}: {
  id: string;
  name: string;
  price: number;
  stock: number;
  imageId?: string;
}) {
  return (
    <Card>
      <div className="space-y-3">
        <div className="aspect-square w-full bg-gray-100 rounded-xl overflow-hidden">
          {imageId ? (
            <img
              src={`/api/media/${imageId}`}
              className="w-full h-full object-cover"
            />
          ) : null}
        </div>
        <div className="space-y-1">
          <div className="font-medium line-clamp-1">{name}</div>
          <div className="text-[#03AC0E] font-semibold">Rp{price}</div>
          <div className="text-xs text-gray-500">Stock: {stock}</div>
        </div>
        <div className="flex gap-2">
          <Link to={`/p/${id}`} className="flex-1">
            <LinkButton to={`/p/${id}`} variant="outline" className="w-full">
              Detail
            </LinkButton>
          </Link>
        </div>
      </div>
    </Card>
  );
}
