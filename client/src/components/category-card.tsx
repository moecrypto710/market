interface CategoryProps {
  category: {
    id: number;
    name: string;
    icon: string;
  };
}

export default function CategoryCard({ category }: CategoryProps) {
  return (
    <div className="bg-black border border-white/20 rounded-lg p-4 text-center cursor-pointer hover:border-white/50 transition duration-300">
      <div className="bg-black border border-white/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
        <i className={`fas fa-${category.icon} text-white`}></i>
      </div>
      <h3 className="font-medium text-white">{category.name}</h3>
    </div>
  );
}
