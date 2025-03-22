interface CategoryProps {
  category: {
    id: number;
    name: string;
    icon: string;
  };
}

export default function CategoryCard({ category }: CategoryProps) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 text-center cursor-pointer hover:bg-white/20 transition duration-300">
      <div className="bg-[#7e57c2]/50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
        <i className={`fas fa-${category.icon}`}></i>
      </div>
      <h3 className="font-medium">{category.name}</h3>
    </div>
  );
}
