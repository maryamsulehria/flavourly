'use client';

import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';
import { forwardRef, useState } from 'react';
import { Input } from './input';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	showToggle?: boolean;
	className?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
	({ showToggle = true, className, ...props }, ref) => {
		const [showPassword, setShowPassword] = useState(false);

		const togglePasswordVisibility = () => {
			setShowPassword(!showPassword);
		};

		return (
			<div className='relative'>
				<Input
					{...props}
					ref={ref}
					type={showPassword ? 'text' : 'password'}
					className={cn('pr-10', className)}
				/>
				{showToggle && (
					<button
						type='button'
						onClick={togglePasswordVisibility}
						className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
						aria-label={showPassword ? 'Hide password' : 'Show password'}>
						{showPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
					</button>
				)}
			</div>
		);
	},
);

PasswordInput.displayName = 'PasswordInput';
