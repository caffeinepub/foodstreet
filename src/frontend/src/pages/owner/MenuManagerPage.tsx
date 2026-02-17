import { useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { useGetMenuItems, useAddMenuItem, useUpdateMenuItem, useDeleteMenuItem } from '../../hooks/useQueries';
import { Menu, Plus, Edit, Trash2 } from 'lucide-react';
import type { MenuItem, MenuItemVariant } from '../../backend';

export default function MenuManagerPage() {
  const { restaurantId } = useParams({ from: '/owner/restaurant/$restaurantId/menu' });
  const { data: menuItems = [], isLoading } = useGetMenuItems(BigInt(restaurantId));
  const addMenuItem = useAddMenuItem();
  const updateMenuItem = useUpdateMenuItem();
  const deleteMenuItem = useDeleteMenuItem();

  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    isVeg: true,
    isAvailable: true,
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) return;

    try {
      const item: MenuItem = {
        id: BigInt(0),
        restaurantId: BigInt(restaurantId),
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        isVeg: formData.isVeg,
        isAvailable: formData.isAvailable,
        variants: [],
      };

      await addMenuItem.mutateAsync({ restaurantId: BigInt(restaurantId), item });
      setIsAdding(false);
      setFormData({ name: '', description: '', price: '', isVeg: true, isAvailable: true });
    } catch (error) {
      console.error('Failed to add menu item:', error);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !formData.name.trim() || !formData.price) return;

    try {
      await updateMenuItem.mutateAsync({
        menuItemId: editingItem.id,
        restaurantId: BigInt(restaurantId),
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        isVeg: formData.isVeg,
        isAvailable: formData.isAvailable,
        variants: [],
      });
      setEditingItem(null);
      setFormData({ name: '', description: '', price: '', isVeg: true, isAvailable: true });
    } catch (error) {
      console.error('Failed to update menu item:', error);
    }
  };

  const handleDelete = async (itemId: bigint) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await deleteMenuItem.mutateAsync({ menuItemId: itemId, restaurantId: BigInt(restaurantId) });
    } catch (error) {
      console.error('Failed to delete menu item:', error);
    }
  };

  const startEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      isVeg: item.isVeg,
      isAvailable: item.isAvailable,
    });
    setIsAdding(false);
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Menu className="h-8 w-8" />
          Menu Manager
        </h1>
        <button
          onClick={() => {
            setIsAdding(true);
            setEditingItem(null);
            setFormData({ name: '', description: '', price: '', isVeg: true, isAvailable: true });
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Item
        </button>
      </div>

      {(isAdding || editingItem) && (
        <div className="mb-8 border rounded-lg p-6 bg-card">
          <h2 className="text-xl font-semibold mb-4">
            {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
          </h2>
          <form onSubmit={editingItem ? handleUpdate : handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-background"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-background"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-background"
                required
              />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isVeg}
                  onChange={(e) => setFormData({ ...formData, isVeg: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Vegetarian</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Available</span>
              </label>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setEditingItem(null);
                }}
                className="px-4 py-2 border rounded-md hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addMenuItem.isPending || updateMenuItem.isPending}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {editingItem ? 'Update' : 'Add'} Item
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {menuItems.map((item) => (
          <div key={item.id.toString()} className="border rounded-lg p-4 bg-card">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={item.isVeg ? 'text-green-600' : 'text-red-600'}>
                    {item.isVeg ? '🌱' : '🍖'}
                  </span>
                  <h3 className="font-semibold">{item.name}</h3>
                  {!item.isAvailable && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                      Unavailable
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                <p className="text-lg font-bold">${item.price.toFixed(2)}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(item)}
                  className="p-2 hover:bg-secondary rounded-md transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deleteMenuItem.isPending}
                  className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {menuItems.length === 0 && !isAdding && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No menu items yet. Add your first item to get started.</p>
        </div>
      )}
    </div>
  );
}
