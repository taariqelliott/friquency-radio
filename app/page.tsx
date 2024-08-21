import { logout } from "./logout/actions";
import DemoClientComponent from "./components/DemoClientComponent";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center h-svh p-24 mt-4">
      <DemoClientComponent />
      <form action={logout}>
        <button
          className="bg-realBlue text-white hover:bg-yellow-500 hover:text-black font-bold py-2 px-4 rounded"
          type="submit"
        >
          Logout
        </button>
      </form>
      <a href="/deets">
        <button className="bg-realBlue my-4 text-white hover:bg-yellow-500 hover:text-black font-bold py-2 px-4 rounded">
          To more details
        </button>
      </a>
    </main>
  );
}
