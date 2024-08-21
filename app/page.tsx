import Image from "next/image";
import { logout } from "./logout/actions";
import DemoClientComponent from "./components/DemoClientComponent";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center h-dvh p-24">
      <DemoClientComponent />
      <form action={logout}>
        <button
          className="bg-realBlue text-white hover:bg-yellow-500 hover:text-black font-bold py-2 px-4 rounded"
          type="submit"
        >
          Logout
        </button>
      </form>
    </main>
  );
}
