'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useShoppingList, useUpdateShoppingList } from '@/lib/hooks/use-shopping-lists';
import { format, parseISO } from 'date-fns';
import { ArrowLeft, CheckCircle, Circle, Plus, Save, ShoppingCart, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';

interface ShoppingListItem {
	id?: number;
	itemName: string;
	quantity: number;
	unit?: string;
	notes?: string;
	isCompleted?: boolean;
}

function ShoppingListItemRow({
	item,
	index,
	onUpdate,
	onRemove,
}: {
	item: ShoppingListItem;
	index: number;
	onUpdate: (index: number, field: string, value: any) => void;
	onRemove: (index: number) => void;
}) {
	return (
		<div className='grid grid-cols-12 gap-2 items-center p-3 border rounded-lg bg-card'>
			<div className='col-span-1 flex items-center justify-center'>
				<Button
					variant='ghost'
					size='sm'
					onClick={() => onUpdate(index, 'isCompleted', !item.isCompleted)}
					className='p-0 h-auto'>
					{item.isCompleted ? (
						<CheckCircle className='w-5 h-5 text-green-500' />
					) : (
						<Circle className='w-5 h-5 text-muted-foreground' />
					)}
				</Button>
			</div>
			<div className='col-span-4'>
				<Input
					placeholder='Item name'
					value={item.itemName}
					onChange={e => onUpdate(index, 'itemName', e.target.value)}
					className={item.isCompleted ? 'line-through text-muted-foreground' : ''}
				/>
			</div>
			<div className='col-span-2'>
				<Input
					type='number'
					min='0'
					step='0.1'
					placeholder='Qty'
					value={item.quantity}
					onChange={e => onUpdate(index, 'quantity', parseFloat(e.target.value) || 0)}
				/>
			</div>
			<div className='col-span-2'>
				<Input
					placeholder='Unit'
					value={item.unit || ''}
					onChange={e => onUpdate(index, 'unit', e.target.value)}
				/>
			</div>
			<div className='col-span-2'>
				<Input
					placeholder='Notes'
					value={item.notes || ''}
					onChange={e => onUpdate(index, 'notes', e.target.value)}
				/>
			</div>
			<div className='col-span-1'>
				<Button
					variant='ghost'
					size='sm'
					onClick={() => onRemove(index)}
					className='text-destructive hover:text-destructive hover:bg-destructive/10'>
					<Trash2 className='w-4 h-4' />
				</Button>
			</div>
		</div>
	);
}

export default function ShoppingListDetailPage({
	params,
}: {
	params: Promise<{ listId: string }>;
}) {
	const { listId } = use(params);
	const { data: shoppingList, isLoading, error } = useShoppingList(parseInt(listId));
	const updateShoppingList = useUpdateShoppingList();

	const [items, setItems] = useState<ShoppingListItem[]>([]);
	const [listName, setListName] = useState('');

	// Initialize state when data loads - moved to useEffect to prevent infinite re-renders
	useEffect(() => {
		if (shoppingList && items.length === 0) {
			setItems(
				shoppingList.items.map((item: any) => ({
					id: item.id,
					itemName: item.itemName,
					quantity: Number(item.quantity),
					unit: item.unit,
					notes: item.notes,
					isCompleted: item.isCompleted,
				})),
			);
			setListName(shoppingList.listName);
		}
	}, [shoppingList, items.length]);

	const addItem = () => {
		setItems([...items, { itemName: '', quantity: 1, unit: '', notes: '', isCompleted: false }]);
	};

	const removeItem = (index: number) => {
		setItems(items.filter((_, i) => i !== index));
	};

	const updateItem = (index: number, field: string, value: any) => {
		const newItems = [...items];
		newItems[index] = { ...newItems[index], [field]: value };
		setItems(newItems);
	};

	const handleSave = async () => {
		if (!listName.trim()) return;

		const validItems = items.filter(item => item.itemName.trim());
		if (validItems.length === 0) return;

		try {
			await updateShoppingList.mutateAsync({
				listId: parseInt(listId),
				data: {
					listName: listName.trim(),
					items: validItems.map(item => ({
						itemName: item.itemName.trim(),
						quantity: item.quantity,
						unit: item.unit?.trim() || undefined,
						notes: item.notes?.trim() || undefined,
						isCompleted: item.isCompleted || false,
					})),
				},
			});
		} catch (error) {
			// Error is handled by the mutation
		}
	};

	const completedCount = items.filter(item => item.isCompleted).length;
	const totalCount = items.length;
	const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

	if (error) {
		return (
			<div className='space-y-6'>
				<div className='flex flex-col items-start gap-4'>
					<Button
						variant='outline'
						size='sm'
						asChild>
						<Link href='/dashboard/shopping-list'>
							<ArrowLeft className='w-4 h-4 mr-2' />
							Back to Shopping Lists
						</Link>
					</Button>
					<div className='flex flex-col items-center justify-center min-h-[400px] space-y-4'>
						<ShoppingCart className='w-12 h-12 text-destructive' />
						<h2 className='text-xl font-semibold'>Error loading shopping list</h2>
						<p className='text-muted-foreground text-center max-w-md'>
							There was an error loading your shopping list. Please try again later.
						</p>
						<Button onClick={() => window.location.reload()}>Try Again</Button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex flex-col items-start gap-4'>
				<Button
					variant='outline'
					size='sm'
					asChild>
					<Link href='/dashboard/shopping-list'>
						<ArrowLeft className='w-4 h-4 mr-2' />
						Back to Shopping Lists
					</Link>
				</Button>
				<div className='flex items-center justify-between w-full'>
					<div>
						<h1 className='text-3xl font-bold tracking-tight'>Edit Shopping List</h1>
						<p className='text-muted-foreground'>Manage your shopping list items</p>
					</div>
					<Button
						onClick={handleSave}
						disabled={updateShoppingList.isPending}>
						{updateShoppingList.isPending ? (
							<>
								<Save className='w-4 h-4 mr-2 animate-spin' />
								Saving...
							</>
						) : (
							<>
								<Save className='w-4 h-4 mr-2' />
								Save Changes
							</>
						)}
					</Button>
				</div>
			</div>

			{isLoading ? (
				<div className='space-y-4'>
					<div className='h-8 w-64 bg-muted rounded animate-pulse' />
					<div className='w-full bg-muted rounded-full h-2 animate-pulse' />
					<div className='space-y-2'>
						{Array.from({ length: 5 }).map((_, i) => (
							<div
								key={i}
								className='h-16 bg-muted rounded animate-pulse'
							/>
						))}
					</div>
				</div>
			) : (
				<>
					{/* List Info */}
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<ShoppingCart className='w-5 h-5 text-muted-foreground' />
								List Details
							</CardTitle>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='space-y-2'>
								<label className='text-sm font-medium'>List Name</label>
								<Input
									value={listName}
									onChange={e => setListName(e.target.value)}
									placeholder='Enter list name'
								/>
							</div>
							{shoppingList?.mealPlan && (
								<div className='flex items-center gap-2'>
									<span className='text-sm text-muted-foreground'>Generated from:</span>
									<Badge variant='secondary'>{shoppingList.mealPlan.planName}</Badge>
								</div>
							)}
							<div className='text-sm text-muted-foreground'>
								Created {shoppingList && format(parseISO(shoppingList.createdAt), 'MMM d, yyyy')}
							</div>
						</CardContent>
					</Card>

					{/* Progress */}
					<Card>
						<CardHeader>
							<CardTitle>Progress</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='flex items-center justify-between mb-2'>
								<span className='text-sm font-medium'>
									{completedCount} of {totalCount} items completed
								</span>
								<span className='text-sm text-muted-foreground'>{Math.round(progress)}%</span>
							</div>
							<div className='w-full bg-muted rounded-full h-3'>
								<div
									className='bg-primary h-3 rounded-full transition-all duration-300'
									style={{ width: `${progress}%` }}
								/>
							</div>
						</CardContent>
					</Card>

					{/* Items */}
					<Card>
						<CardHeader>
							<div className='flex items-center justify-between'>
								<CardTitle>Shopping Items</CardTitle>
								<Button
									onClick={addItem}
									size='sm'>
									<Plus className='w-4 h-4 mr-2' />
									Add Item
								</Button>
							</div>
						</CardHeader>
						<CardContent>
							{items.length === 0 ? (
								<div className='text-center py-8 text-muted-foreground'>
									No items yet. Add your first shopping item!
								</div>
							) : (
								<div className='space-y-3'>
									{/* Header */}
									<div className='grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground px-3'>
										<div className='col-span-1'>Done</div>
										<div className='col-span-4'>Item</div>
										<div className='col-span-2'>Quantity</div>
										<div className='col-span-2'>Unit</div>
										<div className='col-span-2'>Notes</div>
										<div className='col-span-1'></div>
									</div>
									{/* Items */}
									{items.map((item, index) => (
										<ShoppingListItemRow
											key={index}
											item={item}
											index={index}
											onUpdate={updateItem}
											onRemove={removeItem}
										/>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</>
			)}
		</div>
	);
}
