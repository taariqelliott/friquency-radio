import { Suspense } from "react";
import Spinner from "../components/Spinner";

export default function ErrorPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <div className="flex flex-col items-center justify-center h-dvh">
        <p>Sorry, something went wrong...</p>
      </div>
    </Suspense>
  );
}
