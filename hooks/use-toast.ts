import { toast as sonnerToast } from 'sonner';

interface ToastOptions {
	title?: string;
	description?: string;
	variant?: 'default' | 'destructive' | 'success';
	duration?: number;
}

export function useToast() {
	const toast = (options: ToastOptions) => {
		const { title, description, variant = 'default', duration = 4000 } = options;

		switch (variant) {
			case 'destructive':
				sonnerToast.error(title || 'Error', {
					description,
					duration,
				});
				break;
			case 'success':
				sonnerToast.success(title || 'Success', {
					description,
					duration,
				});
				break;
			default:
				sonnerToast(title || 'Notification', {
					description,
					duration,
				});
				break;
		}
	};

	return { toast };
}
