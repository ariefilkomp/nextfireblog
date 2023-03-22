import { doc, getDoc } from "firebase/firestore";
import { getFirebase } from "../../lib/firebase";
import Link from "next/link";
import React from "react";
import MetaTags from "../../components/Metatags";

const { firestore } = getFirebase();
export async function getStaticProps() {
  const catRef = doc(firestore, "simplelists/categories");
  const categories = (await getDoc(catRef)).data().names;

  return {
    props: { categories },
    revalidate: 60 * 60 * 24 * 7,
  };
}

function Categories(props) {
  return (
    <main className="max-w-4xl mx-auto mt-24 px-4 lg:mt-28 min-h-[900px]">
      <MetaTags title={`ariefff.com - Pilih kategori yang kamu suka`} description={`ini adalah halaman yang memuat semua kategori di ariefff.com`} />
      <section className="">
        <header className="mb-4">
          <h1 className="px-4 text-3xl font-sans font-bold text-slate-700">
            Kategori Tentang?
          </h1>
        </header>
        <div className="flex flex-wrap">
          {props.categories?.map((value, index) => {
            return (
              <Link
                href={`/categories/${value}`}
                className={`my-2 px-4 py-2 mx-4 text-secondary bg-slate-200 rounded-md shadow hover:bg-slate-50 hover:text-slate-700`}
                key={index}
              >
                {value}
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}

export default Categories;
