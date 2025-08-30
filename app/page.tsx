import GoogleSignInButton from "@/components/atoms/GoogleSignInButton";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8">
      <main className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mt-4 text-primary">StickyNoter</h1>
          <p className="mt-2 text-muted-foreground">Your digital sticky note application</p>
          
          <div className="mt-8 max-w-sm mx-auto">
            <GoogleSignInButton />
          </div>
        </div>
      </main>
    </div>
  );
}
