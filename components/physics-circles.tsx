'use client';

import { motion } from 'framer-motion';

interface Circle {
	id: number;
	size: number;
	color: string;
	animation: string;
}

export function PhysicsCircles() {
	const circles: Circle[] = [
		{ id: 1, size: 56, color: 'bg-green-500/20', animation: 'animate-float-slow' },
		{ id: 2, size: 52, color: 'bg-orange-500/20', animation: 'animate-float-medium' },
		{ id: 3, size: 48, color: 'bg-purple-500/20', animation: 'animate-float-fast' },
		{ id: 4, size: 54, color: 'bg-blue-500/20', animation: 'animate-float-medium-delayed' },
		{ id: 5, size: 50, color: 'bg-pink-500/20', animation: 'animate-float-slow-delayed' },
	];

	return (
		<div className='absolute inset-0 overflow-hidden'>
			{/* Circle 1 - Top Right */}
			<motion.div
				className={`absolute ${circles[0].color} rounded-full ${circles[0].animation}`}
				style={{
					width: circles[0].size,
					height: circles[0].size,
					top: '10%',
					right: '15%',
				}}
			/>

			{/* Circle 2 - Bottom Left */}
			<motion.div
				className={`absolute ${circles[1].color} rounded-full ${circles[1].animation}`}
				style={{
					width: circles[1].size,
					height: circles[1].size,
					bottom: '20%',
					left: '10%',
				}}
			/>

			{/* Circle 3 - Center Left */}
			<motion.div
				className={`absolute ${circles[2].color} rounded-full ${circles[2].animation}`}
				style={{
					width: circles[2].size,
					height: circles[2].size,
					top: '50%',
					left: '5%',
				}}
			/>

			{/* Circle 4 - Top Left */}
			<motion.div
				className={`absolute ${circles[3].color} rounded-full ${circles[3].animation}`}
				style={{
					width: circles[3].size,
					height: circles[3].size,
					top: '20%',
					left: '20%',
				}}
			/>

			{/* Circle 5 - Bottom Right */}
			<motion.div
				className={`absolute ${circles[4].color} rounded-full ${circles[4].animation}`}
				style={{
					width: circles[4].size,
					height: circles[4].size,
					bottom: '15%',
					right: '10%',
				}}
			/>
		</div>
	);
}
