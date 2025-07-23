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
import { useDeleteMealPlan } from '@/lib/hooks/use-meal-plans';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface DeleteMealPlanDialogProps {
	planId: number;
	planName: string;
	children: React.ReactNode;
}

export function DeleteMealPlanDialog({ planId, planName, children }: DeleteMealPlanDialogProps) {
	const [isOpen, setIsOpen] = useState(false);
	const deleteMealPlan = useDeleteMealPlan();
	const router = useRouter();

	const handleDelete = async () => {
		try {
			await deleteMealPlan.mutateAsync(planId);
			setIsOpen(false);
			// Navigate back to meal planner after successful deletion
			router.push('/dashboard/meal-planner');
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
						Delete Meal Plan
					</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete "{planName}"? This action cannot be undone and will
						permanently remove the meal plan and all its entries.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className='flex gap-2'>
					<Button
						variant='outline'
						onClick={() => setIsOpen(false)}
						disabled={deleteMealPlan.isPending}>
						Cancel
					</Button>
					<Button
						variant='destructive'
						onClick={handleDelete}
						disabled={deleteMealPlan.isPending}>
						{deleteMealPlan.isPending ? (
							<>
								<Trash2 className='w-4 h-4 mr-2 animate-spin' />
								Deleting...
							</>
						) : (
							<>
								<Trash2 className='w-4 h-4 mr-2' />
								Delete Plan
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
