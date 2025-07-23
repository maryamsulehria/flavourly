'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Image, Upload, Video, X } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';

interface MediaFile {
	id: string;
	url: string;
	type: 'image' | 'video';
	publicId: string;
}

interface MediaUploadProps {
	onMediaChange: (media: MediaFile[]) => void;
	value?: MediaFile[];
}

export function MediaUpload({ onMediaChange, value = [] }: MediaUploadProps) {
	const [isDragging, setIsDragging] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const uploadToCloudinary = async (file: File): Promise<MediaFile> => {
		const formData = new FormData();
		formData.append('file', file);
		formData.append(
			'upload_preset',
			process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'flavourly_uploads',
		);
		formData.append('folder', 'flavourly/recipes');

		const response = await fetch(
			`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
			{
				method: 'POST',
				body: formData,
			},
		);

		if (!response.ok) {
			throw new Error('Upload failed');
		}

		const result = await response.json();

		return {
			id: result.public_id,
			url: result.secure_url,
			type: result.resource_type === 'video' ? 'video' : 'image',
			publicId: result.public_id,
		};
	};

	const handleFileUpload = async (files: FileList) => {
		setIsUploading(true);
		const newMedia: MediaFile[] = [];

		try {
			for (const file of Array.from(files)) {
				// Validate file type
				const validTypes = [
					'image/jpeg',
					'image/jpg',
					'image/png',
					'image/webp',
					'video/mp4',
					'video/webm',
					'video/ogg',
				];
				if (!validTypes.includes(file.type)) {
					toast.error(`Invalid file type: ${file.name}`);
					continue;
				}

				// Validate file size (10MB)
				if (file.size > 10 * 1024 * 1024) {
					toast.error(`File too large: ${file.name}`);
					continue;
				}

				const mediaFile = await uploadToCloudinary(file);
				newMedia.push(mediaFile);
			}

			onMediaChange([...value, ...newMedia]);
			toast.success(`Successfully uploaded ${newMedia.length} file(s)`);
		} catch (error) {
			console.error('Upload error:', error);
			toast.error('Failed to upload files');
		} finally {
			setIsUploading(false);
		}
	};

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	}, []);

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	}, []);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			e.stopPropagation();
			setIsDragging(false);

			const files = e.dataTransfer.files;
			if (files.length > 0) {
				handleFileUpload(files);
			}
		},
		[handleFileUpload],
	);

	const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (files && files.length > 0) {
			handleFileUpload(files);
		}
		// Reset input value to allow selecting the same file again
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	const removeMedia = (id: string) => {
		const updatedMedia = value.filter(media => media.id !== id);
		onMediaChange(updatedMedia);
	};

	return (
		<div className='space-y-4'>
			{/* Upload Area */}
			<Card
				className={`relative border-2 border-dashed transition-colors ${
					isDragging
						? 'border-primary bg-primary/5'
						: 'border-muted-foreground/25 hover:border-muted-foreground/50'
				}`}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}>
				<div className='flex flex-col items-center justify-center p-8 text-center'>
					<Upload className='h-8 w-8 text-muted-foreground mb-4' />
					<div className='space-y-2'>
						<p className='text-sm font-medium'>
							{isDragging ? 'Drop files here' : 'Drag and drop files here'}
						</p>
						<p className='text-xs text-muted-foreground'>
							Supports: JPG, PNG, WebP, MP4, WebM, OGG (max 10MB each)
						</p>
					</div>
					<Button
						type='button'
						variant='outline'
						size='sm'
						className='mt-4'
						onClick={() => fileInputRef.current?.click()}
						disabled={isUploading}>
						{isUploading ? 'Uploading...' : 'Choose Files'}
					</Button>
				</div>

				{/* Hidden file input */}
				<input
					ref={fileInputRef}
					type='file'
					multiple
					accept='image/*,video/*'
					onChange={handleFileInputChange}
					className='hidden'
				/>
			</Card>

			{/* Media Preview */}
			{value.length > 0 && (
				<div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
					{value.map(media => (
						<Card
							key={media.id}
							className='relative group'>
							<div className='aspect-square overflow-hidden rounded-t-lg'>
								{media.type === 'image' ? (
									<img
										src={media.url}
										alt='Recipe media'
										className='w-full h-full object-cover'
									/>
								) : (
									<video
										src={media.url}
										className='w-full h-full object-cover'
										controls
										aria-label='Recipe video'
									/>
								)}
							</div>

							{/* Remove button */}
							<Button
								type='button'
								variant='destructive'
								size='sm'
								className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity'
								onClick={() => removeMedia(media.id)}>
								<X className='h-4 w-4' />
							</Button>

							{/* Media type indicator */}
							<div className='absolute bottom-2 left-2'>
								{media.type === 'image' ? (
									<Image className='h-4 w-4 text-white drop-shadow' />
								) : (
									<Video className='h-4 w-4 text-white drop-shadow' />
								)}
							</div>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
