import { useRouter } from "next/router";
import { useContext, useRef, useState } from "react";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { getFirebase } from "../../../lib/firebase";
import MetaTags from "../../../components/Metatags";

import { arrayUnion, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import Link from 'next/link';
import ImagePostUploader from '../../../components/ImagePostUploader';
import { TiptapEditor } from '../../../components/tiptap/TiptapEditor';
import TiptapExtensions from "../../../components/tiptap/TiptapExtensions";
import { useEditor } from "@tiptap/react";
import { UserContext } from "../../../lib/context";
import Modal from "../../../components/Modal";
import Image from "next/image";
import AdminCheck from "../../../components/AdminCheck";

const { auth, firestore } = getFirebase();

export default function AdminPostsEdit(props) {
    return (
        <AdminCheck>
            <PostManager />
        </AdminCheck>
    )
}

function PostManager() {
    const router = useRouter();
    const { uid, slug } = router.query;

    const postRef = doc(firestore, `users/${uid}/posts/${slug}`);
    const [post] = useDocumentData(postRef);

    return (
        <main className="mt-28 max-w-5xl px-4 py-4 bg-slate-50 rounded-xl mx-auto">
            { post && ( 
                <>
                    <MetaTags title={post.title} description={post?.description} image={post?.imageThumbnail} />
                    <PostForm postRef={postRef} defaultValues={post}/>
                </>
                )
            }
        </main>
    );
}

function PostForm({postRef, defaultValues}) {
    const { roles } = useContext(UserContext);
    
    const [categories, setCategories] = useState(defaultValues.categories ?? []);
    const [imageThumbnail, setImageThumbnail] = useState(defaultValues.imageThumbnail);
    const [images, setImages] = useState(defaultValues.images ?? []);
    const [content, setContent] = useState(defaultValues.content);
    const [plainHtml, setPlainHtml] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const editor = useEditor({
        extensions: TiptapExtensions,
        content: content,
    })

    const updateImages = async (url) => {
        try {
            setImages([...images, url]);
        } catch(error) {
            toast.error('update image error: '+error.toString());
        }
    }

    const removeCategory = (index) => {
        setCategories (categories => {
            return categories.filter((_, i) => i !== index)
          })
    }

    const categoryKeydown = (e) => { 
        const keyCode = e.keyCode ? e.keyCode : e.which; if (keyCode === 13) {
            e.preventDefault() 
            if(!categories.includes(e.target.value)) {
                setCategories ([...categories, e.target.value.toLowerCase()]);
            }
            e.target.value = '';
        }; 
    };

    const validURL = (str) => {
        var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
          '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
          '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
          '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
          '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
          '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
        return !!pattern.test(str);
    }

    const thumbnailKeydown = (e) => {
        const keyCode = e.keyCode ? e.keyCode : e.which; if (keyCode === 13) {
            e.preventDefault() 
            if(validURL(e.target.value)) {
                setImageThumbnail(e.target.value);
            } else {
                toast.error('URL image tidak valid!');
            }
        };
    }
    const contentKeydown = (e) => {
        setContent(e.target.value);
    }

    const setImage = (url) => {
        setImageThumbnail(url);
        editor.chain().focus().setImage({ src: url }).run()
    }

    const submitForm = async (e) => {
        e.preventDefault();
        const desc = e.target.description.value;
        const htmlContent = editor.getHTML()
        const published = e.target.published?.checked;
        
        let data = {
            content:htmlContent,
            imageThumbnail: imageThumbnail ?? '',
            images: images ?? [],
            categories: categories ?? [],
            description:desc,
            updatedAt: serverTimestamp(),
        }

        if(roles.includes('admin')) {
            data = {...data, published}
        }

        try {
            await updateDoc(postRef, data);
            const catgRef = doc(firestore, `simplelists/categories`);
            await updateDoc(catgRef, {
                names: arrayUnion(...categories)
            });
            if(roles.includes('admin') && published) {
                await fetch('/api/revalidate?path=/&secret=IniAdalahTokenKamu');
                await fetch('/api/revalidate?path=/'+defaultValues.username+'&secret=IniAdalahTokenKamu');
                await fetch('/api/revalidate?path=/'+defaultValues.username+'/'+defaultValues.slug+'&secret=IniAdalahTokenKamu');
            } 
        } catch (error) {
            toast.error(error.toString());
            return;
        }

        toast.success('Post updated successfully!');
    }

    const toggleHtml = () => {
        if(!plainHtml) {
            setContent(editor.getHTML());
        } else {
            editor.commands.setContent(content);
        }
        setPlainHtml(!plainHtml);
    }


    return (
        <>
            <form onSubmit={submitForm} >
                <div className='md:flex'>
                    <section className='w-full md:grow md:w-[480px] pr-4 pl-2'>
                        <h1>{defaultValues.title}</h1>
                        <p>ID: {defaultValues.slug}</p>
                        <div className="flex gap-2">
                            <span className="mt-4 px-4 py-2 rounded bg-slate-300 hover:bg-slate-200 cursor-pointer" onClick={() => toggleHtml()}>{plainHtml ? 'tiptap wyswyg' : 'plain html'}</span>
                            <span className="mt-4 px-4 py-2 rounded bg-slate-300 hover:bg-slate-200 cursor-pointer" onClick={() => setIsModalOpen(true)}>Images</span>
                        </div>
                            <div className="controls mt-2">

                                <ImagePostUploader setUrl={setImage} updateImages={updateImages} />
                                {
                                    plainHtml ? <textarea onKeyDown={(e) => contentKeydown(e)} defaultValue={content} /> : <TiptapEditor editor={editor} /> 
                                }

                                {
                                    roles.includes('admin') ?
                                    <fieldset className='my-4'>
                                        <label>Published</label>
                                        <input className="ml-4" name='published' type='checkbox' defaultChecked={defaultValues.published} />
                                    </fieldset> : <p></p>
                                }

                                <button type='submit' className='mt-4 px-4 py-2 bg-slate-300 hover:bg-slate-200 hover:font-semibold hover:text-green-500 disabled:cursor-not-allowed focus:outline-none disabled:opacity-75 cursor-pointer rounded' >
                                    Simpan
                                </button>
                            </div>
                    </section>

                    <aside className='w-full mt-6 md:mt-0 md:w-64 md:shrink p-4 bg-slate-200 rounded-lg'>
                        <Link href={`/${defaultValues.username}/${defaultValues.slug}`}><span className="py-2 px-4 bg-slate-300 hover:bg-slate-400 hover:text-white rounded-md mb-4"> View </span></Link>
                        <h3 className='font-semibold text-2xl mb-4 mt-4'>Deskripsi</h3>
                        <textarea name='description' rows="5" className="w-full p-2 rounded-md shadow-md" defaultValue={defaultValues.description}/>
                        <h3 className="font-semibold text-2xl mb-4">Image Thumbanil</h3>
                        <div className="flex">
                            <input type="text"
                                name="imageThumbnail"
                                className="w-full px-4 py-2 rounded mb-4 shadow-md" 
                                placeholder="Image thumbnail"
                                onKeyDown={(e) => thumbnailKeydown(e)}
                                />
                        </div>
                        <div>
                            <img src={imageThumbnail} />
                        </div>

                        <h3 className="font-semibold text-2xl my-4">Kategori</h3>
                        <input type="text" 
                            name="category" 
                            className="w-full px-4 py-2 rounded mb-4 shadow-md" 
                            placeholder="Kategori" 
                            onKeyDown={(e) => categoryKeydown(e)}
                            />
                        <ul>
                            {
                                categories?.map( (item, index) => (
                                    <li className="px-4 py-2 rounded-md font-mono bg-slate-50 hover:bg-slate-100 hover:font-semibold hover:shadow-md mb-2" key={index}>
                                        {item} <span className="p-2 rounded-lg hover:bg-slate-300 hover:bg-red" onClick={() => removeCategory(index)}> X </span>
                                    </li>       
                                ))
                            }               
                        </ul>
                    </aside>
                </div>
            </form>
            <Modal title="Images di post ini" isOpen={isModalOpen} closeButton={setIsModalOpen} >

                <div className="grid grid-cols-4 gap-4">
                    {
                        images?.map( (item, index) => (
                            <div className="bg-slate-100 rounded-md cursor-copy" onClick={() => {navigator.clipboard.writeText(item); toast('image URL Berhasil dicopy!');}} key={index}>
                                <Image src={item} width={200} height={200} alt={`image ke ${index}`}/>    
                            </div>       
                        ))
                    }               
                </div>

            </Modal> 
        </>
    );
}