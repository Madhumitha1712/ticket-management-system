import Category from '../models/Category.js';

export const getAllCategories = async (includeInactive = false) => {
  const filter = includeInactive ? {} : { isActive: true };
  return await Category.find(filter).sort({ name: 1 });
};

export const getCategoryById = async (id) => {
  const category = await Category.findById(id);
  if (!category) {
    const error = new Error('Category not found');
    error.statusCode = 404;
    throw error;
  }
  return category;
};

export const createCategory = async ({ name, description }) => {
  const existing = await Category.findOne({ name: { $regex: `^${name.trim()}$`, $options: 'i' } });
  if (existing) {
    const error = new Error('A category with this name already exists');
    error.statusCode = 409;
    throw error;
  }

  return await Category.create({
    name: name.trim(),
    description: description || '',
    isActive: true,
  });
};

export const updateCategory = async (id, { name, description, isActive }) => {
  const category = await Category.findById(id);
  if (!category) {
    const error = new Error('Category not found');
    error.statusCode = 404;
    throw error;
  }

  if (name) category.name = name.trim();
  if (description !== undefined) category.description = description.trim();
  if (isActive !== undefined) category.isActive = Boolean(isActive);

  await category.save();
  return category;
};

export const deleteCategory = async (id) => {
  const category = await Category.findById(id);
  if (!category) {
    const error = new Error('Category not found');
    error.statusCode = 404;
    throw error;
  }

  // Soft delete
  category.isActive = false;
  await category.save();
  return { message: 'Category deactivated successfully' };
};
