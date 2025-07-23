'use client';

import { AddRecipeToCollectionDialog } from '@/components/add-recipe-to-collection-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useUpdateCollection } from '@/lib/hooks/use-mutations';
import { useCollection } from '@/lib/hooks/use-queries';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface EditCollectionPageProps {
	params: Promise<{ collectionId: string }>;
}

export default function EditCollectionPage({ params }: EditCollectionPageProps) {
	const { collectionId } = use(params);
	const collectionIdNum = parseInt(collectionId);
	const router = useRouter();
	const { data: collection, isLoading, error } = useCollection(collectionIdNum);
	const updateCollection = useUpdateCollection();

	const [formData, setFormData] = useState({
		collectionName: '',
		description: '',
	});

	// Update form data when collection data loads
	useEffect(() => {
		if (collection) {
			setFormData({
				collectionName: collection.collectionName,
				description: collection.description || '',
			});
		}
	}, [collection]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.collectionName.trim()) {
			toast.error('Collection name is required');
			return;
		}

		try {
			await updateCollection.mutateAsync({
				id: collectionIdNum,
				collectionName: formData.collectionName.trim(),
				description: formData.description.trim() || undefined,
			});
			toast.success('Collection updated successfully!');
			router.push(`/dashboard/collections/${collectionIdNum}`);
		} catch (error) {
			// Error is handled by the mutation
		}
	};

	if (error) {
		return (
			<div className='space-y-6'>
				{/* Header */}
				<div className='flex flex-col items-start gap-4'>
					<Button
						variant='outline'
						size='sm'
						asChild>
						<Link href={`/dashboard/collections/${collectionIdNum}`}>
							<ArrowLeft className='w-4 h-4 mr-2' />
							Back to Collection
						</Link>
					</Button>
					<div>
						<h1 className='text-3xl font-bold tracking-tight'>Collection Not Found</h1>
						<p className='text-muted-foreground'>
							The collection you're trying to edit doesn't exist or has been removed.
						</p>
					</div>
				</div>

				<div className='flex flex-col items-center justify-center min-h-[400px] space-y-4'>
					<div className='w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center'>
						<ArrowLeft className='w-6 h-6 text-destructive' />
					</div>
					<h2 className='text-xl font-semibold'>Error loading collection</h2>
					<p className='text-muted-foreground text-center max-w-md'>
						There was an error loading this collection. Please try again later.
					</p>
					<Button asChild>
						<Link href='/dashboard/collections'>Back to Collections</Link>
					</Button>
				</div>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className='space-y-6'>
				{/* Header Skeleton */}
				<div className='flex flex-col items-start gap-4'>
					<Skeleton className='h-10 w-40' />
					<div>
						<Skeleton className='h-8 w-64 mb-2' />
						<Skeleton className='h-4 w-96' />
					</div>
				</div>

				{/* Form Skeleton */}
				<Card>
					<CardHeader>
						<Skeleton className='h-6 w-48 mb-2' />
						<Skeleton className='h-4 w-96' />
					</CardHeader>
					<CardContent className='space-y-6'>
						<div>
							<Skeleton className='h-4 w-24 mb-2' />
							<Skeleton className='h-10 w-full' />
						</div>
						<div>
							<Skeleton className='h-4 w-24 mb-2' />
							<Skeleton className='h-24 w-full' />
						</div>
						<Skeleton className='h-10 w-32' />
					</CardContent>
				</Card>
			</div>
		);
	}

	if (!collection) {
		return null;
	}

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex flex-col items-start gap-4'>
				<Button
					variant='outline'
					size='sm'
					asChild>
					<Link href={`/dashboard/collections/${collectionIdNum}`}>
						<ArrowLeft className='w-4 h-4 mr-2' />
						Back to Collection
					</Link>
				</Button>
				<div className='w-full'>
					<div className='flex items-start justify-between'>
						<div>
							<h1 className='text-3xl font-bold tracking-tight'>Edit Collection</h1>
							<p className='text-muted-foreground'>
								Update your collection details and description.
							</p>
						</div>
						<AddRecipeToCollectionDialog
							collectionId={collectionIdNum}
							collectionName={collection.collectionName}
							onSuccess={() => {
								// The centralized query system will automatically refetch the data
							}}
						/>
					</div>
				</div>
			</div>

			{/* Edit Form */}
			<Card>
				<CardHeader>
					<CardTitle>Collection Details</CardTitle>
					<CardDescription>
						Update the name and description of your collection. Changes will be saved immediately.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={handleSubmit}
						className='space-y-6'>
						<div>
							<Label htmlFor='collectionName'>Collection Name *</Label>
							<Input
								id='collectionName'
								value={formData.collectionName}
								onChange={e => setFormData(prev => ({ ...prev, collectionName: e.target.value }))}
								placeholder='e.g., Quick Weeknight Dinners'
								maxLength={100}
								required
							/>
							<p className='text-xs text-muted-foreground mt-1'>
								{formData.collectionName.length}/100 characters
							</p>
						</div>

						<div>
							<Label htmlFor='description'>Description</Label>
							<Textarea
								id='description'
								value={formData.description}
								onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
								placeholder='Optional description of this collection'
								maxLength={500}
								rows={4}
							/>
							<p className='text-xs text-muted-foreground mt-1'>
								{formData.description.length}/500 characters
							</p>
						</div>

						<div className='flex gap-2'>
							<Button
								type='submit'
								disabled={updateCollection.isPending}>
								<Save className='w-4 h-4 mr-2' />
								{updateCollection.isPending ? 'Saving...' : 'Save Changes'}
							</Button>
							<Button
								type='button'
								variant='outline'
								asChild>
								<Link href={`/dashboard/collections/${collectionIdNum}`}>Cancel</Link>
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
