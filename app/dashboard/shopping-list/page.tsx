'use client';

import { DeleteShoppingListDialog } from '@/components/delete-shopping-list-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMealPlans } from '@/lib/hooks/use-meal-plans';
import {
	useCreateShoppingList,
	useGenerateShoppingList,
	useShoppingLists,
} from '@/lib/hooks/use-shopping-lists';
import { format, parseISO } from 'date-fns';
import {
	ArrowLeft,
	CheckCircle,
	Circle,
	Edit,
	Plus,
	ShoppingCart,
	Sparkles,
	Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

function CreateShoppingListDialog({ onSuccess }: { onSuccess: () => void }) {
	const [isOpen, setIsOpen] = useState(false);
	const [listName, setListName] = useState('');
	const [items, setItems] = useState([{ itemName: '', quantity: 1, unit: '', notes: '' }]);
	const createShoppingList = useCreateShoppingList();

	const addItem = () => {
		setItems([...items, { itemName: '', quantity: 1, unit: '', notes: '' }]);
	};

	const removeItem = (index: number) => {
		if (items.length > 1) {
			setItems(items.filter((_, i) => i !== index));
		}
	};

	const updateItem = (index: number, field: string, value: any) => {
		const newItems = [...items];
		newItems[index] = { ...newItems[index], [field]: value };
		setItems(newItems);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!listName.trim()) return;

		const validItems = items.filter(item => item.itemName.trim());
		if (validItems.length === 0) return;

		try {
			await createShoppingList.mutateAsync({
				listName: listName.trim(),
				items: validItems.map(item => ({
					itemName: item.itemName.trim(),
					quantity: item.quantity,
					unit: item.unit.trim() || undefined,
					notes: item.notes.trim() || undefined,
				})),
			});
			setIsOpen(false);
			setListName('');
			setItems([{ itemName: '', quantity: 1, unit: '', notes: '' }]);
			onSuccess();
		} catch (error) {
			// Error is handled by the mutation
		}
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button>
					<Plus className='w-4 h-4 mr-2' />
					Create List
				</Button>
			</DialogTrigger>
			<DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle>Create New Shopping List</DialogTitle>
				</DialogHeader>
				<form
					onSubmit={handleSubmit}
					className='space-y-4'>
					<div className='space-y-2'>
						<Label htmlFor='listName'>List Name</Label>
						<Input
							id='listName'
							value={listName}
							onChange={e => setListName(e.target.value)}
							placeholder='e.g., Weekly Groceries'
							required
						/>
					</div>
					<div className='space-y-3'>
						<div className='flex items-center justify-between'>
							<Label>Items</Label>
							<Button
								type='button'
								variant='outline'
								size='sm'
								onClick={addItem}>
								<Plus className='w-4 h-4 mr-1' />
								Add Item
							</Button>
						</div>
						<div className='space-y-3 max-h-60 overflow-y-auto'>
							{items.map((item, index) => (
								<div
									key={index}
									className='grid grid-cols-12 gap-2 items-start'>
									<div className='col-span-5'>
										<Input
											placeholder='Item name'
											value={item.itemName}
											onChange={e => updateItem(index, 'itemName', e.target.value)}
											required
										/>
									</div>
									<div className='col-span-2'>
										<Input
											type='number'
											min='0'
											step='0.1'
											placeholder='Qty'
											value={item.quantity}
											onChange={e => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
											required
										/>
									</div>
									<div className='col-span-2'>
										<Input
											placeholder='Unit'
											value={item.unit}
											onChange={e => updateItem(index, 'unit', e.target.value)}
										/>
									</div>
									<div className='col-span-2'>
										<Input
											placeholder='Notes'
											value={item.notes}
											onChange={e => updateItem(index, 'notes', e.target.value)}
										/>
									</div>
									<div className='col-span-1'>
										<Button
											type='button'
											variant='ghost'
											size='sm'
											onClick={() => removeItem(index)}
											disabled={items.length === 1}
											className='text-destructive hover:text-destructive'>
											<Trash2 className='w-4 h-4' />
										</Button>
									</div>
								</div>
							))}
						</div>
					</div>
					<div className='flex justify-end gap-2'>
						<Button
							type='button'
							variant='outline'
							onClick={() => setIsOpen(false)}>
							Cancel
						</Button>
						<Button
							type='submit'
							disabled={createShoppingList.isPending}>
							{createShoppingList.isPending ? 'Creating...' : 'Create List'}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}

function GenerateFromMealPlanDialog({ onSuccess }: { onSuccess: () => void }) {
	const [isOpen, setIsOpen] = useState(false);
	const [selectedMealPlan, setSelectedMealPlan] = useState('');
	const [listName, setListName] = useState('');
	const generateShoppingList = useGenerateShoppingList();
	const { data: mealPlans, isLoading } = useMealPlans();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedMealPlan) return;

		try {
			await generateShoppingList.mutateAsync({
				mealPlanId: parseInt(selectedMealPlan),
				listName: listName.trim() || undefined,
			});
			setIsOpen(false);
			setSelectedMealPlan('');
			setListName('');
			onSuccess();
		} catch (error) {
			// Error is handled by the mutation
		}
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button variant='outline'>
					<Sparkles className='w-4 h-4 mr-2' />
					Generate from Meal Plan
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Generate Shopping List from Meal Plan</DialogTitle>
				</DialogHeader>
				<form
					onSubmit={handleSubmit}
					className='space-y-4'>
					<div className='space-y-2'>
						<Label htmlFor='mealPlan'>Select Meal Plan</Label>
						<select
							id='mealPlan'
							value={selectedMealPlan}
							onChange={e => setSelectedMealPlan(e.target.value)}
							className='w-full p-2 border rounded-md'
							required>
							<option value=''>Choose a meal plan...</option>
							{isLoading ? (
								<option disabled>Loading...</option>
							) : (
								mealPlans?.map((plan: any) => (
									<option
										key={plan.id}
										value={plan.id}>
										{plan.planName} ({plan.entries.length} meals)
									</option>
								))
							)}
						</select>
					</div>
					<div className='space-y-2'>
						<Label htmlFor='listName'>List Name (Optional)</Label>
						<Input
							id='listName'
							value={listName}
							onChange={e => setListName(e.target.value)}
							placeholder='Leave empty for auto-generated name'
						/>
					</div>
					<div className='flex justify-end gap-2'>
						<Button
							type='button'
							variant='outline'
							onClick={() => setIsOpen(false)}>
							Cancel
						</Button>
						<Button
							type='submit'
							disabled={generateShoppingList.isPending || !selectedMealPlan}>
							{generateShoppingList.isPending ? 'Generating...' : 'Generate List'}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}

function ShoppingListCard({ shoppingList }: { shoppingList: any }) {
	const completedCount = shoppingList.items.filter((item: any) => item.isCompleted).length;
	const totalCount = shoppingList.items.length;
	const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

	return (
		<Card className='h-full hover:shadow-md transition-shadow flex flex-col'>
			<CardHeader className='pb-3 flex-shrink-0'>
				<div className='flex items-center justify-between'>
					<CardTitle className='text-lg font-semibold flex items-center gap-2'>
						<ShoppingCart className='w-5 h-5 text-muted-foreground' />
						{shoppingList.listName}
					</CardTitle>
					<Badge variant='secondary'>
						{completedCount}/{totalCount} items
					</Badge>
				</div>
				{shoppingList.mealPlan && (
					<div className='text-sm text-muted-foreground'>
						Generated from: {shoppingList.mealPlan.planName}
					</div>
				)}
				<div className='text-sm text-muted-foreground'>
					Created {format(parseISO(shoppingList.createdAt), 'MMM d, yyyy')}
				</div>
			</CardHeader>
			<CardContent className='pt-0 flex-1 flex flex-col'>
				{/* Progress bar */}
				<div className='w-full bg-muted rounded-full h-2 mb-4'>
					<div
						className='bg-primary h-2 rounded-full transition-all duration-300'
						style={{ width: `${progress}%` }}
					/>
				</div>

				{/* Sample items */}
				<div className='space-y-1 mb-4 flex-1'>
					{shoppingList.items.slice(0, 3).map((item: any) => (
						<div
							key={item.id}
							className='flex items-center gap-2 text-sm'>
							{item.isCompleted ? (
								<CheckCircle className='w-4 h-4 text-green-500' />
							) : (
								<Circle className='w-4 h-4 text-muted-foreground' />
							)}
							<span className={item.isCompleted ? 'line-through text-muted-foreground' : ''}>
								{item.quantity} {item.unit} {item.itemName}
							</span>
						</div>
					))}
					{shoppingList.items.length > 3 && (
						<div className='text-sm text-muted-foreground'>
							+{shoppingList.items.length - 3} more items
						</div>
					)}
				</div>

				{/* Buttons - always at bottom */}
				<div className='flex gap-2 mt-auto pt-4'>
					<Button
						variant='outline'
						size='sm'
						className='flex-1'
						asChild>
						<Link href={`/dashboard/shopping-list/${shoppingList.id}/view`}>
							<ShoppingCart className='w-4 h-4 mr-2' />
							View List
						</Link>
					</Button>
					<Button
						variant='outline'
						size='sm'
						className='flex-1'
						asChild>
						<Link href={`/dashboard/shopping-list/${shoppingList.id}`}>
							<Edit className='w-4 h-4 mr-2' />
							Edit List
						</Link>
					</Button>
					<DeleteShoppingListDialog
						listId={shoppingList.id}
						listName={shoppingList.listName}>
						<Button
							variant='outline'
							size='sm'
							className='text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20'>
							<Trash2 className='w-4 h-4' />
						</Button>
					</DeleteShoppingListDialog>
				</div>
			</CardContent>
		</Card>
	);
}

function ShoppingListSkeleton() {
	return (
		<Card className='h-full'>
			<CardHeader className='pb-3'>
				<div className='flex items-center justify-between'>
					<div className='h-6 w-32 bg-muted rounded animate-pulse' />
					<div className='h-5 w-16 bg-muted rounded animate-pulse' />
				</div>
				<div className='h-4 w-24 bg-muted rounded animate-pulse' />
			</CardHeader>
			<CardContent className='pt-0'>
				<div className='w-full bg-muted rounded-full h-2 mb-4 animate-pulse' />
				<div className='space-y-2'>
					{Array.from({ length: 3 }).map((_, i) => (
						<div
							key={i}
							className='h-4 bg-muted rounded animate-pulse'
						/>
					))}
				</div>
				<div className='flex gap-2 mt-4'>
					<div className='h-8 flex-1 bg-muted rounded animate-pulse' />
					<div className='h-8 w-8 bg-muted rounded animate-pulse' />
				</div>
			</CardContent>
		</Card>
	);
}

export default function ShoppingListPage() {
	const { data: shoppingLists, isLoading, error } = useShoppingLists();

	if (error) {
		return (
			<div className='space-y-6'>
				<div className='flex flex-col items-start gap-4'>
					<Button
						variant='outline'
						size='sm'
						asChild>
						<Link href='/dashboard'>
							<ArrowLeft className='w-4 h-4 mr-2' />
							Back to Dashboard
						</Link>
					</Button>
					<div className='flex flex-col items-center justify-center min-h-[400px] space-y-4'>
						<ShoppingCart className='w-12 h-12 text-destructive' />
						<h2 className='text-xl font-semibold'>Error loading shopping lists</h2>
						<p className='text-muted-foreground text-center max-w-md'>
							There was an error loading your shopping lists. Please try again later.
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
					<Link href='/dashboard'>
						<ArrowLeft className='w-4 h-4 mr-2' />
						Back to Dashboard
					</Link>
				</Button>
				<div className='flex items-center justify-between w-full'>
					<div>
						<h1 className='text-3xl font-bold tracking-tight'>Shopping Lists</h1>
						<p className='text-muted-foreground'>Manage your grocery shopping lists</p>
					</div>
					<div className='flex gap-2'>
						<GenerateFromMealPlanDialog onSuccess={() => {}} />
						<CreateShoppingListDialog onSuccess={() => {}} />
					</div>
				</div>
			</div>

			{/* Content */}
			{isLoading ? (
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
					{Array.from({ length: 6 }).map((_, i) => (
						<ShoppingListSkeleton key={i} />
					))}
				</div>
			) : shoppingLists?.length === 0 ? (
				<div className='flex flex-col items-center justify-center min-h-[400px] space-y-4'>
					<ShoppingCart className='w-12 h-12 text-muted-foreground' />
					<h2 className='text-xl font-semibold'>No shopping lists yet</h2>
					<p className='text-muted-foreground text-center max-w-md'>
						Create your first shopping list or generate one from a meal plan to get started.
					</p>
					<div className='flex gap-2'>
						<GenerateFromMealPlanDialog onSuccess={() => {}} />
						<CreateShoppingListDialog onSuccess={() => {}} />
					</div>
				</div>
			) : (
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
					{shoppingLists?.map((shoppingList: any) => (
						<ShoppingListCard
							key={shoppingList.id}
							shoppingList={shoppingList}
						/>
					))}
				</div>
			)}
		</div>
	);
}
