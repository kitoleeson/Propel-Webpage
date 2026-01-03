import Link from "next/link";

export default function Home() {
  return (
    <main>
      <Link className="text-blue-600"  href="/about">about</Link>
      <h1 className="bg-blue-300 pt-20 px-7 text-6xl font-bold">Helping students take charge of their learning.</h1>
      <h2 className="bg-blue-300 pt-5 pb-20 px-7 text-2xl">Personalized, student-led tutoring that adapts to how you learn best.</h2>
      <p className="font-bold mt-5">One-size-fits-all teaching doesn't work / Every student learns differently.</p>
      <p>
        Propel provides personalized tutoring that adapts to individual goals, pace, and learning style.
        We meet students where they are, guide with intention, and raise their confidence and skills to new heights.
        We help students understand how they learn best, and let them show us how best to help them.
      </p>
    </main>
  );
}