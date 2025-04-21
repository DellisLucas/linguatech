import React, { useState, useEffect } from 'react';
import { fetchCategoryProgress } from '../services/modulesService';

interface CategoryCardProps {
  category: {
    id: number;
    name: string;
    description: string;
  };
  moduleId: number;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, moduleId }) => {
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    const loadProgress = async () => {
      const categoryProgress = await fetchCategoryProgress(moduleId, category.id);
      setProgress(categoryProgress);
    };

    loadProgress();
  }, [moduleId, category.id]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
      <p className="text-gray-600 mb-4">{category.description}</p>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-blue-600 h-2.5 rounded-full"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-sm text-gray-500 mt-2">{progress}% completo</p>
    </div>
  );
};

export default CategoryCard; 