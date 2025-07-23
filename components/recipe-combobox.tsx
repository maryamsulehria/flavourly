'use client';

import { Button } from '@/components/ui/button';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-react';
import * as React from 'react';

interface Recipe {
	id: number;
	title: string;
	cookingTimeMinutes?: number | string;
	servings?: number | string;
}

interface RecipeComboboxProps {
	recipes: Recipe[];
	value?: string;
	onValueChange: (value: string) => void;
	placeholder?: string;
	disabled?: boolean;
}

export function RecipeCombobox({
	recipes,
	value,
	onValueChange,
	placeholder = 'Select a recipe...',
	disabled = false,
}: RecipeComboboxProps) {
	const [open, setOpen] = React.useState(false);

	const formatCookingTime = (time?: number | string) => {
		if (!time) return 'No time';
		const numTime = typeof time === 'string' ? parseInt(time) : time;
		return isNaN(numTime) ? 'No time' : `${numTime} min`;
	};

	const formatServings = (servings?: number | string) => {
		if (!servings) return 'No servings';
		const numServings = typeof servings === 'string' ? parseInt(servings) : servings;
		return isNaN(numServings) ? 'No servings' : `${numServings} servings`;
	};

	return (
		<Popover
			open={open}
			onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant='outline'
					role='combobox'
					aria-expanded={open}
					className='w-full justify-between'
					disabled={disabled}>
					{value ? recipes.find(recipe => recipe.id.toString() === value)?.title : placeholder}
					<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className='w-full p-0'
				align='start'>
				<Command>
					<CommandInput placeholder='Search recipes...' />
					<CommandList>
						<CommandEmpty>No recipe found.</CommandEmpty>
						<CommandGroup>
							{recipes.map(recipe => (
								<CommandItem
									key={recipe.id}
									value={recipe.title}
									onSelect={() => {
										onValueChange(recipe.id.toString());
										setOpen(false);
									}}>
									<Check
										className={cn(
											'mr-2 h-4 w-4',
											value === recipe.id.toString() ? 'opacity-100' : 'opacity-0',
										)}
									/>
									<div className='flex flex-col'>
										<span className='font-medium'>{recipe.title}</span>
										<span className='text-sm text-muted-foreground'>
											{formatCookingTime(recipe.cookingTimeMinutes)} •{' '}
											{formatServings(recipe.servings)}
										</span>
									</div>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
