'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Filter, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface RecipeSearchProps {
	className?: string;
	placeholder?: string;
}

export function RecipeSearch({
	className = '',
	placeholder = 'Search for recipes, ingredients, or cuisines...',
}: RecipeSearchProps) {
	const [query, setQuery] = useState('');
	const router = useRouter();

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		if (query.trim()) {
			router.push(`/recipes?search=${encodeURIComponent(query.trim())}`);
		}
	};

	return (
		<form
			onSubmit={handleSearch}
			className={`w-full ${className}`}>
			<div className='relative flex items-center'>
				<Search className='absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 z-10' />
				<Input
					type='text'
					placeholder={placeholder}
					value={query}
					onChange={e => setQuery(e.target.value)}
					className='pl-12 pr-32 h-12 text-base border-2 focus:border-primary'
				/>
				<div className='absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2'>
					<Button
						type='button'
						variant='ghost'
						size='sm'
						className='h-8 w-8 p-0 hover:bg-muted'
						onClick={() => router.push('/recipes')}>
						<Filter className='h-4 w-4' />
					</Button>
					<Button
						type='submit'
						size='sm'
						className='h-8 px-4 font-medium'>
						Search
					</Button>
				</div>
			</div>
		</form>
	);
}
