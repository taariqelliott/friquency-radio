import { anonymousSignIn, login, signup } from "./actions";
import "../globals.css";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center h-dvh">
      <div className="absolute inset-0 bg-radio bg-cover bg-center blur-md z-0"></div>
      <form className=" relative bg-white p-4 rounded-lg shadow-lg w-96">
        <div className="space-y-4">
          <h1 className="text-center [word-spacing:-3px] tracking-tight text-realBlue font-bold text-3xl">
            Friquency Radio
          </h1>
          <label htmlFor="email" className="block text-black">
            Email:
            <input
              id="email"
              name="email"
              type="email"
              required
              className="block w-full px-4 py-2 border-2 border-gray-300 font-bold rounded-md text-white"
            />
          </label>
          <label htmlFor="password" className="block text-black">
            Password:
            <input
              id="password"
              name="password"
              type="password"
              required
              className="block w-full px-4 py-2 border-2 border-gray-300 font-bold rounded-md text-white"
            />
          </label>
          <div className="flex justify-center items-center space-x-4">
            <button
              className="bg-realBlue text-sm [word-spacing:-3px] text-white font-bold py-3 px-4 rounded border-2 border-transparent hover:bg-yellow-500 hover:text-black hover:border-realBlue hover:border-2 transition-all duration-100"
              formAction={login}
            >
              Log in
            </button>
            <button
              className="bg-realBlue text-sm [word-spacing:-3px] text-white font-bold py-3 px-4 rounded border-2 border-transparent hover:bg-yellow-500 hover:text-black hover:border-realBlue hover:border-2 transition-all duration-100"
              formAction={signup}
            >
              Sign up
            </button>
            <button
              className="bg-realBlue text-sm [word-spacing:-3px] text-white font-bold py-3 px-4 rounded border-2 border-transparent hover:bg-yellow-500 hover:text-black hover:border-realBlue hover:border-2 transition-all duration-100"
              formAction={anonymousSignIn}
            >
              Anon Sign In
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
