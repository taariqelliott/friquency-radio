export default function page({ params }: { params: { id: string } }) {
  const { id } = params;

  return (
    <div className="flex flex-col items-center justify-center h-dvh">
      <div className="text-3xl text-green-500">
        📡 Now listening to Radio Station{" "}
        <span className="text-pink-500 font-extrabold">{id}</span> 📡
      </div>
    </div>
  );
}
