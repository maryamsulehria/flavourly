import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface User {
	id: number;
	username: string;
	email: string;
	fullName?: string;
	bio?: string;
	profilePicture?: string;
	dietaryRestrictions?: string[];
	allergies?: string[];
	cuisinePreferences?: string[];
	cookingSkill?: string;
	spiceTolerance?: string;
	mealSize?: string;
	createdAt: string;
}

interface UpdateProfileData {
	fullName: string;
	bio?: string;
	profilePicture?: File | null;
}

interface UpdateEmailData {
	email: string;
	password: string;
}

interface UpdatePasswordData {
	currentPassword: string;
	newPassword: string;
}

interface UpdateDietaryPreferencesData {
	dietaryRestrictions: string[];
	allergies: string[];
	cuisinePreferences: string[];
	cookingSkill: string;
	spiceTolerance: string;
	mealSize: string;
}

// Fetch user data
export function useUser() {
	return useQuery({
		queryKey: ['user'],
		queryFn: async (): Promise<User> => {
			const response = await fetch('/api/user');
			if (!response.ok) {
				throw new Error('Failed to fetch user data');
			}
			return response.json();
		},
	});
}

// Update profile
export function useUpdateProfile() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: UpdateProfileData): Promise<User> => {
			const formData = new FormData();
			formData.append('fullName', data.fullName);
			if (data.bio) {
				formData.append('bio', data.bio);
			}
			if (data.profilePicture) {
				formData.append('profilePicture', data.profilePicture);
			}

			const response = await fetch('/api/user/profile', {
				method: 'PATCH',
				body: formData,
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to update profile');
			}

			return response.json();
		},
		onSuccess: updatedUser => {
			// Update the user cache immediately with the new data
			queryClient.setQueryData(['user'], updatedUser);
			// Also invalidate to ensure fresh data
			queryClient.invalidateQueries({ queryKey: ['user'] });
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});
}

// Update email
export function useUpdateEmail() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: UpdateEmailData): Promise<User> => {
			const response = await fetch('/api/user/email', {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to update email');
			}

			return response.json();
		},
		onSuccess: () => {
			toast.success('Email updated successfully');
			queryClient.invalidateQueries({ queryKey: ['user'] });
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});
}

// Update password
export function useUpdatePassword() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: UpdatePasswordData): Promise<void> => {
			const response = await fetch('/api/user/password', {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to update password');
			}
		},
		onSuccess: () => {
			toast.success('Password updated successfully');
			queryClient.invalidateQueries({ queryKey: ['user'] });
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});
}

// Update dietary preferences
export function useUpdateDietaryPreferences() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: UpdateDietaryPreferencesData): Promise<User> => {
			const response = await fetch('/api/user/dietary-preferences', {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to update dietary preferences');
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['user'] });
			toast.success('Dietary preferences updated successfully');
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});
}

// Delete account
export function useDeleteAccount() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (): Promise<{ message: string; deletedFiles: number }> => {
			const response = await fetch('/api/user/delete-account', {
				method: 'DELETE',
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to delete account');
			}

			return response.json();
		},
		onSuccess: data => {
			// Invalidate all user-related queries instead of clearing
			queryClient.invalidateQueries({ queryKey: ['user'] });
			queryClient.invalidateQueries({ queryKey: ['recipes'] });
			queryClient.invalidateQueries({ queryKey: ['collections'] });
			queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
			queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
			toast.success(`Account deleted successfully. ${data.deletedFiles} files removed.`);
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});
}
