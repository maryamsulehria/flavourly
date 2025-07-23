'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { VerificationStatus } from '@prisma/client';
import {
	AlertTriangle,
	Calendar,
	CheckCircle,
	Clock,
	Edit,
	Eye,
	Save,
	User,
	XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { DetailedRecipe } from './RecipeVerificationForm';

interface VerificationActionsProps {
	recipe: DetailedRecipe;
	onStatusUpdate: (status: VerificationStatus) => void;
	onSaveData: (data: { healthTips?: string; nutritionalInfo?: any; tags?: any }) => void;
	isLoading: boolean;
}

export default function VerificationActions({
	recipe,
	onStatusUpdate,
	onSaveData,
	isLoading,
}: VerificationActionsProps) {
	const [revisionNotes, setRevisionNotes] = useState('');
	const [showRevisionForm, setShowRevisionForm] = useState(false);
	const [editingHealthTips, setEditingHealthTips] = useState(false);
	const [editedHealthTips, setEditedHealthTips] = useState(recipe.healthTips || '');

	useEffect(() => {
		setEditedHealthTips(recipe.healthTips || '');
	}, [recipe.healthTips]);

	const handleVerify = () => {
		onStatusUpdate(VerificationStatus.verified);
	};

	const handleRequestRevision = () => {
		if (!revisionNotes.trim()) {
			toast.error('Please provide revision notes');
			return;
		}
		// Save the revision notes as health tips first
		onSaveData({ healthTips: revisionNotes });
		// Then update the status
		onStatusUpdate(VerificationStatus.needs_revision);
		setShowRevisionForm(false);
		setRevisionNotes('');
	};

	const handleEditHealthTips = () => {
		setEditingHealthTips(true);
		setEditedHealthTips(recipe.healthTips || '');
	};

	const handleSaveHealthTips = () => {
		onSaveData({ healthTips: editedHealthTips });
		setEditingHealthTips(false);
	};

	const handleCancelEditHealthTips = () => {
		setEditingHealthTips(false);
		setEditedHealthTips(recipe.healthTips || '');
	};

	const handleReview = () => {
		// Navigate to public recipe view
		window.location.href = `/recipes/${recipe.id}`;
	};

	const statusConfig = {
		[VerificationStatus.pending_verification]: {
			icon: Clock,
			color: 'text-yellow-600',
			bgColor: 'bg-yellow-50',
			borderColor: 'border-yellow-200',
			label: 'Pending Verification',
			description: 'This recipe is waiting for nutritionist review',
		},
		[VerificationStatus.verified]: {
			icon: CheckCircle,
			color: 'text-green-600',
			bgColor: 'bg-green-50',
			borderColor: 'border-green-200',
			label: 'Verified',
			description: 'This recipe has been verified by a nutritionist',
		},
		[VerificationStatus.needs_revision]: {
			icon: XCircle,
			color: 'text-red-600',
			bgColor: 'bg-red-50',
			borderColor: 'border-red-200',
			label: 'Needs Revision',
			description: 'This recipe requires changes before verification',
		},
	};

	const currentStatus = statusConfig[recipe.status];
	const StatusIcon = currentStatus.icon;

	// Note: We removed the incorrect resubmission detection logic
	// Health tips can be edited by nutritionists without changing recipe status
	// The "resubmitted" status should only be shown when the recipe actually goes through resubmission
	const isResubmittedRecipe = false; // TODO: Implement proper resubmission tracking if needed

	return (
		<div className='space-y-6'>
			{/* Recipe Status */}
			<Card>
				<CardHeader>
					<CardTitle className='flex items-center'>
						<StatusIcon className={`h-5 w-5 mr-2 ${currentStatus.color}`} />
						Recipe Status
					</CardTitle>
				</CardHeader>
				<CardContent className='space-y-4'>
					<div
						className={`p-4 rounded-lg ${currentStatus.bgColor} ${currentStatus.borderColor} border`}>
						<div className='flex items-center gap-2 mb-2'>
							<StatusIcon className={`h-4 w-4 ${currentStatus.color}`} />
							<Badge
								variant='secondary'
								className={currentStatus.color}>
								{currentStatus.label}
							</Badge>
						</div>
						<p className='text-sm text-muted-foreground'>{currentStatus.description}</p>
					</div>

					{/* Verification History */}
					{recipe.verifiedBy && (
						<div className='space-y-2'>
							<Label className='text-sm font-medium'>Verified By</Label>
							<div className='flex items-center gap-2 text-sm'>
								<Avatar className='h-6 w-6'>
									<AvatarImage src={recipe.verifiedBy.profilePicture || undefined} />
									<AvatarFallback className='text-xs'>
										{recipe.verifiedBy.fullName
											? recipe.verifiedBy.fullName
													.split(' ')
													.map((n: string) => n[0])
													.join('')
													.toUpperCase()
											: recipe.verifiedBy.username.charAt(0).toUpperCase()}
									</AvatarFallback>
								</Avatar>
								<span>{recipe.verifiedBy.fullName || recipe.verifiedBy.username}</span>
							</div>
							{recipe.verifiedAt && (
								<div className='flex items-center gap-2 text-sm text-muted-foreground'>
									<Calendar className='h-4 w-4' />
									<span>{new Date(recipe.verifiedAt).toLocaleDateString()}</span>
								</div>
							)}
						</div>
					)}

					{/* Current Health Tips */}
					{recipe.healthTips && (
						<div className='space-y-2'>
							<div className='flex items-center justify-between'>
								<Label className='text-sm font-medium'>Current Health Tips</Label>
								{!editingHealthTips && (
									<Button
										variant='outline'
										size='sm'
										onClick={handleEditHealthTips}
										className='h-8 px-2'>
										<Edit className='h-3 w-3 mr-1' />
										Edit
									</Button>
								)}
							</div>

							{editingHealthTips ? (
								<div className='space-y-3'>
									<Textarea
										value={editedHealthTips}
										onChange={e => setEditedHealthTips(e.target.value)}
										placeholder='Enter revision notes...'
										rows={4}
										className='resize-none'
									/>
									<div className='flex gap-2'>
										<Button
											size='sm'
											onClick={handleSaveHealthTips}
											disabled={isLoading}
											className='flex-1'>
											<Save className='h-3 w-3 mr-1' />
											{isLoading ? 'Saving...' : 'Save Changes'}
										</Button>
										<Button
											size='sm'
											variant='outline'
											onClick={handleCancelEditHealthTips}
											className='flex-1'>
											Cancel
										</Button>
									</div>
								</div>
							) : (
								<div className='p-3 bg-muted rounded-lg'>
									<p className='text-sm whitespace-pre-wrap'>{recipe.healthTips}</p>
								</div>
							)}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Quick Actions */}
			<Card>
				<CardHeader>
					<CardTitle>Quick Actions</CardTitle>
				</CardHeader>
				<CardContent className='space-y-3'>
					<Button
						variant='outline'
						onClick={handleReview}
						className='w-full justify-start'>
						<Eye className='h-4 w-4 mr-2' />
						Preview Recipe
					</Button>

					<Button
						variant='outline'
						onClick={() => (window.location.href = `/users/${recipe.author.id}`)}
						className='w-full justify-start'>
						<User className='h-4 w-4 mr-2' />
						View Author Profile
					</Button>
				</CardContent>
			</Card>

			{/* Verification Actions */}
			<Card>
				<CardHeader>
					<CardTitle>Verification Actions</CardTitle>
				</CardHeader>
				<CardContent className='space-y-4'>
					{recipe.status === VerificationStatus.pending_verification && (
						<>
							<Button
								onClick={handleVerify}
								disabled={isLoading}
								className='w-full bg-green-600 hover:bg-green-700'>
								<CheckCircle className='h-4 w-4 mr-2' />
								{isLoading ? 'Verifying...' : 'Verify Recipe'}
							</Button>

							<Button
								onClick={() => setShowRevisionForm(true)}
								disabled={isLoading}
								variant='destructive'
								className='w-full'>
								<XCircle className='h-4 w-4 mr-2' />
								Request Revision
							</Button>
						</>
					)}

					{recipe.status === VerificationStatus.verified && (
						<>
							<Alert>
								<CheckCircle className='h-4 w-4' />
								<AlertDescription>
									This recipe has been verified and is now live. All information has been reviewed
									and approved.
								</AlertDescription>
							</Alert>
						</>
					)}

					{recipe.status === VerificationStatus.needs_revision && (
						<>
							<Alert>
								<AlertTriangle className='h-4 w-4' />
								<AlertDescription>
									This recipe needs revision. The author has been notified and can make changes
									before resubmitting.
								</AlertDescription>
							</Alert>

							<Button
								onClick={handleVerify}
								disabled={isLoading}
								className='w-full bg-green-600 hover:bg-green-700'>
								<CheckCircle className='h-4 w-4 mr-2' />
								{isLoading ? 'Verifying...' : 'Verify Recipe'}
							</Button>
						</>
					)}
				</CardContent>
			</Card>

			{/* Revision Form */}
			{showRevisionForm && (
				<Card>
					<CardHeader>
						<CardTitle>Request Revision</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='space-y-2'>
							<Label htmlFor='revisionNotes'>Revision Notes</Label>
							<Textarea
								id='revisionNotes'
								placeholder='Explain what needs to be changed or improved...'
								value={revisionNotes}
								onChange={e => setRevisionNotes(e.target.value)}
								rows={4}
							/>
							<p className='text-sm text-muted-foreground'>
								These notes will be sent to the recipe author to help them improve their submission.
							</p>
						</div>

						<div className='flex gap-2'>
							<Button
								onClick={handleRequestRevision}
								disabled={isLoading || !revisionNotes.trim()}
								variant='destructive'
								className='flex-1'>
								<XCircle className='h-4 w-4 mr-2' />
								{isLoading ? 'Sending...' : 'Send Revision Request'}
							</Button>
							<Button
								onClick={() => {
									setShowRevisionForm(false);
									setRevisionNotes('');
								}}
								variant='outline'
								className='flex-1'>
								Cancel
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Recipe Statistics */}
			<Card>
				<CardHeader>
					<CardTitle>Recipe Statistics</CardTitle>
				</CardHeader>
				<CardContent className='space-y-3'>
					<div className='grid grid-cols-2 gap-4'>
						<div className='text-center p-3 bg-muted rounded-lg'>
							<div className='text-lg font-semibold'>{recipe._count.ingredients}</div>
							<div className='text-sm text-muted-foreground'>Ingredients</div>
						</div>
						<div className='text-center p-3 bg-muted rounded-lg'>
							<div className='text-lg font-semibold'>{recipe._count.steps}</div>
							<div className='text-sm text-muted-foreground'>Steps</div>
						</div>
						<div className='text-center p-3 bg-muted rounded-lg'>
							<div className='text-lg font-semibold'>{recipe.cookingTimeMinutes || 'N/A'}</div>
							<div className='text-sm text-muted-foreground'>Minutes</div>
						</div>
						<div className='text-center p-3 bg-muted rounded-lg'>
							<div className='text-lg font-semibold'>{recipe._count.reviews}</div>
							<div className='text-sm text-muted-foreground'>Reviews</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
