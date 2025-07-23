'use client';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { useDeleteShoppingList } from '@/lib/hooks/use-shopping-lists';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface DeleteShoppingListDialogProps {
	listId: number;
	listName: string;
	children: React.ReactNode;
}

export function DeleteShoppingListDialog({
	listId,
	listName,
	children,
}: DeleteShoppingListDialogProps) {
	const [isOpen, setIsOpen] = useState(false);
	const deleteShoppingList = useDeleteShoppingList();
	const router = useRouter();

	const handleDelete = async () => {
		try {
			await deleteShoppingList.mutateAsync(listId);
			setIsOpen(false);
			// Navigate back to shopping lists after successful deletion
			router.push('/dashboard/shopping-list');
		} catch (error) {
			// Error is handled by the mutation
		}
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={setIsOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className='sm:max-w-md'>
				<DialogHeader>
					<DialogTitle className='flex items-center gap-2'>
						<AlertTriangle className='w-5 h-5 text-destructive' />
						Delete Shopping List
					</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete "{listName}"? This action cannot be undone and will
						permanently remove the shopping list and all its items.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className='flex gap-2'>
					<Button
						variant='outline'
						onClick={() => setIsOpen(false)}
						disabled={deleteShoppingList.isPending}>
						Cancel
					</Button>
					<Button
						variant='destructive'
						onClick={handleDelete}
						disabled={deleteShoppingList.isPending}>
						{deleteShoppingList.isPending ? (
							<>
								<Trash2 className='w-4 h-4 mr-2 animate-spin' />
								Deleting...
							</>
						) : (
							<>
								<Trash2 className='w-4 h-4 mr-2' />
								Delete List
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
