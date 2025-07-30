'use client';

export default function GiftSuggestions() {
  const gifts = [
    { emoji: '📚', name: 'Children\'s Books', description: 'Board books and picture books' },
    { emoji: '🧸', name: 'Soft Toys', description: 'Plush animals and comfort toys' },
    { emoji: '🎨', name: 'Art Supplies', description: 'Crayons, finger paints (non-toxic)' },
    { emoji: '🎵', name: 'Musical Toys', description: 'Baby instruments and music boxes' },
    { emoji: '👶', name: 'Clothing', description: 'Size 12-18 months in pastel colors' },
    { emoji: '🏃‍♀️', name: 'Active Play', description: 'Push toys and ride-on toys' }
  ];

  return (
    <div className="max-w-4xl mx-auto mt-16 mb-8">
      <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
        <h3 className="text-3xl font-bold text-pink-600 text-center mb-8" 
            style={{ fontFamily: 'Dancing Script, cursive' }}>
          Gift Ideas for Our Little Princess 🎁
        </h3>
        
        <p className="text-center text-pink-500 mb-8">
          Your presence is the best present, but if you'd like to bring something special...
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gifts.map((gift, index) => (
            <div 
              key={index}
              className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-2xl text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <div className="text-4xl mb-3">{gift.emoji}</div>
              <h4 className="font-semibold text-pink-700 mb-2">{gift.name}</h4>
              <p className="text-pink-500 text-sm">{gift.description}</p>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-8 p-6 bg-pink-50 rounded-2xl">
          <p className="text-pink-600 font-medium">
            💝 No gifts necessary - just bring your love and smiles! 💝
          </p>
        </div>
      </div>
    </div>
  );
}
