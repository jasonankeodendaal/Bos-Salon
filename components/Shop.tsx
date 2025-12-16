
import React from 'react';

interface Product {
    id: number;
    name: string;
    description: string;
    price: string;
    imageUrl: string;
}

const products: Product[] = [
    { id: 1, name: 'Tattoo Ink (100ml)', description: 'Tasit egestas amet nietus luctus iaculis.', price: '50 USD', imageUrl: 'https://picsum.photos/400/400?random=8' },
    { id: 2, name: 'Tattoo Ink (500ml)', description: 'Tasit egestas amet nietus luctus iaculis.', price: '150 USD', imageUrl: 'https://picsum.photos/400/400?random=9' },
    { id: 3, name: 'Tattoo Ink (Color Pack)', description: 'Tasit egestas amet nietus luctus iaculis.', price: '200 USD', imageUrl: 'https://picsum.photos/400/400?random=10' },
    { id: 4, name: 'Tattoo Machine (Model X)', description: 'Tasit egestas amet nietus luctus iaculis.', price: '500 USD', imageUrl: 'https://picsum.photos/400/400?random=11' },
];

const Shop: React.FC = () => {
    return (
        <section className="bg-brand-dark py-20">
            <div className="container mx-auto px-4 text-center">
                <h2 className="font-display text-6xl md:text-7xl mb-4">SHOP</h2>
                <p className="text-gray-400 mb-12 max-w-2xl mx-auto">
                    Praesent ut vitae tempus sollicitudin praesent id Viverra. Magna nisl egestas amet nietus luctus iaculis.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.map(product => (
                        <div key={product.id} className="bg-brand-gray p-6 rounded-lg text-left">
                            <div className="bg-black rounded-md mb-6 flex items-center justify-center p-4">
                                <img src={product.imageUrl} alt={product.name} className="h-48 w-full object-contain rounded-md" />
                            </div>
                            <h3 className="font-bold text-xl mb-2">{product.name}</h3>
                            <p className="text-gray-400 text-sm mb-4">{product.description}</p>
                            <p className="font-bold text-brand-red">{product.price}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Shop;
