'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useShoppingList, useToggleShoppingListItem } from '@/lib/hooks/use-shopping-lists';
import { format, parseISO } from 'date-fns';
import { ArrowLeft, CheckCircle, Circle, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';

export default function ShoppingListViewPage({ params }: { params: Promise<{ listId: string }> }) {
	const { listId } = use(params);
	const { data: shoppingList, isLoading, error } = useShoppingList(parseInt(listId));
	const toggleItem = useToggleShoppingListItem();

	const handleToggleItem = async (itemId: number, isCompleted: boolean) => {
		try {
			await toggleItem.mutateAsync({
				listId: parseInt(listId),
				itemId,
				isCompleted: !isCompleted,
			});
		} catch (error) {
			// Error is handled by the mutation
		}
	};

	const completedCount = shoppingList?.items.filter((item: any) => item.isCompleted).length || 0;
	const totalCount = shoppingList?.items.length || 0;
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

	if (isLoading) {
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
						<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
						<p className='text-muted-foreground'>Loading shopping list...</p>
					</div>
				</div>
			</div>
		);
	}

	if (!shoppingList) {
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
						<ShoppingCart className='w-12 h-12 text-muted-foreground' />
						<h2 className='text-xl font-semibold'>Shopping list not found</h2>
						<p className='text-muted-foreground text-center max-w-md'>
							The shopping list you're looking for doesn't exist or has been deleted.
						</p>
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
						<h1 className='text-3xl font-bold tracking-tight flex items-center gap-2'>
							<ShoppingCart className='w-8 h-8 text-muted-foreground' />
							{shoppingList.listName}
						</h1>
						<div className='flex items-center gap-4 mt-2'>
							<Badge variant='secondary'>
								{completedCount}/{totalCount} items completed
							</Badge>
							{shoppingList.mealPlan && (
								<span className='text-sm text-muted-foreground'>
									Generated from: {shoppingList.mealPlan.planName}
								</span>
							)}
							<span className='text-sm text-muted-foreground'>
								Created {format(parseISO(shoppingList.createdAt), 'MMM d, yyyy')}
							</span>
						</div>
					</div>
					<Button
						variant='outline'
						asChild>
						<Link href={`/dashboard/shopping-list/${listId}`}>Edit List</Link>
					</Button>
				</div>
			</div>

			{/* Progress */}
			<Card>
				<CardHeader>
					<CardTitle className='text-lg'>Progress</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='w-full bg-muted rounded-full h-3 mb-2'>
						<div
							className='bg-primary h-3 rounded-full transition-all duration-300'
							style={{ width: `${progress}%` }}
						/>
					</div>
					<p className='text-sm text-muted-foreground'>
						{completedCount} of {totalCount} items completed ({Math.round(progress)}%)
					</p>
				</CardContent>
			</Card>

			{/* Items */}
			<Card>
				<CardHeader>
					<CardTitle className='text-lg'>Shopping Items</CardTitle>
				</CardHeader>
				<CardContent>
					{shoppingList.items.length === 0 ? (
						<div className='text-center py-8'>
							<ShoppingCart className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
							<p className='text-muted-foreground'>No items in this shopping list</p>
						</div>
					) : (
						<div className='space-y-3'>
							{shoppingList.items.map((item: any) => (
								<div
									key={item.id}
									className='flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors'>
									<Button
										variant='ghost'
										size='sm'
										onClick={() => handleToggleItem(item.id, item.isCompleted)}
										disabled={toggleItem.isPending}
										className='p-0 h-auto'>
										{item.isCompleted ? (
											<CheckCircle className='w-6 h-6 text-green-500' />
										) : (
											<Circle className='w-6 h-6 text-muted-foreground hover:text-primary transition-colors' />
										)}
									</Button>
									<div className='flex-1'>
										<div
											className={`flex items-center gap-2 ${
												item.isCompleted ? 'line-through text-muted-foreground' : ''
											}`}>
											<span className='font-medium'>
												{item.quantity} {item.unit} {item.itemName}
											</span>
											{item.notes && (
												<span className='text-sm text-muted-foreground'>({item.notes})</span>
											)}
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
