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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDeleteAccount } from '@/lib/hooks/use-user';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

interface DeleteAccountDialogProps {
	children: React.ReactNode;
	userRole?: 'RecipeDeveloper' | 'Nutritionist';
}

export function DeleteAccountDialog({
	children,
	userRole = 'RecipeDeveloper',
}: DeleteAccountDialogProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [confirmationText, setConfirmationText] = useState('');
	const [password, setPassword] = useState('');
	const deleteAccount = useDeleteAccount();
	const router = useRouter();

	const isNutritionist = userRole === 'Nutritionist';

	// Validate userRole prop
	if (userRole && !['RecipeDeveloper', 'Nutritionist'].includes(userRole)) {
		console.warn(`Invalid userRole: ${userRole}. Defaulting to RecipeDeveloper.`);
		userRole = 'RecipeDeveloper';
	}

	const handleDelete = async () => {
		if (confirmationText !== 'DELETE') {
			toast.error('Please type DELETE to confirm account deletion');
			return;
		}

		if (!password.trim()) {
			toast.error('Please enter your password to confirm deletion');
			return;
		}

		setIsDeleting(true);

		try {
			await deleteAccount.mutateAsync();

			// Close dialog first
			setIsOpen(false);

			// Sign out the user
			await signOut({ redirect: false });

			// Show success message
			toast.success('Account deleted successfully. You have been signed out.');

			// Redirect to home page after a short delay
			setTimeout(() => {
				try {
					router.push('/');
				} catch (navigationError) {
					console.error('Navigation error:', navigationError);
					// Fallback: reload the page
					window.location.href = '/';
				}
			}, 1000);
		} catch (error) {
			console.error('Error deleting account:', error);
			toast.error('Failed to delete account. Please try again.');
		} finally {
			setIsDeleting(false);
		}
	};

	const handleOpenChange = (open: boolean) => {
		setIsOpen(open);
		if (!open) {
			// Reset form when dialog closes
			setConfirmationText('');
			setPassword('');
		}
	};

	const getDataToDelete = () => {
		if (isNutritionist) {
			return [
				'All your verified recipes and their media files',
				'Your profile picture',
				'All verification notes and health tips',
				'Your nutritionist profile and bio',
				'Account settings and preferences',
			];
		} else {
			return [
				'All your recipes and media files',
				'Your profile picture',
				'Collections and favorites',
				'Meal plans and shopping lists',
				'Reviews and ratings',
				'Account settings and preferences',
			];
		}
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle className='flex items-center gap-2 text-destructive'>
						<Trash2 className='h-5 w-5' />
						Delete Account
					</DialogTitle>
					<DialogDescription>
						This action cannot be undone. This will permanently delete your account and all
						associated data including:
					</DialogDescription>
				</DialogHeader>

				<div className='space-y-4'>
					<div className='rounded-lg bg-destructive/10 p-4'>
						<div className='flex items-start gap-2'>
							<AlertTriangle className='h-4 w-4 text-destructive mt-0.5' />
							<div className='text-sm text-destructive'>
								<ul className='list-disc list-inside space-y-1'>
									{getDataToDelete().map((item, index) => (
										<li key={index}>{item}</li>
									))}
								</ul>
							</div>
						</div>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='confirmation'>
							Type <span className='font-mono font-bold'>DELETE</span> to confirm
						</Label>
						<Input
							id='confirmation'
							value={confirmationText}
							onChange={e => setConfirmationText(e.target.value)}
							placeholder='DELETE'
							className='font-mono'
						/>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='password'>Enter your password to confirm</Label>
						<Input
							id='password'
							type='password'
							value={password}
							onChange={e => setPassword(e.target.value)}
							placeholder='Your password'
						/>
					</div>
				</div>

				<DialogFooter>
					<Button
						variant='outline'
						onClick={() => setIsOpen(false)}
						disabled={isDeleting}>
						Cancel
					</Button>
					<Button
						variant='destructive'
						onClick={handleDelete}
						disabled={isDeleting || confirmationText !== 'DELETE' || !password.trim()}>
						{isDeleting ? 'Deleting...' : 'Delete Account'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
