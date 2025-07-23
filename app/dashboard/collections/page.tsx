'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useCreateCollection, useDeleteCollection } from '@/lib/hooks/use-mutations';
import { useUserCollections } from '@/lib/hooks/use-queries';
import { ArrowLeft, Edit, FolderOpen, Plus, Trash2, Users } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

interface CreateCollectionDialogProps {
	onSuccess: () => void;
}

function CreateCollectionDialog({ onSuccess }: CreateCollectionDialogProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [formData, setFormData] = useState({
		collectionName: '',
		description: '',
	});
	const createCollection = useCreateCollection();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.collectionName.trim()) {
			toast.error('Collection name is required');
			return;
		}

		try {
			await createCollection.mutateAsync({
				collectionName: formData.collectionName.trim(),
				description: formData.description.trim() || undefined,
			});
			setFormData({ collectionName: '', description: '' });
			setIsOpen(false);
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
					Create Collection
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create New Collection</DialogTitle>
					<DialogDescription>
						Organize your recipes into themed collections like &quot;Quick Weeknight Dinners&quot;
						or &quot;Holiday Baking&quot;.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className='space-y-4'>
						<div className='space-y-2'>
							<Label htmlFor='collectionName'>Collection Name *</Label>
							<Input
								id='collectionName'
								value={formData.collectionName}
								onChange={e => setFormData(prev => ({ ...prev, collectionName: e.target.value }))}
								placeholder='e.g., Quick Weeknight Dinners'
								maxLength={100}
								required
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='description'>Description</Label>
							<Textarea
								id='description'
								value={formData.description}
								onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
								placeholder='Optional description of this collection'
								maxLength={500}
								rows={3}
							/>
						</div>
					</div>
					<DialogFooter className='mt-6'>
						<Button
							type='button'
							variant='outline'
							onClick={() => setIsOpen(false)}>
							Cancel
						</Button>
						<Button
							type='submit'
							disabled={createCollection.isPending}>
							{createCollection.isPending ? 'Creating...' : 'Create Collection'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

function DeleteCollectionDialog({
	collection,
	onDelete,
}: {
	collection: { id: number; collectionName: string };
	onDelete: () => void;
}) {
	const [isOpen, setIsOpen] = useState(false);
	const deleteCollection = useDeleteCollection();

	const handleDelete = async () => {
		try {
			await deleteCollection.mutateAsync(collection.id);
			setIsOpen(false);
			onDelete();
		} catch (_error) {
			// Error is handled by the mutation
		}
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button
					variant='outline'
					size='sm'
					className='flex-1 text-destructive hover:text-destructive hover:bg-destructive/10'>
					<Trash2 className='w-4 h-4 mr-1' />
					Delete
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Delete Collection</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete &quot;{collection.collectionName}&quot;? This action
						cannot be undone and will remove the collection, but your recipes will remain intact.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button
						variant='outline'
						onClick={() => setIsOpen(false)}>
						Cancel
					</Button>
					<Button
						variant='destructive'
						onClick={handleDelete}
						disabled={deleteCollection.isPending}>
						{deleteCollection.isPending ? 'Deleting...' : 'Delete Collection'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function CollectionCard({
	collection,
}: {
	collection: {
		id: number;
		collectionName: string;
		description: string | null;
		createdAt: string;
		_count: { recipes: number };
		firstImage?: string;
		recipeCount: number;
	};
}) {
	return (
		<Card className='h-full hover:shadow-md transition-shadow group flex flex-col'>
			<CardHeader className='pb-3 flex-shrink-0'>
				<div className='flex items-start justify-between'>
					<div className='flex-1 min-w-0'>
						<CardTitle className='text-lg font-semibold truncate flex items-center gap-2'>
							<FolderOpen className='w-5 h-5 text-muted-foreground' />
							{collection.collectionName}
						</CardTitle>
						<CardDescription className='line-clamp-2 mt-1'>
							{collection.description || 'No description available'}
						</CardDescription>
					</div>
				</div>
			</CardHeader>

			<CardContent className='pt-0 flex-1 flex flex-col'>
				{/* Collection Image */}
				{collection.firstImage && (
					<div className='relative mb-4 aspect-video rounded-lg overflow-hidden bg-muted'>
						<img
							src={collection.firstImage}
							alt={collection.collectionName}
							className='w-full h-full object-cover'
						/>
					</div>
				)}

				{/* Collection Stats */}
				<div className='flex items-center gap-4 text-sm text-muted-foreground mb-4'>
					<div className='flex items-center gap-1'>
						<Users className='w-4 h-4' />
						<span>{collection.recipeCount} recipes</span>
					</div>
					<div className='text-xs'>
						Created {new Date(collection.createdAt).toLocaleDateString()}
					</div>
				</div>

				{/* Action Buttons - always at bottom */}
				<div className='flex gap-2 mt-auto pt-4'>
					<Button
						asChild
						variant='outline'
						size='sm'
						className='flex-1'>
						<Link href={`/dashboard/collections/${collection.id}`}>
							<FolderOpen className='w-4 h-4 mr-1' />
							View
						</Link>
					</Button>
					<Button
						asChild
						size='sm'
						className='flex-1'>
						<Link href={`/dashboard/collections/${collection.id}/edit`}>
							<Edit className='w-4 h-4 mr-1' />
							Edit
						</Link>
					</Button>
					<DeleteCollectionDialog
						collection={collection}
						onDelete={() => {
							// The centralized query system will automatically refetch the data
						}}
					/>
				</div>
			</CardContent>
		</Card>
	);
}

function CollectionSkeleton() {
	return (
		<Card className='h-full'>
			<CardHeader className='pb-3'>
				<Skeleton className='h-6 w-3/4 mb-2' />
				<Skeleton className='h-4 w-full' />
			</CardHeader>
			<CardContent className='pt-0'>
				<Skeleton className='aspect-video w-full mb-4' />
				<div className='flex gap-4 mb-4'>
					<Skeleton className='h-4 w-20' />
					<Skeleton className='h-4 w-24' />
				</div>
				<Skeleton className='h-8 w-full' />
			</CardContent>
		</Card>
	);
}

export default function CollectionsPage() {
	const { data: collections, isLoading, error } = useUserCollections();

	if (error) {
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
					<div>
						<h1 className='text-3xl font-bold tracking-tight'>My Collections</h1>
						<p className='text-muted-foreground'>Organize your recipes into collections</p>
					</div>
				</div>

				<div className='flex flex-col items-center justify-center min-h-[400px] space-y-4'>
					<FolderOpen className='w-12 h-12 text-destructive' />
					<h2 className='text-xl font-semibold'>Error loading collections</h2>
					<p className='text-muted-foreground text-center max-w-md'>
						There was an error loading your collections. Please try again later.
					</p>
					<Button onClick={() => window.location.reload()}>Try Again</Button>
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
						<h1 className='text-3xl font-bold tracking-tight'>My Collections</h1>
						<p className='text-muted-foreground'>Organize your recipes into collections</p>
					</div>
					<CreateCollectionDialog
						onSuccess={() => {
							// The centralized query system will automatically refetch the data
						}}
					/>
				</div>
			</div>

			{/* Collections Grid */}
			<div>
				{isLoading ? (
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
						{Array.from({ length: 6 }).map((_, i) => (
							<CollectionSkeleton key={i} />
						))}
					</div>
				) : collections && collections.length > 0 ? (
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
						{collections.map((collection: any) => (
							<CollectionCard
								key={collection.id}
								collection={collection}
							/>
						))}
					</div>
				) : (
					<div className='text-center py-12'>
						<FolderOpen className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
						<h3 className='text-lg font-semibold mb-2'>No collections yet</h3>
						<p className='text-muted-foreground mb-6 max-w-md mx-auto'>
							Start organizing your recipes into themed collections like "Quick Weeknight Dinners"
							or "Holiday Baking".
						</p>
						<CreateCollectionDialog
							onSuccess={() => {
								// The centralized query system will automatically refetch the data
							}}
						/>
					</div>
				)}
			</div>
		</div>
	);
}
