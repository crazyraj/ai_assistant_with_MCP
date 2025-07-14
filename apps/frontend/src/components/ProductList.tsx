import { useStore } from '@tanstack/react-store';
import { guitarList } from '../store/assistant';

export default function ProductList({ ids }: { ids: string[] }) {
	const guitars = useStore(guitarList);
	const products = guitars.filter((g) => ids.includes(g.id.toString()));

	if (!products.length) {
		return <div className='text-gray-400'>No products found.</div>;
	}

	return (
		<div className='grid grid-cols-1 md:grid-cols-2 gap-4 my-4'>
			{products.map((guitar) => (
				<div
					key={guitar.id}
					className='rounded-lg overflow-hidden border border-orange-500/20 bg-gray-800/50'>
					<img
						src={guitar.image}
						alt={guitar.name}
						className='w-full h-40 object-cover'
					/>
					<div className='p-4'>
						<h3 className='text-lg font-semibold text-white mb-2'>
							{guitar.name}
						</h3>
						<p className='text-sm text-gray-300 mb-3 line-clamp-2'>
							{guitar.shortDescription}
						</p>
						<div className='flex items-center justify-between'>
							<div className='text-lg font-bold text-emerald-400'>
								${guitar.price}
							</div>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
