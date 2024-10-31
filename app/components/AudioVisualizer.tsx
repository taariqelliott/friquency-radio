export const AudioVisualizer = ({ data }: { data: number[] }) => {
  return (
    <div className="w-full max-w-3xl h-24 bg-gray-800 rounded-lg p-2 mb-4">
      <div className="flex h-full items-end justify-center gap-0.5">
        {data.map((value, index) => (
          <div
            key={index}
            className="w-1 bg-gradient-to-t from-blue-500 to-purple-500 rounded-t"
            style={{
              height: `${(value / 255) * 100}%`,
              transition: 'height 0.1s ease-in-out'
            }}
          />
        ))}
      </div>
    </div>
  );
};